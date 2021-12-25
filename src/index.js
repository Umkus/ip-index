const { readFileSync } = require('fs');

const asns = {};

readFileSync('../data/asns.csv').toString().split(/\n/).forEach((item, index) => {
  if (!index) {
    return undefined;
  }

  const [asn, handle, description] = item.split(',');

  asns[asn] = {
    handle,
    description: (description || '').trim().replace(/"/g, ''),
  };
});

const dcAsns = {};
readFileSync('../data/asns_dcs.csv').toString().split(/\n/)
  .forEach((asn) => {
    dcAsns[asn] = true;
  });

const ranges = readFileSync('../data/asns_cidrs.csv').toString()
  .split(/\n/)
  .filter((i) => i)
  .map((item, index) => {
    if (!index) {
      return null;
    }

    const [asn, cidr, first, last] = item.split(',');

    return {
      start: +first,
      end: +last,
      cidr,
      asn: +asn,
      name: (asns[asn] || {}).description || 'N/A',
      handle: (asns[asn] || {}).handle || 'N/A',
      datacenter: !!dcAsns[asn],
    };
  });

function ipToInt(ip) {
  return ip.trim().split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function getIpInfo(ip) {
  const ips = ip.split(',');
  const ipsInt = ips.map(ipToInt);
  const matches = [];

  ranges.forEach((range) => {
    if (!range) {
      return false;
    }

    for (let index in ipsInt) {
      if (+range.start <= ipsInt[index] && +range.end >= ipsInt[index]) {
        const res = { ip: ips[index], ...range };
        delete res.start;
        delete res.end;

        matches.push(res);
      }
    }
  });

  return matches;
}

module.exports = {
  getIpInfo,
};

