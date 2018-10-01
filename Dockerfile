FROM node:10.11.0

RUN echo "deb http://ftp.us.debian.org/debian unstable main contrib non-free" >> /etc/apt/sources.list.d/unstable.list

RUN apt-get update && apt-get install -y rsync \
                       gcc-5 \
                       g++-5 \
                       && rm -rf /var/lib/apt/lists/* \
                       && rm /etc/apt/sources.list.d/unstable.list

RUN rm /usr/bin/g++ && ln -s /usr/bin/g++-5 /usr/bin/g++

RUN echo 'PS1="\u@${POET_SERVICE:-noService}:\w# "' >> ~/.bashrc

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . /usr/src/app/

RUN npm run build

CMD [ "npm", "start" ]
