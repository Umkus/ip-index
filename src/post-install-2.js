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
const fileGeolocationsV4Zip = `${__dirname}/../data/geolocationDatabaseIPv4.csv.zip`;
const fileGeolocationsV6Zip = `${__dirname}/../data/geolocationDatabaseIPv6.csv.zip`;
const fileAsnsCsv = `${__dirname}/../data/asns.csv`;

let index = []
const opts = { responseType: 'blob' };

console.log('Creating index, this may take a minute...')

console.time('downloaded')
await axios.get('https://raw.githubusercontent.com/ipapi-is/ipapi/main/databases/fullASN.json.zip', { responseType: 'arraybuffer' })
    .then((res) => writeFileSync(fileAsnsZip, res.data))
await axios.get('https://raw.githubusercontent.com/ipapi-is/ipapi/main/databases/geolocationDatabaseIPv4.csv.zip', { responseType: 'arraybuffer' })
    .then((res) => writeFileSync(fileGeolocationsV4Zip, res.data))
await axios.get('https://raw.githubusercontent.com/ipapi-is/ipapi/main/databases/geolocationDatabaseIPv6.csv.zip', { responseType: 'arraybuffer' })
    .then((res) => writeFileSync(fileGeolocationsV6Zip, res.data))

const promises = [
    axios.get('https://github.com/ipverse/asn-info/raw/master/as.csv', opts).then((res) => writeFileSync(fileAsnsCsv, res.data)),
    axios.get('https://github.com/Umkus/nordvpn-ips/releases/download/ips/ips.csv', opts).then((res) => writeFileSync(fileNord, res.data)),
];

await Promise.all(promises)

const asnsZip = new AdmZip(fileAsnsZip)
asnsZip.extractAllTo(`${__dirname}/../data`, true)
const geolocationsV4Zip = new AdmZip(fileGeolocationsV4Zip)
geolocationsV4Zip.extractAllTo(`${__dirname}/../data`, true)
const geolocationsV6Zip = new AdmZip(fileGeolocationsV6Zip)
geolocationsV6Zip.extractAllTo(`${__dirname}/../data`, true)
console.timeEnd('downloaded')

console.time('parsed')
const asnsData = JSON.parse(readFileSync(`${__dirname}/../data/fullASN.json`).toString())
const geolocationV4Data = readFileSync(`${__dirname}/../data/geolocationDatabaseIPv4.csv`)
    .toString()
    .split('\n')
    .slice(1) // skip header
    .filter(Boolean)
    .map(row => {
        const [,startIp,endIp,,,,,,,,latitude,longitude,geoAccuracy] = row.split(',')

        const parsedStartIp = new Address4(startIp)
        const parsedEndIp = new Address4(endIp)

        const start = parsedStartIp.startAddress().bigInteger()
        const end = parsedEndIp.endAddress().bigInteger()

        return {
            start,
            end,
            latitude,
            longitude,
            geoAccuracy,
        }
    })
const geolocationV6Data = readFileSync(`${__dirname}/../data/geolocationDatabaseIPv6.csv`)
    .toString()
    .split('\n')
    .slice(1) // skip header
    .filter(Boolean)
    .map(row => {
        const [,startIp,endIp,,,,,,,,latitude,longitude,geoAccuracy] = row.split(',')

        const parsedStartIp = new Address6(startIp)
        const parsedEndIp = new Address6(endIp)

        const start = parsedStartIp.startAddress().bigInteger()
        const end = parsedEndIp.endAddress().bigInteger()

        return {
            start,
            end,
            latitude,
            longitude,
            geoAccuracy,
        }
    })
console.timeEnd('parsed')

console.time('indexed')
function addToIndex(subnet, asn, ipFamily, country) {
    let ip
    if (ipFamily === 'ipv6') {
        ip = new Address6(subnet)
    } else {
        ip = new Address4(subnet)
    }

    const start = ip.startAddress().bigInteger()
    const end = ip.endAddress().bigInteger()


    index.push({
        asn,
        subnet,
        start,
        end,
        country,
    })
}

Object.keys(asnsData).forEach((asn, idx, arr) => {
    const info = asnsData[asn]

    if (!info?.active) {
        return
    }

    info?.prefixes?.forEach((subnet) => addToIndex(subnet, asn, 'ipv4', info.country))
    info?.prefixesIPv6?.forEach((subnet) => addToIndex(subnet, asn, 'ipv6', info.country))
})

index.sort((a, b) => {
    const aNum = a.start
    const bNum = b.start

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
writeFileSync(`${__dirname}/../data/geolocation_ipv4.csv`, geolocationV4Data.map(({ start, end, latitude, longitude, geoAccuracy }) => `${start},${end},${latitude},${longitude},${geoAccuracy}`).join('\n'));
writeFileSync(`${__dirname}/../data/geolocation_ipv6.csv`, geolocationV6Data.map(({ start, end, latitude, longitude, geoAccuracy }) => `${start},${end},${latitude},${longitude},${geoAccuracy}`).join('\n'));
