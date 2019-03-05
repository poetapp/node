FROM node:10.14.2

RUN apt-get update && apt-get install -y rsync \
                       netcat \
                       gcc \
                       g++ \
                       && rm -rf /var/lib/apt/lists/*

RUN echo 'PS1="\u@${POET_SERVICE:-noService}:\w# "' >> ~/.bashrc

COPY package*.json /tmp/
RUN cd /tmp && npm ci
RUN mkdir -p /usr/src/app/ && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app
ADD . /usr/src/app/

RUN npm run build

COPY Docker/tools/wait-for-it.sh /
RUN chmod +x /wait-for-it.sh

CMD [ "npm", "start" ]