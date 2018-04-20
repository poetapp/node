FROM node:9.3.0

RUN apt-get update && apt-get install -y rsync

RUN mkdir -p /usr/src/app

COPY . /usr/src/app/

COPY app-entrypoint.sh /
RUN chmod +x /app-entrypoint.sh 

WORKDIR /usr/src/app

RUN npm install
RUN npm run build

CMD [ "/app-entrypoint.sh" ]