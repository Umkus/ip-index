const { getIpInfo } = require('./index');
const ip = '45.41.132.207';

console.time('time');
console.log(getIpInfo(ip));
console.timeEnd('time');
