const fs = require('fs');
const axios = require('axios');

const patternsBad = [
  /(^|\W)vps(\W|$)/i,
  /anonim/i,
  /anony/i,
  /cdn(\W|$)/i,
  /coll?o(c|[^a-z]|$)/i,
  /scale/i,
  /cloud/i,
  /data.?center/i,
  /ddos/i,
  /dedi/i,
  /host/i,
  /server/i,
  /unassigned/i,
  /vpn/i,
];

const patternsGood = [
  /(\W|^)mobile/i,
  /(\W|^)tv(\W|$)/i,
  /afrihost/i,
  /broad/i,
  /vcable/i,
  /fiber/i,
  /home(\W|$)/i,
  /internet/i,
  /isp/i,
  /tele/i,
  /tele?com/i,
  /echostar/i,
  /vodafone/i,
  /clouditalia/i,
  /servihosting/i,
];

const ip2asnUrl = 'https://github.com/Umkus/ip2asn-mirror/releases/download/ip2asn/ip2asn.tsv';
const nordUrl = 'https://github.com/Umkus/nordvpn-ips/releases/download/ips/ips.csv';

const fileDcAsns = `../data/dc_asns.tsv`;
const fileIp2Asn = `../dist/ip2asn.tsv`;
const fileDcRanges = `../dist/dc_ranges.csv`;
const fileNordIps = `../dist/nord.csv`;

async function download(url, dest) {
  return axios({
    url,
    method: 'get',
    responseType: 'arraybuffer',
  })
    .then(({ data }) => fs.writeFileSync(dest, data));
}

function ipToInt(ip) {
  return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

async function start() {
  await download(nordUrl, fileNordIps);
  await download(ip2asnUrl, fileIp2Asn);

  const dcRanges = ['start,end,asn'];
  let nordIps = fs.readFileSync(fileNordIps).toString().split(/\s+/).map(ipToInt).sort();

  const dcs = fs.readFileSync(fileDcAsns).toString().split(/\s+/);
  const enriched = fs.readFileSync(fileIp2Asn).toString()
    .split(/\n/)
    .map((row) => {
      const fields = row.split(/\t/);
      const isBad = patternsBad.find((pattern) => pattern.test(fields[4])) || false;
      const isGood = patternsGood.find((pattern) => pattern.test(fields[4])) || false;

      let isNord = false;

      while (+nordIps[0] < +fields[0]) {
        nordIps.shift();
      }

      while (+nordIps[0] >= +fields[0] && +nordIps[0] <= +fields[1]) {
        nordIps.shift();
        isNord = true;
      }

      const isTarget = dcs.includes(fields[2]) || (isBad && !isGood) || isNord;
      fields[5] = +isTarget;

      if (isTarget) {
        dcRanges.push(`${+fields[0]},${+fields[1]},${fields[2]}`);
      }

      return fields.join('\t');
    })
    .join('\n');

  fs.writeFileSync(fileIp2Asn, enriched);
  fs.writeFileSync(fileDcRanges, dcRanges.join('\n'));
}

start();
