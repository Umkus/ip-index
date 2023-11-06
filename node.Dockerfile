FROM node:alpine
COPY . /var/www/
WORKDIR /var/www
ENTRYPOINT node src/server.js
