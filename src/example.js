const { getIpInfo } = require('./index');
const ip = '199.103.22.0,1.1.1.1';

console.time('time');
console.log(getIpInfo(ip));
console.timeEnd('time');
