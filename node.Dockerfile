FROM node:alpine-20
COPY . /var/www/
WORKDIR /var/www
ENTRYPOINT node src/server.js
