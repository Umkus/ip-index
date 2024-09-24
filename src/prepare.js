import axios from 'axios'
import zlib from 'zlib'
import { writeFileSync, readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Address4, Address6 } from 'ip-address'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const asnsV4 = `${__dirname}/../data/ip2asn-v4.tsv`
const asnsV6 = `${__dirname}/../data/ip2asn-v6.tsv`

const asnsDcs = `${__dirname}/../data/asns_dcs.csv`
const fileNord = `${__dirname}/../data/ips_nord.csv`;

console.log('Preparing files...')

async function downloadAndDecompress(url, outputPath) {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const decompressedData = zlib.gunzipSync(response.data)
    writeFileSync(outputPath, decompressedData)
}

await Promise.all([
    downloadAndDecompress('https://iptoasn.com/data/ip2asn-v4.tsv.gz', asnsV4),
    downloadAndDecompress('https://iptoasn.com/data/ip2asn-v6.tsv.gz', asnsV6),
    axios.get('https://github.com/Umkus/nordvpn-ips/releases/download/ips/ips.csv', { responseType: 'blob' }).then((res) => writeFileSync(fileNord, res.data))
])


const dcList = readFileSync(asnsDcs).toString()
    .split(/\s+/)
    .filter((i) => i)
    .map((asn, index) => {
        if (!index || !asn) {
            return null
        }

        return +asn
    })

const asns = {}

let asnsContent = 'asn,handle\n'

function getCIDR6(startBigInt, endBigInt) {
    let mask = BigInt(128); // for IPv6, the mask starts at 128 (128 bits)

    // loop until we find the first differing bit
    while (mask > BigInt(0) && ((startBigInt >> (BigInt(128) - BigInt(mask))) !== (endBigInt >> (BigInt(128) - BigInt(mask))))) {
        mask--;
    }

    return mask;
}

function getCIDR4(start, end) {
    let mask = 32;

    while (mask > 0 && ((start >> (32 - mask)) !== (end >> (32 - mask)))) {
        mask--;
    }

    return mask;
}

const rangesV4 = readFileSync(asnsV4).toString()
    .split(/\n+/)
    // .slice(0, 10)
    .map((item, index) => {
        if (!index || !item) {
            return null
        }

        item = item.split(/\t/)

        item[2] = +item[2]

        if (!item[2]) {
            return 0
        }

        // 1.0.0.0	1.0.0.255	13335	US	CLOUDFLARENET
        const [startIp, endIp, asn, country, name] = item

        const startNum = (new Address4(startIp)).bigInteger().toString()
        const endNum = (new Address4(endIp)).bigInteger().toString()

        if (!asns[asn]) {
            asns[asn] = `${asn},${name}`
            asnsContent += `${asn},${name}\n`
        }

        const cidr = getCIDR4(startNum, endNum)

        return `${asn},${startIp}/${cidr},${startNum},${endNum},${country}`
    })
    .filter((i) => i)
    .join('\n')

const rangesV6 = readFileSync(asnsV6).toString()
    .split(/\n+/)
    // .slice(0, 10)
    .map((item, index) => {
        if (!index || !item) {
            return null
        }

        item = item.split(/\t/)

        item[2] = +item[2]

        if (!item[2]) {
            return 0
        }

        // 1.0.0.0	1.0.0.255	13335	US	CLOUDFLARENET
        const [startIp, endIp, asn, country, name] = item

        const startNum = (new Address6(startIp)).bigInteger().toString()
        const endNum = (new Address6(endIp)).bigInteger().toString()

        if (!asns[asn]) {
            asns[asn] = `${asn},${name}`
            asnsContent += `${asn},${name}\n`
        }

        const cidr = getCIDR6(BigInt(startNum), BigInt(endNum))

        // console.log(`${asn},-,${startNum},${endNum},${country}`)
        return `${asn},${startIp}/${cidr},${startNum},${endNum},${country}`
    })
    .filter((i) => i)
    .join('\n')

writeFileSync(`${__dirname}/../data/asns_cidrs_6.csv`, rangesV6)
writeFileSync(`${__dirname}/../data/asns_cidrs_4.csv`, rangesV4)
writeFileSync(`${__dirname}/../data/asns.csv`, asnsContent)
