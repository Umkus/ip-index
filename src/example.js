import { getAsnInfo, getIpInfo } from './index.js'

const ip = '8.8.8.8'
// const ip = '2a00:1450:4016:809::2004'

console.time('query time')
const ipInfo = getIpInfo(ip)
const asnInfo = getAsnInfo(ipInfo.asns[0]?.asn)
console.timeEnd('query time')

console.log('IP Info', ipInfo)
console.log('ASN Info', asnInfo)