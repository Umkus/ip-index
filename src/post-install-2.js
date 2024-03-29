import { writeFileSync, readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Address4, Address6 } from 'ip-address'
import AdmZip from 'adm-zip'
import axios from 'axios'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileNord = `${__dirname}/../data/ips_nord.csv`;
const fileAsnsZip = `${__dirname}/../data/fullASN.json.zip`;
const fileAsnsCsv = `${__dirname}/../data/asns.csv`;

let index = []
const opts = { responseType: 'blob' };

console.log('Creating index, this may take a minute...')

console.time('downloaded')
await axios.get('https://raw.githubusercontent.com/ipapi-is/ipapi/main/databases/fullASN.json.zip', { responseType: 'arraybuffer' })
    .then((res) => writeFileSync(fileAsnsZip, res.data))

const promises = [
    axios.get('https://github.com/ipverse/asn-info/raw/master/as.csv', opts).then((res) => writeFileSync(fileAsnsCsv, res.data)),
    axios.get('https://github.com/Umkus/nordvpn-ips/releases/download/ips/ips.csv', opts).then((res) => writeFileSync(fileNord, res.data)),
];

await Promise.all(promises)

const zip = new AdmZip(fileAsnsZip)
zip.extractAllTo(`${__dirname}/../data`, true)
console.timeEnd('downloaded')

console.time('parsed')
const data = JSON.parse(readFileSync(`${__dirname}/../data/fullASN.json`).toString())
console.timeEnd('parsed')

const keys = Object.keys(data)

console.time('indexed')

function addToIndex(subnet, asn, ipFamily, country) {
    let ip
    if (ipFamily === 'ipv6') {
        ip = new Address6(subnet)
    } else {
        ip = new Address4(subnet)
    }

    const end = ip.endAddress().bigInteger().toString()
    const start = ip.startAddress().bigInteger().toString()

    index.push({ asn, subnet, start, end, country })
}

keys.forEach((asn) => {
    const info = data[asn]

    if (!info?.active) {
        return
    }

    info?.prefixes?.forEach((subnet) => addToIndex(subnet, asn, 'ipv4', info.country))
    info?.prefixesIPv6?.forEach((subnet) => addToIndex(subnet, asn, 'ipv6', info.country))
})

index.sort((a, b) => {
    const aNum = BigInt(a.start)
    const bNum = BigInt(b.start)

    if (aNum < bNum) {
        return -1
    } else if (aNum > bNum) {
        return 1
    } else {
        return 0
    }
})

console.timeEnd('indexed')

writeFileSync(`${__dirname}/../data/asns_cidrs_2.csv`, index.map(({ asn, subnet, start, end, country }) => `${asn},${subnet},${start},${end},${country}`).join('\n'));
