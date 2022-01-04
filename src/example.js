import { getIpInfo } from './index.js';

const ip = '8.8.8.8';

console.time('time');
const ipInfo = getIpInfo(ip);
console.log(ipInfo);
console.timeEnd('time');
