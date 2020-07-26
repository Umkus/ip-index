# Bad IPs blocklist

IP blocklists containing IPs of known bad actors and ranges likely belonging to data centers.
The files are located in `dist/` directory.

## Building
To generate your own fresh blocklist run:
```shell script
$ TOKEN={IP2LOCATION_DOWNLOAD_TOKEN} ./bin/build.sh
```

You can get your free token on [https://lite.ip2location.com/](https://lite.ip2location.com/).

## Usage in node

Install dependencies and generate a DB
```shell script
npm install
npm run buildDb
```

Run the [example file](src/example.js):

```shell script
node ./src/example.js`
```

```javascript
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

```

Output:
```
init: 1.059ms
Datacenter: false
Blacklisted: true
Country: de
queries: 2.131ms
```

## Used projects

* [Firehol](https://github.com/firehol/blocklist-ipsets)
* [ip2location ASN DB](https://lite.ip2location.com/database/ip-asn)
* [This list of DC names](https://udger.com/resources/datacenter-list)
* [This list of ASNs](https://github.com/brianhama/bad-asn-list)
* [This list of web-hosting companies](https://github.com/linuxclark/web-hosting-companies)

## Acknowledgments
* This product includes IP2Location LITE data available from [http://www.ip2location.com](http://www.ip2location.com).
* This product includes GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).
