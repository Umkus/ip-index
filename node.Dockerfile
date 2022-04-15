FROM node:alpine
COPY data/asns_dcs.csv /var/www/data/asns_dcs.csv
ADD https://github.com/Umkus/asn-ip/releases/download/latest/as.csv /var/www/data/asns.csv
ADD https://github.com/Umkus/asn-ip/releases/download/latest/ranges_ipv4.csv /var/www/data/asns_cidrs.csv
COPY src /var/www/src
COPY package.json /var/www/
WORKDIR /var/www
ENTRYPOINT node
CMD src/server.js
