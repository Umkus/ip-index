import data from '../data/fullASN.json' assert { type: "json" }
import { BlockList } from 'net'
import { readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dcAsns = readFileSync(`${__dirname}/../data/asns_dcs.csv`).toString().split(/\s+/)

const keys = Object.keys(data)
const index = {}

console.time('index')

function getStart(subnet) {
    return subnet.split(/[:\.]/)[0]
}


function addToIndex(subnet, asn, ipFamily) {
    const start = getStart(subnet)

    if (!index[start]) {
        index[start] = {}
    }

    if (!index[start][asn]) {
        index[start][asn] = []
    }

    const [net, prefix] = subnet.split('/')

    const blocklist = new BlockList
    blocklist.addSubnet(net, +prefix, ipFamily)

    index[start][asn].push(blocklist)
}

keys.forEach((asn) => {
    const info = data[asn]

    if (!info?.active) {
        return
    }

    info.type = dcAsns.includes(asn) ? 'hosting' : info.type

    data[asn]?.prefixes?.forEach((subnet) => addToIndex(subnet, asn, 'ipv4'))
    data[asn]?.prefixesIPv6?.forEach((subnet) => addToIndex(subnet, asn, 'ipv6'))
})

console.timeEnd('index')


export function getIpInfo(ip) {
    let ipFamily = 'ipv4'

    if (ip.includes(':')) {
        ipFamily = 'ipv6'
    }

    console.time('search')
    const searchStart = getStart(ip)
    const matches = []

    if (index[searchStart]) {
        const startBucket = index[searchStart]

        for (const candidateAsn in startBucket) {
            const match = startBucket[candidateAsn].find((candidateBlocklist) => candidateBlocklist.check(ip, ipFamily))

            if (match) {
                const subnet = match.rules[0].split(' ').pop()
                const foundAsn = data[candidateAsn]

                const res = {
                    subnet,
                    asn: +candidateAsn,
                    hosting: foundAsn.type === 'hosting',
                    country: foundAsn.country,
                    handle: foundAsn.descr.split(',')[0],
                    description: foundAsn.org,
                    subnetsNum: foundAsn?.prefixes?.length || 0 + foundAsn?.prefixesIPv6?.length || 0,
                }

                matches.push(res)
            }
        }
    }

    console.timeEnd('search')

    return matches
}


const ip = '2605:6400:2:1234::1'
// const ip = '8.8.8.8'
const res = getIpInfo(ip)

console.log(res)