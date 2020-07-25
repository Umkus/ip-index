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

Install dependencies
```shell script
npm install
```

Run the [example file](src/example.js):

```shell script
node ./src/example.js`
```

```javascript
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
```

Output:
```
init: 0.980ms
Datacenter: true
Blacklisted: true
Country: au
queries: 1.587ms
```

## Used projects

* [Firehol](https://github.com/firehol/blocklist-ipsets)
* [ip2location ASN DB](https://lite.ip2location.com/database/ip-asn)
* [This list of DC names](https://udger.com/resources/datacenter-list)
* [This list of ASNs](https://github.com/brianhama/bad-asn-list/blob/master/bad-asn-list.csv)
