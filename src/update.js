import {
  readFileSync,
  writeFileSync,
} from 'fs';
import { getIpInfo } from './index.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const csvAsns = readFileSync(`${__dirname}/../data/asns.csv`).toString()
  .split(/\n/)
  .filter((item) => item.trim().length)
  .map((row) => {
    const items = row.split(',', 3);
    items[0] = +items[0];
    items[2] = items[2].replace('"', '');
    return items;
  });
csvAsns.shift();

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
  /vpn/i,
  /layer/i,
  /\.(com|org|de|ru)(\W|$)/i,
];

const patternsGood = [
  /(\W|^)mobile/i,
  /(\W|^)tv(\W|$)/i,
  /afrihost/i,
  /broad/i,
  /vcable/i,
  /fiber/i,
  /wifi/i,
  /home(\W|$)/i,
  /internet/i,
  /isp/i,
  /dsl/i,
  /tele/i,
  /echostar/i,
  /vodafone/i,
  /clouditalia/i,
  /centurylink/i,
  /communic/i,
  /TIF SCALEWAY/i
];

const nordIps = readFileSync(`${__dirname}/../data/ips_nord.csv`).toString().split(/\n/);

const badAsns = csvAsns.filter((item) => {
  for (let patBad of patternsBad) {
    if (patBad.test(`${item[1]} ${item[2]}`)) {
      for (let patGood of patternsGood) {
        if (patGood.test(`${item[1]} ${item[2]}`)) {
          return false;
        }
      }

      return true;
    }
  }

  return false;
});

const newBad = badAsns.map((item) => +item[0]);
const oldBad = new Set(readFileSync(`${__dirname}/../data/asns_dcs.csv`).toString().split(/\n/).map((item) => +item));

newBad.forEach((item) => {
  if (!oldBad.has(item)) {
    oldBad.add(item);
  }
});

nordIps.forEach((nordIp) => {
  getIpInfo(nordIp)
    .forEach((item) => {
      if (!item.hosting) {
        oldBad.add(item.asn);
      }
    });
});

writeFileSync(`${__dirname}/../data/asns_dcs.csv`, [...oldBad].sort().join('\n') + '\n');
