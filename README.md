# IP Index
A fast offline IP lookup library. Returns blacklist status, detects VPN/hosting and shows geo info.

## Building
To generate your own fresh blocklist run:
```shell script
$ TOKEN={IP2LOCATION_DOWNLOAD_TOKEN} ./bin/build.sh
```

You can get your free token on [https://lite.ip2location.com/](https://lite.ip2location.com/).

## Usage in node

Install dependencies and generate a DB
```shell script
npm run deps:install
npm run db:build
```

Run the [example file](src/example.js):

```shell script
node ./src/example.js`
```

Output:
```
init: 1.074ms
Datacenter: false
Blacklisted: true
Country: de
Asn: { id: 3320, name: 'Deutsche Telekom AG' }
queries: 3.759ms
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
