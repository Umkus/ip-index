import axios from 'axios';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fileAsns = createWriteStream(`${__dirname}/../data/asns.csv`);
const fileCidrs = createWriteStream(`${__dirname}/../data/asns_cidrs.csv`);
const opts = { responseType: 'blob' };

axios.get('https://github.com/Umkus/asn-ip/releases/download/latest/as.csv', opts)
  .then((res) => {
    fileAsns.write(res.data);
  });

axios.get('https://github.com/Umkus/asn-ip/releases/download/latest/ranges_ipv4.csv', opts)
  .then((res) => {
    fileCidrs.write(res.data);
  });
