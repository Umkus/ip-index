# IP Index

A self-sufficient web-service providing info about an IP, particularly its ASN, country of origin and whether it's a hosting or not.

Project contains:

* Data-center ASNs CSV list
* Dockerized webservice (nginx and nodejs)
* NPM library

Updates daily. False positives are possible, use at own risk.

## Usage

For a quick and easy start and evaluation you can start the docker container directly:

```shell
docker run --pull always -d -it -p 80:4000 --rm ghcr.io/umkus/ipindex-node:latest
```

Alternatively for a more advanced usage with pre-configured nginx throttling and caching run this:

```shell
# git clone git@github.com:Umkus/ip-index.git
# cd ip-index
docker compose -f docker-compose.yml up -d
```

Now open this url in your browser: [http://localhost/?ip=8.8.8.8](http://localhost/?ip=8.8.8.8)

You will see the following data structure:

```json
{
  "asns": [
    {
      "start": "134744064",
      "end": "134744319",
      "subnet": "8.8.8.0/24",
      "asn": 15169,
      "hosting": true,
      "country": "US",
      "handle": "GOOGLE",
      "description": "Google",
      "subnetsNum": 956
    }
  ],
  "geolocations": [
    {
      "start": "134217728",
      "end": "142606335",
      "latitude": "32.50931",
      "longitue": "-92.1193",
      "accuracy": "4"
    }
  ]
}
```

## Why this exists

Most existing solutions to detect VPNs/Proxies provide HTTP APIs or binary databases on a subscription model. Downsides of the existing projects might be at least one of the following:

* Not cost-effective
* Not portable
* Not fast enough

This solution is:

* Free
* Portable (Docker image)
* Fast and efficient (caching, throttling reverse proxy)


## Methods of validation

One of the target ASN IPs is checked against one or more of the known IP scoring services:

* https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/1.1.1.1
* https://www.ip2location.com/demo/1.1.1.1
* https://scamalytics.com/ip/1.1.1.1

## Acknowledgments

* This product includes IP2Location LITE data available from [http://www.ip2location.com](http://www.ip2location.com).
* This product includes GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).
