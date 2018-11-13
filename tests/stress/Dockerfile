FROM node:10.12.0

RUN apt-get update -y
RUN apt-get install curl apt-transport-https -y 

RUN apt-get update && apt-get install -y gnupg
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 379CE192D401AB61
RUN echo "deb https://dl.bintray.com/loadimpact/deb stable main" | tee -a /etc/apt/sources.list
RUN apt-get update
RUN apt-get install k6

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

CMD exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
