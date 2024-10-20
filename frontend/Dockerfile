FROM node:16-alpine as build-stage

WORKDIR /home/ffr_live_front

ARG VUE_APP_BASE_URL
ARG VUE_APP_UPLOADS_URL
ARG VUE_APP_PROJECT_MODE

ENV VUE_APP_BASE_URL=${VUE_APP_BASE_URL}
ENV VUE_APP_UPLOADS_URL=${VUE_APP_UPLOADS_URL}
ENV VUE_APP_PROJECT_MODE=${VUE_APP_PROJECT_MODE}

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine as prod-stage

COPY --from=build-stage /home/ffr_live_front/dist /usr/share/nginx/html

RUN echo "server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
    error_page 404 /index.html; \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]