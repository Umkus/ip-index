# IP Index

This project produces a daily build of a custom-rolled [mmdb database file](https://github.com/Umkus/ip-index/releases/download/latest/ip-index.mmdb) to query IP's:
- ASN number
- ASN description
- country
- whether it's a hosting or not

Essentially this is an ASN database from https://iptoasn.com/, enriched with a hosting status and wrapped into MMDB format for portability.

Supports IPv4 and IPv6.

False positives are possible, use at own risk.

## Usage

Pick a supported [library of choice](https://community.ipinfo.io/t/list-of-mmdb-reader-libraries/2821) for your preferred language.

## Methods of validation

One of the target ASN IPs is checked against one or more of the known IP scoring services:

* https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/1.1.1.1
* https://www.ip2location.com/demo/1.1.1.1
* https://scamalytics.com/ip/1.1.1.1
* https://ipinfo.io/1.1.1.1

## Acknowledgments

* This product includes IP2Location LITE data available from [http://www.ip2location.com](http://www.ip2location.com).
* This product includes GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).
