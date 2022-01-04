FROM nginx:alpine
COPY public /var/www
COPY nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT nginx
