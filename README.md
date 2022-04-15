# IP Index

An offline lookup database of IPs, belonging to hosting data-centers.

Project contains:

* Data-center ASNs CSV list
* NPM library
* Dockerized webservice

## Usage

For a quick and easy start and test and evaluation you can start the docker container directly:

```shell
docker run -d -it -p 80:4000 --name ipindex ghcr.io/umkus/ipindex-node:latest 
```
Now open this url in browser: `http://localhost/?ip=8.8.8.8`

For a more advanced usage with pre-configured nginx throttling and caching

```shell
git clone git@github.com:Umkus/ip-index.git
cd ip-index
docker-compose -f docker-compose.yml up -d
```

Now open this url in browser: `http://localhost/8.8.8.8`

## Why this exists

Most existing solutions to detect VPNs/Proxies provide HTTP APIs or binary databases on a subscription model.
Downsides of the existing projects might be at least one of the following:

* Not cost-effective
* Not portable
* Not fast enough

This solution is:

* Free
* Portable (Docker image)
* Fast and efficient (caching, throttling reverse proxy)

False positives are possible.

## Methods of validation

One of the target ASN IPs is checked against one or more of the known IP scoring services:

* https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/1.1.1.1
* https://www.ip2location.com/demo/1.1.1.1
* https://scamalytics.com/ip/1.1.1.1

## Acknowledgments

* This product includes IP2Location LITE data available from [http://www.ip2location.com](http://www.ip2location.com).
* This product includes GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).
