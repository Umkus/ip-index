#!/usr/bin/env bash
cd $(dirname $0)/..

echo Downloading ASN DB ...
#curl --silent --location --request GET https://www.ip2location.com/download/?token=${TOKEN}\&file=DBASNLITE >dist/asns.zip

echo Downloading firehol blocklists ...
curl --silent --location --request GET https://github.com/firehol/blocklist-ipsets/archive/master.zip >dist/firehol.zip

echo Preparing...
unzip -q -o dist/asns.zip -d dist
unzip -q -o dist/firehol.zip -d dist

rm -f dist/blocklist-ipsets-master/iblocklist_isp*
rm -rf dist/blocklist-ipsets-master/*country

echo Building ASN block list...
grep -f patterns/bad.csv -f patterns/companies.csv dist/IP2LOCATION-LITE-ASN.CSV | grep -v -f patterns/good.csv | cut -d'"' -f6 | sort -u >dist/asn-block.netset
echo Building IP block list...
sort -u dist/blocklist-ipsets-master/*set >dist/ip-block.netset

echo Done!

wc -l dist/asn-block.netset
wc -l dist/ip-block.netset
