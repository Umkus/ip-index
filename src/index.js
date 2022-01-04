import { readFileSync } from 'fs';

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

const rangesIndexed = {};

readFileSync('../data/asns_cidrs.csv').toString()
  .split(/\n/)
  .filter((i) => i)
  .forEach((item, index) => {
    if (!index) {
      return null;
    }

    const [asn, cidr, first, last] = item.split(',');

    const rangeIndex = +cidr.split('.')[0];

    if (!rangesIndexed[rangeIndex]) {
      rangesIndexed[rangeIndex] = [];
    }

    const range = {
      start: +first,
      end: +last,
      subnet: cidr,
      asn: +asn,
      hosting: !!dcAsns[asn],
    };

    if (asns[asn]) {
      asns[asn].subnetsNum = asns[asn].subnetsNum || 0;
      asns[asn].subnets = asns[asn].subnets || [];
      asns[asn].subnets.push(cidr);
      asns[asn].subnetsNum = asns[asn].subnets.length;
    }

    rangesIndexed[rangeIndex].push(range);
  });

function ipToInt(ip) {
  return ip.trim().split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

export function getIpInfo(ip) {
  const ipIndex = ip.split(/[.:]/)[0];
  const ipInt = ipToInt(ip);

  if (!rangesIndexed[ipIndex]) {
    return [];
  }

  return rangesIndexed[ipIndex]
    .filter((range) => range && +range.start <= ipInt && +range.end >= ipInt)
    .map((match) => ({ ...match, ...asns[match.asn] }));
}
