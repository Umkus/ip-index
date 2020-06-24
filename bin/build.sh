#!/usr/bin/env bash
cd $(dirname $0)/..

echo Downloading ASN DB...
curl --silent --location --request GET https://www.ip2location.com/download/?token=${TOKEN}\&file=DBASNLITE >dist/asns.zip

echo Downloading firehol blocklists...
curl --silent --location --request GET https://github.com/firehol/blocklist-ipsets/archive/master.zip >dist/firehol.zip

echo Preparing...
unzip -q -o dist/asns.zip -d dist
unzip -q -o dist/firehol.zip -d dist

rm -f dist/blocklist-ipsets-master/iblocklist_isp*
rm -rf dist/blocklist-ipsets-master/*country
rm -rf dist/blocklist-ipsets-master/*datacenter*

echo Building datacenter blocklist...
grep -f patterns/bad.csv -f patterns/companies.csv dist/IP2LOCATION-LITE-ASN.CSV | grep -v -f patterns/good.csv | cut -d'"' -f6 | sort -u >dist/datacenters.netset
echo Building IP blocklist...
sort -u dist/blocklist-ipsets-master/*set >dist/bad-ips.netset

sed -i '/^[^0-9]/d' dist/ip-block.netset

echo Done!

wc -l dist/datacenters.netset
wc -l dist/ip-block.netset
