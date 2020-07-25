// ./src/example.js

const IpInfo = require('./index');

console.time('init');
const ip = new IpInfo('../dist/ipinfo.db');
console.timeEnd('init');

console.time('queries');
console.log('Datacenter:', ip.isDatacenter('1.1.1.1'));
console.log('Blacklisted:', ip.isBlacklisted('1.1.1.1'));
console.log('Country:', ip.getCountry('1.1.1.1'));
console.timeEnd('queries');
