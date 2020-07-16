const fs = require('fs');

function ip2int(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function int2ip(int) {
  return [(int >>> 24) & 0xFF, (int >>> 16) & 0xFF, (int >>> 8) & 0xFF, int & 0xFF].join('.')
}

function calculateCidrRange(cidr) {
  let [range, bits = 32] = cidr.split('/');
  const mask = ~(2 ** (32 - bits) - 1);

  range = ip2int(range);

  return [(range >> 24) & 0xFF, range & mask, range | ~mask];
}

const badIps = fs.readFileSync('../dist/bad-ips.netset', {encoding: 'ascii'}).split(/\r?\n/);
const dcIps = fs.readFileSync('../dist/datacenters.netset', {encoding: 'ascii'}).split(/\r?\n/);
const allIps = badIps.concat(dcIps);
const ipdb = [];

allIps.forEach((cidr) => {
  const [start, first, last] = calculateCidrRange(cidr);
  ipdb[start] = ipdb[start] || [];
  ipdb[start].push([first, last]);
});

function lookup(ip) {
  const start = +ip.split('.')[0];
  const ipInt = ip2int(ip);
  return ipdb[start].find((range) => ipInt >= range[0] && ipInt <= range[1]);
}

module.exports = lookup;
