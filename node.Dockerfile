FROM node:alpine
COPY data /var/www/data
COPY src /var/www/src
COPY package.json /var/www/
WORKDIR /var/www
ENTRYPOINT node
CMD src/server.js
