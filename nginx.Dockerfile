FROM nginx:alpine
ENTRYPOINT nginx
COPY nginx.conf /etc/nginx/nginx.conf
