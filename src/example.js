const IpInfo = require('./index');

console.time('init');
const ip = new IpInfo('../dist/ipinfo.db');
console.timeEnd('init');

console.time('query');
console.log('Datacenter', ip.isDatacenter('99.99.62.249'));
console.log('Blacklisted', ip.isBlacklisted('99.99.62.249'));
console.log('Country', ip.getCountry('99.99.62.249'));
console.timeEnd('query');
