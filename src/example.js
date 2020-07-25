// ./src/example.js

const IpInfo = require('./index');

console.time('init');
const ipInfo = new IpInfo('../dist/ipinfo.db');
console.timeEnd('init');

const ip = '93.201.96.204';

console.time('queries');
console.log('Datacenter:', ipInfo.isDatacenter(ip));
console.log('Blacklisted:', ipInfo.isBlacklisted(ip));
console.log('Country:', ipInfo.getCountry(ip));
console.timeEnd('queries');
