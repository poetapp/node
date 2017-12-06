mongo:
	docker run -d --name poet-mongo -p 27017:27017 mongo:3.4

rabbit:
	docker run -d --name poet-rabbit --hostname my-rabbit -p 5671-5672:5671-5672 rabbitmq:3

ipfs:
	docker run -d --name poet-ipfs -v ~/.ipfs-docker/:/data/ipfs -p 8080:8080 -p 4001:4001 -p 127.0.0.1:5001:5001 jbenet/go-ipfs:latest

sh-mongo:
	docker run -it --link poet-mongo:mongo --rm mongo sh -c 'exec mongo "$$MONGO_PORT_27017_TCP_ADDR:$$MONGO_PORT_27017_TCP_PORT/test"'

sh-ipfs:
	docker exec -it poet-ipfs /bin/sh

start-all:
	docker start poet-mongo poet-rabbit poet-ipfs