const {readFile, unlinkSync} = require('fs');
const {promisify} = require('util');
const sqlite3 = require('better-sqlite3');

const distPath = `${__dirname}/../dist/`;

try {
  unlinkSync(distPath);
} catch (e) {
}

function ip2int(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function calculateRange(cidr) {
  const [ip, bits = 32] = cidr.split('/');
  const min = ip2int(ip);
  const max = min + 2 ** (32 - bits) - 1;

  return [min, max];
}

const db = sqlite3(`${distPath}/blocklist.db`);

const readFileAsync = promisify(readFile);
const fsParams = {encoding: 'ascii'};

db.pragma('journal_mode = memory;');
db.pragma('synchronous = off;');
db.pragma('auto_vacuum = FULL;');
db.pragma('automatic_index = off;');

db.exec('DROP TABLE IF EXISTS ips;');
db.exec('DROP TABLE IF EXISTS countries;');
db.exec('CREATE TABLE ips (start TINYINT, first INT, last INT);');
db.exec('CREATE TABLE countries (start TINYINT, first INT, last INT, country CHAR(2));');
db.exec('CREATE INDEX ip_uniq ON ips (start, first, last)');
db.exec('CREATE INDEX country_uniq ON countries (start, first, last)');
db.exec('BEGIN TRANSACTION;');
const insertIp = db.prepare('INSERT OR IGNORE INTO ips VALUES (?,?,?)');
const insertCountry = db.prepare('INSERT OR IGNORE INTO countries VALUES (?,?,?,?)');

Promise.all([
  readFileAsync(`${distPath}/bad-ips.netset`, fsParams),
  readFileAsync(`${distPath}/datacenters.netset`, fsParams),
  readFileAsync(`${distPath}/countries.csv`, fsParams)
])
  .then(([badIps, dcIps, countryIps]) => {
    const allBlocks = [].concat(badIps.split(/\r?\n/), dcIps.split(/\r?\n/));

    countryIps.split(/\r?\n/).forEach((line) => {
      const [cidr, country] = line.split(',');

      if (cidr && country) {
        const [first, last] = calculateRange(cidr);
        const start = (first >> 24) & 0xFF;
        insertCountry.run(start, first, last, country);
      }
    });

    allBlocks.forEach((cidr) => {
      const [first, last] = calculateRange(cidr);
      const start = (first >> 24) & 0xFF;

      insertIp.run(start, first, last);
    });
  })
  .then(() => {
    db.exec('COMMIT;');
    db.exec('VACUUM;');
  });
