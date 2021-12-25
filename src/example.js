const { getIpInfo } = require('./index');
const ip = '199.103.22.0';

console.time('time');
console.log(ip, getIpInfo(ip));
console.timeEnd('time');
