SHELL := /bin/bash
mongo:
	docker run -d --name poet-mongo -p 27017:27017 mongo:3.4

rabbit:
	docker run -d --name poet-rabbit --hostname my-rabbit -p 5671-5672:5671-5672 rabbitmq:3

ipfs:
	docker run -d --name poet-ipfs -p 8080:8080 -p 4001:4001 -p 127.0.0.1:5001:5001 jbenet/go-ipfs:latest

sh-mongo:
	docker run -it --link poet-mongo:mongo --rm mongo sh -c 'exec mongo "$$MONGO_PORT_27017_TCP_ADDR:$$MONGO_PORT_27017_TCP_PORT/test"'

sh-ipfs:
	docker exec -it poet-ipfs /bin/sh

setup:
	if [ -d ~/.nvm ]; then \
		. $$NVM_DIR/nvm.sh ; \
		nvm install; \
	fi;
	npm install
	npm run build
	npm start

all: mongo rabbit ipfs setup

containers: mongo rabbit ipfs

start-api:
	npm start

start: containers start-api

stop:
	docker stop $$(docker ps -a -q)

clean:
	if [ -d "node_modules" ]; then \
		rm -rf node_modules ; \
	fi;
	docker rm $$(docker ps -a -f name=poet-* -q)
    
