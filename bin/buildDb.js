const { readFile, unlinkSync } = require('fs');
const { promisify } = require('util');

const sqlite3 = require('better-sqlite3');

const distPath = `${__dirname}/../dist/`;
const dbPath = `${distPath}/ipinfo.db`;

try {
  unlinkSync(dbPath);
} catch (e) {
  console.log(e);
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

const db = sqlite3(dbPath);

const readFileAsync = promisify(readFile);
const fsParams = { encoding: 'ascii' };

db.pragma('journal_mode = memory;');
db.pragma('synchronous = off;');
db.pragma('auto_vacuum = FULL;');
db.pragma('automatic_index = off;');

db.exec('DROP TABLE IF EXISTS blacklisted;');
db.exec('DROP TABLE IF EXISTS countries;');
db.exec('DROP TABLE IF EXISTS datacenters;');
db.exec('CREATE TABLE blacklisted (start TINYINT, first INT, last INT);');
db.exec('CREATE TABLE datacenters (start TINYINT, first INT, last INT);');
db.exec('CREATE TABLE countries (start TINYINT, first INT, last INT, country CHAR(2));');
// TODO: Figure out why indices don't help with range queries
// TODO: Indices double the size of the database (70 -> 140 MB)
db.exec('CREATE INDEX blacklisted_uniq ON blacklisted (start, first, last)');
db.exec('CREATE INDEX countries_uniq ON countries (start, first, last)');
db.exec('CREATE INDEX datacenters_uniq ON datacenters (start, first, last)');
const insertBlacklisted = db.prepare('INSERT OR IGNORE INTO blacklisted VALUES (?,?,?)');
const insertDatacenter = db.prepare('INSERT OR IGNORE INTO datacenters VALUES (?,?,?)');
const insertCountry = db.prepare('INSERT OR IGNORE INTO countries VALUES (?,?,?,?)');

Promise.all([
  readFileAsync(`${distPath}/blacklisted.netset`, fsParams),
  readFileAsync(`${distPath}/datacenters.netset`, fsParams),
  readFileAsync(`${distPath}/countries.csv`, fsParams),
])
  .then(([blacklistedIps, datacenterIps, countryIps]) => {
    db.exec('BEGIN TRANSACTION;');
    countryIps.split(/\r?\n/).forEach((line) => {
      const [cidr, country] = line.split(',');

      if (cidr && country) {
        const [first, last] = calculateRange(cidr);
        const start = (first >> 24) & 0xFF;
        insertCountry.run(start, first, last, country);
      }
    });
    db.exec('COMMIT;');

    db.exec('BEGIN TRANSACTION;');
    blacklistedIps.split(/\r?\n/).forEach((cidr) => {
      const [first, last] = calculateRange(cidr);
      const start = (first >> 24) & 0xFF;

      insertBlacklisted.run(start, first, last);
    });
    db.exec('COMMIT;');

    db.exec('BEGIN TRANSACTION;');
    datacenterIps.split(/\r?\n/).forEach((cidr) => {
      const [first, last] = calculateRange(cidr);
      const start = (first >> 24) & 0xFF;

      insertDatacenter.run(start, first, last);
    });
    db.exec('COMMIT;');
  })
  .then(() => {
    db.exec('VACUUM;');
  });
