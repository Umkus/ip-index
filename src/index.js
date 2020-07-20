const {readFile} = require('fs');
const {promisify} = require('util');

const readFileAsync = promisify(readFile);
const fsParams = {encoding: 'ascii'};

class BlockList {
  constructor(dataPath = '../dist') {
    this.dataPath = dataPath;
    this.db = [];
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

  contains(ip) {
    const start = +ip.split('.')[0];
    const ipInt = this.ip2int(ip);

    return !!(this.db[start] || []).find((range) => ipInt >= range[0] && ipInt <= range[1]);
  }
}

module.exports = BlockList;
