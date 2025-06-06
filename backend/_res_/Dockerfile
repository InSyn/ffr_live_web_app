FROM node:alpine AS build-stage

WORKDIR /home/ffr_live_back

COPY package*.json ./

RUN npm install --production

COPY . .

FROM node:alpine

WORKDIR /home/ffr_live_back

COPY --from=build-stage /home/ffr_live_back /home/ffr_live_back

RUN mkdir -p /home/ffr_live_back/uploads

EXPOSE 8080 443

CMD [ "npm", "run", "start:prod" ]