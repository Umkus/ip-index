const { getIpInfo } = require('./index');
const ip = '217.138.199.199';

console.time('time');
console.log(getIpInfo(ip));
console.timeEnd('time');
