# IP Index

An offline lookup database of IPs, belonging to hosting data-centers.

Project contains:

* Data-center ASNs CSV list
* NPM library
* Dockerized webservice

## Why this exists

Most existing solutions to detect VPNs/Proxies provide HTTP APIs or binary databases on a subscription model.
Downsides of the existing projects are:
* Not cost-effective
* Not portable
* Not fast enough

This solution is:
* Free
* Portable (Docker)
* Fast and efficient (caching reverse proxy)

False positives are possible.

## Methods of validation
One of the target ASN IPs is checked against one or more of the known IP scoring services:
* https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/1.1.1.1
* https://www.ip2location.com/demo/1.1.1.1
* https://scamalytics.com/ip/1.1.1.1

## Usage (node)
```bash
npm install ip-index
```

See the [example file](src/example.js):

```shell script
node ./src/example.js
```

Output:

```
[
  {
    start: 134217728,
    end: 142606335,
    subnet: '8.0.0.0/9',
    asn: 3356,
    hosting: false,
    handle: 'LEVEL3',
    description: 'Level 3 Parent',
    subnetsNum: 527
  },
  {
    start: 134744064,
    end: 134744319,
    subnet: '8.8.8.0/24',
    asn: 15169,
    hosting: true,
    handle: 'GOOGLE',
    description: 'Google LLC',
    subnetsNum: 75
  }
]
time: 7.22ms
```


## Usage (web service)
```bash
docker-compose -f docker-compose.yml up -d
```

Now open this url in browser: `http://localhost/8.8.8.8`

## Acknowledgments

* This product includes IP2Location LITE data available from [http://www.ip2location.com](http://www.ip2location.com).
* This product includes GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).
