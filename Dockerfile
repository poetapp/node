FROM node:9.11.1

RUN apt-get update && apt-get install -y rsync

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install
RUN npm run build

CMD [ "npm", "start" ]