#!/usr/bin/env sh

set -e

cd $(dirname $0)/..

mkdir -p dist/

echo Downloading ASN DB...
curl --location --request GET https://www.ip2location.com/download/?token=${TOKEN}\&file=DBASNLITE >dist/asns.zip

echo Downloading firehol blocklists...
curl --location --request GET https://github.com/firehol/blocklist-ipsets/archive/master.zip >dist/firehol.zip

echo Preparing...
unzip -o dist/asns.zip -d dist
unzip -o dist/firehol.zip -d dist

rm -f dist/blocklist-ipsets-master/iblocklist_isp*
rm -f dist/blocklist-ipsets-master/firehol_level4.netset
rm -rf dist/blocklist-ipsets-master/*country
mv dist/blocklist-ipsets-master/datacenters.netset dist/datacenters.netset

echo Building datacenter blocklist...
grep -i -f patterns/bad.csv -f patterns/companies.csv dist/IP2LOCATION-LITE-ASN.CSV | grep -i -v -f patterns/good.csv | cut -d'"' -f6 >>dist/datacenters.netset
sort -u -o dist/datacenters.netset dist/datacenters.netset
sed -i '/^[^0-9]/d' dist/datacenters.netset

echo Building IP blocklist...
sort -u dist/blocklist-ipsets-master/*set >dist/bad-ips.netset
sed -i '/^[^0-9]/d' dist/bad-ips.netset

echo Done!

wc -l dist/datacenters.netset
wc -l dist/bad-ips.netset
