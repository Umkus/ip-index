const IpInfo = require('./index');

console.time('init');
const bl = new IpInfo('../dist/ipinfo.db');
console.timeEnd('init');

console.time('query');
console.log('Datacenter', bl.isDatacenter('99.99.62.249'));
console.log('Blacklisted', bl.isBlacklisted('99.99.62.249'));
console.log('Country', bl.getCountry('99.99.62.249'));
console.timeEnd('query');
