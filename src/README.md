# Po.et Node

## Architecture

The Po.et node is made of micro-service like services.

The services that make up the Po.et Node behave as if they were true microservices: isolated applications with no knowledge of each other's source code. In practice, they all live in the same code base, are started by the root code file, `src/index.ts` and run in the same process, rather than as true separate applications.

This greatly reduces the amount of work needed to install and run the Po.et Node without depending on a container system such as Docker, and allows for less maintenance overhead and faster development, while still reaping the benefits of microservices in regards to separation of concerns and serving as a bridge towards scalability.

### Service Guidelines

- Services communicate via pub/sub using [RabbitMQ], never directly.
- Each service initializes and maintains its own mongo collections
- Services must not access another services mongo collections. 
- Factory functions are used as the main form of encapsulation and layered separation of concerns.
- [Dependency Injection] is implemented manually. See [Inversion of Control]
- Code makes use of both OOP and FP techniques. See: [FP vs OO](http://blog.cleancoder.com/uncle-bob/2018/04/13/FPvsOO.html)

[SOLID]: https://en.wikipedia.org/wiki/SOLID
[RabbitMQ]: https://www.rabbitmq.com/
[Inversion of Control]: https://en.wikipedia.org/wiki/Inversion_of_control
[Dependency Injection]: https://en.wikipedia.org/wiki/Dependency_injection
