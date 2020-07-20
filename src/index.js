const fs = require('fs');

function ip2int(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function calculateCidrRange(cidr) {
  const [ip, bits = 32] = cidr.split('/');

  const min = ip2int(ip);
  const max = min + 2 ** (32 - bits) - 1;

  return [min, max];
}

function buildDb(path = '../dist') {
  const badIps = fs.readFileSync(`${path}/bad-ips.netset`, {encoding: 'ascii'}).split(/\r?\n/);
  const dcIps = fs.readFileSync(`${path}/datacenters.netset`, {encoding: 'ascii'}).split(/\r?\n/);
  const allIps = badIps.concat(dcIps);
  const db = [];

  allIps.forEach((cidr) => {
    const [first, last] = calculateCidrRange(cidr);
    const start = (first >> 24) & 0xFF;

    db[start] = db[start] || [];
    db[start].push([first, last]);
  });

  return {
    contains: (ip) => lookup(ip, db),
  };
}

function lookup(ip, db) {
  const start = +ip.split('.')[0];
  const ipInt = ip2int(ip);

  return !!(db[start] || []).find((range) => ipInt >= range[0] && ipInt <= range[1]);
}

module.exports = {buildDb};
