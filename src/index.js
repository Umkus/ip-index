const { readFileSync } = require('fs');

const eu = [
  'at',
  'be',
  'bg',
  'hr',
  'cy',
  'cz',
  'dk',
  'ee',
  'fi',
  'fr',
  'de',
  'gr',
  'hu',
  'ie',
  'it',
  'lv',
  'lt',
  'lu',
  'mt',
  'nl',
  'pl',
  'pt',
  'ro',
  'sk',
  'si',
  'es',
  'se',
  'gb',
  'gf',
  'gp',
  'mq',
  'me',
  'yt',
  're',
  'mf',
];

const ranges = readFileSync('../dist/ip2asn.tsv').toString().split(/\n/).map((item) => {
  const fields = item.split(/\t/);
  return {
    start: +fields[0],
    end: +fields[1],
    first: intToIp(+fields[0]),
    last: intToIp(+fields[1]),
    asn: +fields[2],
    country: fields[3],
    name: fields[4],
    datacenter: !!+fields[5],
    eu: eu.includes(fields[3] ? fields[3].toLowerCase() : null)
  };
});

function intToIp(int) {
  const part1 = int & 255;
  const part2 = ((int >> 8) & 255);
  const part3 = ((int >> 16) & 255);
  const part4 = ((int >> 24) & 255);

  return `${part4}.${part3}.${part2}.${part1}`;
}

function ipToInt(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function getIpInfo(ip) {
  const ipInt = ipToInt(ip);
  let asn = ranges
    .filter((range) => range.start <= ipInt && range.end >= ipInt)
    .sort((a, b) => a.end - a.start >= b.end - b.start ? 1 : -1)
    .shift();

  delete asn.start;
  delete asn.end;

  asn.country = asn.country.toLowerCase();

  return asn;
}

module.exports = {
  getIpInfo,
};

