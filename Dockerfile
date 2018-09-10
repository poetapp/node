FROM node:10.10.0

RUN apt-get update && apt-get install -y rsync

RUN echo 'PS1="\u@${POET_SERVICE:-noService}:\w# "' >> ~/.bashrc

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . /usr/src/app/

RUN npm run build

CMD [ "npm", "start" ]
