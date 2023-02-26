import { getAsnInfo, getIpInfo } from './index.js'

const ip = '8.8.8.8'

console.time('time')
const ipInfo = getIpInfo(ip)
const asnInfo = getAsnInfo(15169)
console.timeEnd('time')

console.log(ipInfo)
console.log(asnInfo)
