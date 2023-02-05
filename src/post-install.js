import axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fileAsns = `${__dirname}/../data/asns.csv`;
const fileCidrs = `${__dirname}/../data/asns_cidrs.csv`;
const fileNord = `${__dirname}/../data/ips_nord.csv`;
const opts = { responseType: 'blob' };

console.log('Building data files, please wait...');

const promises = [
  axios.get('https://github.com/ipverse/asn-info/raw/master/as.csv', opts).then((res) => writeFileSync(fileAsns, res.data)),
  axios.get('https://github.com/Umkus/asn-ip/releases/download/latest/ranges_ipv4.csv', opts).then((res) => writeFileSync(fileCidrs, res.data)),
  axios.get('https://github.com/Umkus/nordvpn-ips/releases/download/ips/ips.csv', opts).then((res) => writeFileSync(fileNord, res.data)),
];

const countries = readFileSync(`${__dirname}/../node_modules/@ip-location-db/asn-country/asn-country-ipv4-num.csv`).toString().split('\n')
  .map((row) => {
    const item = row.split(',');

    item[0] = +item[0];
    item[1] = +item[1];

    return item;
  });

Promise.all(promises)
  .then(() => {
    console.log('Downloaded all files, enriching countries...')
    const cidrsWithCountries = readFileSync(`${__dirname}/../data/asns_cidrs.csv`).toString()
      .split('\n')
      .slice(1)
      .map((row, index) => {
        const items = row.split(',');
        const asn = +items[0];
        const start = +items[2];
        const end = +items[3];
        let country = '-'

        index % 10000 === 0 && console.log('ASN', index, asn)

        try {
          const foundCountry = countries.find((country) => start >= country[0] && end <= country[1]);

          if (foundCountry) {
            country = foundCountry[2];
          } else {
            // console.log('No country', row)
          }
        } catch(e) {
          console.log(e)
        }

        return `${row},${country}`;
      }).join('\n');

    console.log('Writing country data...')
    writeFileSync(`${__dirname}/../data/asns_cidrs.csv`, cidrsWithCountries);
    console.log('All done.')
  });
