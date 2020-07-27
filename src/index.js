const sqlite3 = require('better-sqlite3');

function ip2int(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

class IpIndex {
  constructor(dbFile = '../dist/ip-index.db') {
    const db = sqlite3(dbFile);

    db.pragma('journal_mode = memory;');
    db.pragma('synchronous = off;');
    db.pragma('automatic_index = off;');

    this.selectBlacklists = db.prepare('SELECT 1 FROM blacklisted WHERE start = ? AND ? between first AND last LIMIT 1');
    this.selectDatacenters = db.prepare('SELECT 1 FROM datacenters WHERE start = ? AND ? between first AND last LIMIT 1');
    this.selectCountries = db.prepare('SELECT country FROM countries WHERE start = ? AND ? between first AND last LIMIT 1');
  }

  isBlacklisted(ip) {
    const start = +ip.split('.')[0];
    const ipInt = ip2int(ip);

    return !!this.selectBlacklists.pluck().get(start, ipInt);
  }

  isDatacenter(ip) {
    const start = +ip.split('.')[0];
    const ipInt = ip2int(ip);

    return !!this.selectDatacenters.pluck().get(start, ipInt);
  }

  getCountry(ip) {
    const start = +ip.split('.')[0];
    const ipInt = ip2int(ip);

    return this.selectCountries.pluck().get(start, ipInt);
  }
}

module.exports = IpIndex;
