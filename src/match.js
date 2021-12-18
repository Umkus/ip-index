const {
  readFileSync,
  writeFileSync
} = require('fs');

const sourceAsns = readFileSync('../data/dc_asns.tsv').toString().split(/\n/).map((item) => +item);

const patternsBad = [
  /(^|\W)vps(\W|$)/i,
  /anonim/i,
  /anony/i,
  /cdn(\W|$)/i,
  /coll?o(c|[^a-z]|$)/i,
  /scale/i,
  /cloud/i,
  /data.?center/i,
  /ddos/i,
  /dedi/i,
  /host/i,
  /server/i,
  /vpn/i,
  /layer/i,
  /\.(com|org|de|ru)(\W|$)/i,
];

const patternsGood = [
  /(\W|^)mobile/i,
  /(\W|^)tv(\W|$)/i,
  /afrihost/i,
  /broad/i,
  /vcable/i,
  /fiber/i,
  /home(\W|$)/i,
  /internet/i,
  /isp/i,
  /dsl/i,
  /tele/i,
  /echostar/i,
  /vodafone/i,
  /clouditalia/i,
  /centurylink/i,
  /communic/i,
];

const asns1 = readFileSync('../dist/ip2loc.csv').toString().split(/\n/)
  .map((row) => row.slice(1, -2))
  .map((row) => row.split('","'))
  .map((row) => ({
    start: +row[0],
    end: +row[1],
    asn: +row[3] || row[3],
    name: row[4],
  }))
  .filter((row) => {
    const isBad = patternsBad.find((pattern) => pattern.test(row.name)) || false;
    const isGood = patternsGood.find((pattern) => pattern.test(row.name)) || false;

    return isBad && !isGood;
  })
  .map((row) => row.asn)
;

const asns2 = readFileSync('../dist/ip2asn.tsv').toString().split(/\n/)
  .map((row) => row.split(/\t/))
  .map((row) => ({
    start: +row[0],
    end: +row[1],
    asn: +row[2],
    name: row[4],
  }))
  .filter((row) => {
    const isBad = patternsBad.find((pattern) => pattern.test(row.name)) || false;
    const isGood = patternsGood.find((pattern) => pattern.test(row.name)) || false;

    return isBad && !isGood;
  })
  .map((row) => +row.asn)
;

const resAsns = [...new Set([...sourceAsns, ...asns1, ...asns2])].sort();

writeFileSync('../data/dc_asns.tsv', resAsns.join('\n'));
