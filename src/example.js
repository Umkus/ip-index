const BlockList = require('./index');

console.time('init');
const bl = new BlockList('../dist/blocklist.db');
console.timeEnd('init');

console.time('query');
console.log('Blacklisted', bl.contains('99.99.62.249'));
console.log('Country', bl.getCountry('99.99.62.249'));
console.timeEnd('query');
