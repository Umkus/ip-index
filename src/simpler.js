import data from '../data/fullASN.json' assert { type: "json" }
import { BlockList } from 'net'
// import { Address4, Address6 } from 'ip-address'

const keys = Object.keys(data)// .slice(0, 1000)
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

    data[asn]?.prefixes?.forEach((subnet) => addToIndex(subnet, asn, 'ipv4'))
    data[asn]?.prefixesIPv6?.forEach((subnet) => addToIndex(subnet, asn, 'ipv6'))
})

console.timeEnd('index')


// const ip = '2605:6400:2:1234::1'
const ip = '8.8.8.8'

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
            matches.push(data[candidateAsn])
        }
    }
}

console.timeEnd('search')
console.log(matches)