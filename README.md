# IP Index

An offline IP lookup database of VPN CIDRs and bad actor IP ranges. Updated daily.

Project contains:

* An [SQLite3 database](/dist/ip-index.db.gz) containing IP ranges of datacenters, IPs used for malicious activities, ASNs and countries
* Same plain-text files are available under [/dist](/dist) folder.

## How are/were the datacenter ranges detected

* The ASNs (manually) deducted from [this list](https://udger.com/resources/datacenter-list) of Datacenters
* The ASNs from [these](https://github.com/linuxclark/web-hosting-companies) [lists](https://github.com/brianhama/bad-asn-list) were added
* The ASNs deducted (automatically, during build) from NordVPN's [server list](https://api.nordvpn.com/server) IPs
* List of all ASNs names is [matched](src/matches.js) against keywords that would give away datacenters or hosting

False positives are possible.

## Items in database

Below is the approximate number of rows in each of the database tables. Each row contains IP or IP range in an integer notation (first and last IPs).

|*Table*|*Items*|*Info*|
|---|:---:|---|
|datacenters|~138k|IP ranges|
|blacklisted|~1.9M|mostly IPs, with occasional IP ranges|
|asns|~1.1M|ANSs with related IP ranges|
|countries|268k|IP ranges|

## Sanity check

Pick some random IPs:

```shell script
sort -R dist/datacenters.netset | head -n 5
```

Check against any of the known IP scoring services:

* https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/1.1.1.1
* https://www.ip2location.com/demo/1.1.1.1
* https://scamalytics.com/ip/1.1.1.1

## Usage

The project is provided with an example NodeJS [library](src/index.js) to query the database, but you are not limited to the programming language, since SQLite database is highly portable.

Run the [example file](src/example.js):

```shell script
node ./src/example.js
```

Output:

```
init: 46.245ms
Datacenter: false
Blacklisted: true
Country: de
Is EU: true
Asn: { id: 3320, name: 'Deutsche Telekom AG' }
queries: 21.886ms
```

## Building

In case you really want to build the project yourself, you would need a NodeJS/NPM environment.

Install dependencies:

```shell script
npm run deps:install
```

Start the build process, which would take up to a minute to complete.

```shell script
TOKEN={IP2LOCATION_DOWNLOAD_TOKEN} npm run db:build
```

The `TOKEN` for the underlying ASN database could be issued with your free [ip2location](http://www.ip2location.com) account.

## Used projects

* [Firehol](https://github.com/firehol/blocklist-ipsets)
* [ip2location ASN DB](https://lite.ip2location.com/database/ip-asn)
* [This list of DC names](https://udger.com/resources/datacenter-list)
* [This list of ASNs](https://github.com/brianhama/bad-asn-list)
* [This list of web-hosting companies](https://github.com/linuxclark/web-hosting-companies)

## Acknowledgments

* This product includes IP2Location LITE data available from [http://www.ip2location.com](http://www.ip2location.com).
* This product includes GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).
