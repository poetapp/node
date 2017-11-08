mongo:
	docker run -d --name poet-mongo -p 27017:27017 mongo:3.4

rabbit:
	docker run -d --name poet-rabbit --hostname my-rabbit -p 5671-5672:5671-5672 rabbitmq:3

sh-mongo:
	docker run -it --link poet-mongo:mongo --rm mongo sh -c 'exec mongo "$$MONGO_PORT_27017_TCP_ADDR:$$MONGO_PORT_27017_TCP_PORT/test"'