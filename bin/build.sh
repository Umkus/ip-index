#!/usr/bin/env bash
cd $(dirname $0)/..

# ASNs
grep -f data/patterns/companies.csv data/IP2LOCATION-LITE-ASN.CSV | cut -d'"' -f6 > dist/bad_asns.netset

# Firehol netsets
cat data/sets/* > dist/all_ips.netset