# Po.et Node

## Architecture

The Po.et node is made of micro-service like services.

### Service Guidlines

- Each service initializes and maintains its own mongo collections
- Services should not access another services mongo collections. 
- Services communicate via pub/sub using [RabbitMQ]
- Services should not communicate directly.
- Classes are used as the main form of object creation.
- Dependency Injection via [InversifyJS] is used to assist with [SOLID] principles

[InversifyJS]: https://github.com/inversify/InversifyJS
[SOLID]: https://en.wikipedia.org/wiki/SOLID
[RabbitMQ]: https://www.rabbitmq.com/
