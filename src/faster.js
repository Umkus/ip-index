const fs = require('fs');

function ip2int(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

function calculateRange(cidr) {
  const [ip, bits = 32] = cidr.split('/');
  const first = ip2int(ip);
  const last = first + 2 ** (32 - bits) - 1;

  return [first, last];
}

function find(ip, subnets, file) {
  const targetInt = ip2int(ip);

  console.time(`${ip} in ${file}`);

  const targetSubnets = subnets[ip.split('.')[0]];
  let match;

  for (const subnet of targetSubnets) {
    if (subnet.range[0] <= targetInt && subnet.range[1] >= targetInt) {
      match = { ...subnet };
      delete match.range;
      break;
    }
  }

  console.timeEnd(`${ip} in ${file}`);

  return match;
}

function build(file, fields = ['cidr']) {
  console.time(file);

  const rows = fs.readFileSync(`../dist/${file}`, { encoding: 'utf8' }).split(/\r?\n/g);
  const res = [];

  console.log('Parsing rows', rows.length);

  rows.forEach((item) => {
    if (!item) {
      return false;
    }

    const allData = item.replace(/"/g, '').split(',');

    const data = Object.fromEntries(fields.map((el, i) => {
      return [fields[i], allData[i]];
    }));


    delete data[undefined];

    if (!data.cidr) {
      return false;
    }

    if (!data.cidr.includes('/')) {
      data.cidr = `${data.cidr}/32`;
    }

    const [firstOctet] = data.cidr.split('.', 1);

    if (!firstOctet) {
      return false;
    }

    res[firstOctet] = res[firstOctet] || [];

    data.range = calculateRange(data.cidr);

    res[firstOctet].push(data);
  });

  console.timeEnd(file);

  return (ip) => {
    return find(ip, res, file);
  };
}

const ip = '99.87.8.7';

// const findBl = build('../dist/blacklisted.netset');
const findDc = build('../dist/datacenters.netset');
const findCountry = build('../dist/countries.csv', ['cidr', 'code']);
// const findAs = build('../dist/IP2LOCATION-LITE-ASN.CSV', [undefined, undefined, 'cidr', 'asn', 'name']);

console.log('DC', findDc(ip));
console.log('AS', findCountry(ip));
