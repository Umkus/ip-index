import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const asns = {};

readFileSync(`${__dirname}/../data/asns.csv`).toString().split(/\s+/).forEach((item, index) => {
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
readFileSync(`${__dirname}/../data/asns_dcs.csv`).toString().split(/\s+/)
  .forEach((asn) => {
    dcAsns[asn] = true;
  });

const asnCidrs = {}
const rangesIndexed = {};

readFileSync(`${__dirname}/../data/asns_cidrs.csv`).toString()
  .split(/\s+/)
  .filter((i) => i)
  .forEach((item, index) => {
    if (!index) {
      return null;
    }

    const [asn, cidr, first, last, country] = item.split(',');

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
      country,
    };

    if (!asnCidrs[asn]) {
      asnCidrs[asn] = []
    }

    asnCidrs[asn].push(cidr)

    if (asns[asn]) {
      asns[asn].subnetsNum = (asns[asn].subnetsNum || 0) + 1;
    }

    rangesIndexed[rangeIndex].push(range);
  });

function ipToInt(ip) {
  return ip.trim().split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

export function getAsnInfo(asn) {
  if (!asns[asn]) {
    return null
  }

  return { ...asns[asn], subnets: asnCidrs[asn] || [] }
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
