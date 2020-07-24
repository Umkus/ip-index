const {readFile} = require('fs');
const {promisify} = require('util');
const sqlite3 = require('better-sqlite3');

const readFileAsync = promisify(readFile);
const fsParams = {encoding: 'ascii'};

class IpInfo {
  constructor(dbFile = '../dist/blocklist.db') {
    const db = sqlite3(dbFile);

    db.pragma('journal_mode = memory;');
    db.pragma('synchronous = off;');
    db.pragma('automatic_index = off;');

    this.selectBlacklists = db.prepare('SELECT 1 FROM blacklisted WHERE start = ? AND ? between first AND last LIMIT 1');
    this.selectDatacenters = db.prepare('SELECT 1 FROM datacenters WHERE start = ? AND ? between first AND last LIMIT 1');
    this.selectCountries = db.prepare('SELECT country FROM countries WHERE start = ? AND ? between first AND last LIMIT 1');
  }

  ip2int(ip) {
    return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
  }

  calculateRange(cidr) {
    const [ip, bits = 32] = cidr.split('/');
    const min = this.ip2int(ip);
    const max = min + 2 ** (32 - bits) - 1;

    return [min, max];
  }

  build() {
    return Promise.all([
      readFileAsync(`${this.dataPath}/bad-ips.netset`, fsParams),
      readFileAsync(`${this.dataPath}/datacenters.netset`, fsParams)
    ])
      .then(([badIps, dcIps]) => {
        const allIps = [].concat(badIps.split(/\r?\n/), dcIps.split(/\r?\n/));

        allIps.forEach((cidr) => {
          const [first, last] = this.calculateRange(cidr);
          const start = (first >> 24) & 0xFF;

          this.db[start] = this.db[start] || [];
          this.db[start].push([first, last]);
        });
      });
  }

  isBlacklisted(ip) {
    const start = +ip.split('.')[0];
    const ipInt = this.ip2int(ip);

    return !!this.selectBlacklists.pluck().get(start, ipInt);
  }

  isDatacenter(ip) {
    const start = +ip.split('.')[0];
    const ipInt = this.ip2int(ip);

    return !!this.selectDatacenters.pluck().get(start, ipInt);
  }

  getCountry(ip) {
    const start = +ip.split('.')[0];
    const ipInt = this.ip2int(ip);

    return this.selectCountries.pluck().get(start, ipInt);
  }
}

module.exports = IpInfo;
