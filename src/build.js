const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const axios = require('axios');
const path = require('path');
const extract = require('extract-zip');
const sqlite3 = require('better-sqlite3');
const matches = require('./matches');

const { TOKEN } = process.env;
const fsParams = { encoding: 'ascii' };
const distPath = `${__dirname}/../dist`;
const dbPath = `${distPath}/ip-index.db`;

function ip2int(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function calculateRange(cidr) {
  const [ip, bits = 32] = cidr.split('/');
  const min = ip2int(ip);
  const max = min + 2 ** (32 - bits) - 1;

  return [min, max];
}

const db = sqlite3(dbPath);

db.pragma('journal_mode = memory;');
db.pragma('synchronous = off;');
db.pragma('auto_vacuum = FULL;');
db.pragma('automatic_index = off;');

db.exec('DROP TABLE IF EXISTS blacklisted;');
db.exec('DROP TABLE IF EXISTS countries;');
db.exec('DROP TABLE IF EXISTS datacenters;');
db.exec('DROP TABLE IF EXISTS asns;');
db.exec('CREATE TABLE blacklisted (start TINYINT, first INT, last INT);');
db.exec('CREATE TABLE datacenters (start TINYINT, first INT, last INT);');
db.exec('CREATE TABLE countries (start TINYINT, first INT, last INT, country CHAR(2));');
db.exec('CREATE TABLE asns (start TINYINT, first INT, last INT, id INT, name VARCHAR(64));');
// TODO: Figure out why indices don't help with range queries
// TODO: Indices double the size of the database (70 -> 140 MB)
db.exec('CREATE INDEX blacklisted_uniq ON blacklisted (start, first, last)');
db.exec('CREATE INDEX countries_uniq ON countries (start, first, last)');
db.exec('CREATE INDEX datacenters_uniq ON datacenters (start, first, last)');
db.exec('CREATE INDEX asns_uniq ON asns (start, first, last)');
const insertBlacklisted = db.prepare('INSERT OR IGNORE INTO blacklisted VALUES (?,?,?)');
const insertDatacenter = db.prepare('INSERT OR IGNORE INTO datacenters VALUES (?,?,?)');
const insertCountry = db.prepare('INSERT OR IGNORE INTO countries VALUES (?,?,?,?)');
const insertAsn = db.prepare('INSERT OR IGNORE INTO asns VALUES (?,?,?,?, ?)');

async function getZip(url, dest) {
  console.log(`Downloading ${dest}...`);

  const zipFile = `${distPath}/${dest}.zip`;
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'arraybuffer',
    params: {
      token: TOKEN,
      file: 'DBASNLITE',
    },
  });

  await fs.writeFileSync(zipFile, response.data);
  await extract(zipFile, { dir: path.resolve(`${distPath}/${dest}/`) });

  return true;
}

async function main() {
  await getZip(`https://www.ip2location.com/download/?token=${TOKEN}&file=DBASNLITE`, 'asns');
  await getZip('https://github.com/firehol/blocklist-ipsets/archive/master.zip', 'firehol');

  console.log('Building blacklisted ranges...');

  const fireholDir = `${distPath}/firehol/blocklist-ipsets-master`;

  let blacklistedRanges = new Set();
  fs.readdirSync(fireholDir).forEach((file) => {
    if (/^(iblocklist_isp|firehol_level4|datacenters)/i.test(file) || !/netset$/.test(file)) {
      return false;
    }

    fs.readFileSync(`${fireholDir}/${file}`, fsParams).split(/\r?\n/)
      .forEach((cidr) => {
        if (/^[0-9]/.test(cidr)) {
          blacklistedRanges.add(cidr);
        }
      });

    return true;
  });

  db.exec('BEGIN TRANSACTION;');
  blacklistedRanges = [...blacklistedRanges.values()].map((cidr) => {
    const [first, last] = calculateRange(cidr);
    const start = (first >> 24) & 0xFF;
    insertBlacklisted.run(start, first, last);

    return cidr;
  });
  db.exec('COMMIT;');

  fs.writeFileSync(`${distPath}/blacklisted.netset`, blacklistedRanges.join('\n'));

  console.log('Building country ranges...');

  const countryRanges = [];
  const countryDir = `${distPath}/firehol/blocklist-ipsets-master/geolite2_country`;

  db.exec('BEGIN TRANSACTION;');
  fs.readdirSync(countryDir)
    .forEach((file) => {
      const [, country] = file.match(/country_([a-z]{2})\.netset/i) || [];

      if (!country) {
        return false;
      }

      fs.readFileSync(`${countryDir}/${file}`, fsParams)
        .split(/\r?\n/)
        .forEach((cidr) => {
          if (/^[0-9]/.test(cidr)) {
            countryRanges.push(`${cidr},${country}`);
            const [first, last] = calculateRange(cidr);
            const start = (first >> 24) & 0xFF;
            insertCountry.run(start, first, last, country);
          }
        });

      return true;
    });
  db.exec('COMMIT;');

  fs.writeFileSync(`${distPath}/countries.csv`, countryRanges.join('\n'));

  console.log('Building data-center ranges...');

  const asnFile = `${distPath}/asns/IP2LOCATION-LITE-ASN.CSV`;

  const asns = parse(fs.readFileSync(asnFile, fsParams), {
    skip_empty_lines: true,
    columns: ['first', 'last', 'cidr', 'id', 'name'],
  });

  db.exec('BEGIN TRANSACTION;');
  const dcAsns = asns.filter((item) => {
    const [first, last] = calculateRange(item.cidr);
    const start = (first >> 24) & 0xFF;
    insertAsn.run(start, first, last, item.id, item.name);

    if (item.id === '-') {
      return true;
    }

    if (matches.asns.includes(+item.id)) {
      return true;
    }

    if (matches.good.find((goodPattern) => goodPattern.test(item.name))) {
      return false;
    }

    if (matches.bad.find((badPattern) => badPattern.test(item.name))) {
      return true;
    }

    return false;
  });
  db.exec('COMMIT;');

  db.exec('BEGIN TRANSACTION;');
  dcAsns.forEach((item) => {
    const start = (item.first >> 24) & 0xFF;
    insertDatacenter.run(start, item.first, item.last);
  });
  db.exec('COMMIT;');

  fs.writeFileSync(`${distPath}/datacenters.netset`, dcAsns.map((item) => item.cidr).sort().join('\n'));
}

main();
