const { getIpInfo } = require('./index');
const ip = '213.184.68.1';

console.time('time');
console.log(getIpInfo(ip));
console.timeEnd('time');
