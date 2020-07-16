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

```javascript
const lookup = require('bad-ip-blocklist');

const found =  lookup('1.1.1.1'); // [ 16843009, 16843009 ]
```

If ip is found in the database, an integer ip range is returned, otherwise `undefined`.

## Used projects

* [Firehol](https://github.com/firehol/blocklist-ipsets)
* [ip2location ASN DB](https://lite.ip2location.com/database/ip-asn)
* [This list of DC names](https://udger.com/resources/datacenter-list)
* [This list of ASNs](https://github.com/brianhama/bad-asn-list/blob/master/bad-asn-list.csv)
