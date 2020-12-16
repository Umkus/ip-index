// ./src/example.js

const IpIndex = require('./index');

console.time('init');
const ipIndex = new IpIndex(`${__dirname}/../dist/ip-index.db`);
console.timeEnd('init');

const ip = '93.201.96.204';

console.time('queries');
console.log('Datacenter:', ipIndex.isDatacenter(ip));
console.log('Blacklisted:', ipIndex.isBlacklisted(ip));
console.log('Country:', ipIndex.getCountry(ip));
console.log('Asn:', ipIndex.getAsn(ip));
console.timeEnd('queries');
