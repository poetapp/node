FROM node:10.14.2-alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
COPY . /usr/src/app/

RUN apk add --no-cache --virtual .gyp python make git g++ libtool autoconf automake \
    && npm ci

RUN npm run build

FROM node:10.14.2-alpine as app

RUN apk add git

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .
CMD [ "npm", "start" ]
