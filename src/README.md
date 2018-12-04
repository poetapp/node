# Po.et Node

## Architecture

The Po.et node is made of micro-service like services.

### Service Guidelines

- Each service initializes and maintains its own mongo collections
- Services should not access another services mongo collections. 
- Services communicate via pub/sub using [RabbitMQ]
- Services should not communicate directly.
- Classes are used as the main form of object creation.
- Dependency Injection via [InversifyJS] is used to assist with [SOLID] principles
- Code makes use of both OOP and FP techniques. See: [FP vs OO](http://blog.cleancoder.com/uncle-bob/2018/04/13/FPvsOO.html)

[InversifyJS]: https://github.com/inversify/InversifyJS
[SOLID]: https://en.wikipedia.org/wiki/SOLID
[RabbitMQ]: https://www.rabbitmq.com/
