const fs = require('fs');
const {resolve} = require('path');

function ip2int(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function calculateCidrRange(cidr) {
  const [ip, bits = 32] = cidr.split('/');

  const min = ip2int(ip);
  const max = min + 2 ** (32 - bits) - 1;

  return [min, max];
}

const badIps = fs.readFileSync(`${resolve()}/../dist/bad-ips.netset`, {encoding: 'ascii'}).split(/\r?\n/);
const dcIps = fs.readFileSync(`${resolve()}/../dist/datacenters.netset`, {encoding: 'ascii'}).split(/\r?\n/);
const allIps = badIps.concat(dcIps);
const ipdb = [];

allIps.forEach((cidr) => {
  const [first, last] = calculateCidrRange(cidr);
  const start = (first >> 24) & 0xFF;

  ipdb[start] = ipdb[start] || [];
  ipdb[start].push([first, last]);
});

function lookup(ip) {
  const start = +ip.split('.')[0];
  const ipInt = ip2int(ip);

  return (ipdb[start] || []).find((range) => ipInt >= range[0] && ipInt <= range[1]);
}

module.exports = lookup;
