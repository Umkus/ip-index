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

async function download(url, dest) {
  return axios({
    url,
    method: 'get',
    responseType: 'stream',
  })
    .then(({ data }) => data.pipe(fs.createWriteStream(dest)));
}

async function start() {
  await download(nordUrl, '../dist/nord.csv');
  await download(ip2asnUrl, '../dist/ip2asn.tsv');

  const dcs = fs.readFileSync(fileDcAsns).toString().split(/\s+/);
  const enriched = fs.readFileSync(fileIp2Asn).toString()
    .split(/\n/)
    .map((row) => {
      const fields = row.split(/\t/);
      const isBad = patternsBad.find((pattern) => pattern.test(fields[4])) || false;
      const isGood = patternsGood.find((pattern) => pattern.test(fields[4])) || false;
      fields[5] = +(dcs.includes(fields[2]) || (isBad && !isGood));

      return fields.join('\t');
    })
    .join('\n');

  fs.writeFileSync(fileIp2Asn, enriched);
}

start();
