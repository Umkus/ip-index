import { getAsnInfo, getIpInfo } from './index.js'

const ip = '8.8.8.8'

console.time('time')
const ipInfo = getIpInfo(ip)
const asnInfo = getAsnInfo(ipInfo[0].asn)
console.timeEnd('time')

console.log(ipInfo)
console.log(asnInfo)
