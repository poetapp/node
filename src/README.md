# Po.et Node

## Architecture

The Po.et node is made of micro-service like services.

The services that make up the Po.et Node behave as if they were true microservices: isolated applications with no knowledge of each other's source code. In practice, they all live in the same code base, are started by the root code file, `src/index.ts` and run in the same process, rather than as true separate applications.

This greatly reduces the amount of work needed to install and run the Po.et Node without depending on a container system such as Docker, and allows for less maintenance overhead and faster development, while still reaping the benefits of microservices in regards to separation of concerns and serving as a bridge towards scalability.

### Service Guidelines

- Services communicate via pub/sub using [RabbitMQ], never directly.
- Event, queue or exchange names must not include the name of the service creating it.
- Each service initializes and maintains its own mongo collections
- Services must not access another services mongo collections. 
- Factory functions are used as the main form of encapsulation and layered separation of concerns.
- [Dependency Injection] is implemented manually. See [Inversion of Control]
- Code makes use of both OOP and FP techniques. See: [FP vs OO](http://blog.cleancoder.com/uncle-bob/2018/04/13/FPvsOO.html)

### Service Layers

Each service is made up of several layers, each with different responsibilities. In this sense, all services look exactly the same. Most or all of them have these layers:

#### Root

A root file, with the same name of the service. For example: src/BlockchainReader/BlockchainReader.ts.

This file is the [composition root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/), and as such has two responsibilities:
- Starting up everything
- Wiring everything

These files are modules, not scripts. They do not do anything on their own and they can't be run. Instead, they export the entry point to the service.

Other files can import the service and call `.start()` on it.

#### Router

The router is responsible for managing interaction between the service and the "outside world". This can be via any means of communication, such as HTTP with Koa or AMQP with RabbitMQ. It must have no business logic, and should hide away all details of the libraries used for communication.

It should also be the only file responsible for _answering_ requests or publishing messages. 

#### Controller

Controllers own business logic. The controller is, ideally, the only place where business logic should reside, and business logic is the only thing that should reside in them. Controllers should not interact directly with any dependency (such as MongoDB, IPFS, Bitcoin, RabbitMQ) or having any type of messaging logic (Koa, RabbitMQ).

In practice, business logic also lives in DAOs and, in some cases, Services. See respective sections for information regarding this.

#### DAO

Services can have any number of DAOs, usually one per collection. DAOs abstract away details of the database engine. For performance reasons it is not practical to completely remove all business logic from DAOs, so what functions a DAO has is usually dictated by a controller, in the sense of what data needs to be written or read. _How_ this data is written or read is an implementation detail of the DAO and should not be leaked to other layers.

#### Service

The confusingly named Service layer consists of relatively thin wrappers around Timers, which themselves are thin wrappers of `setTimeout`. In that sense, a Service is akin to a cron job, a timer that periodically runs a function.

There are currently two different approaches to services in the code base:
- The service calling a function of the controller directly
- The service firing a RMQ message

The first approach breaks the rule of having the router be the only one that communicates with the router, the second approach breaks the rule of having the router be the only one that publishes messages.

The BlockchainReader Service in particular also has some business logic and mutable state.

There is room from improvement in this area.

If implementing a new Service, prefer the second approach (firing a RMQ message) whenever possible.

[SOLID]: https://en.wikipedia.org/wiki/SOLID
[RabbitMQ]: https://www.rabbitmq.com/
[Inversion of Control]: https://en.wikipedia.org/wiki/Inversion_of_control
[Dependency Injection]: https://en.wikipedia.org/wiki/Dependency_injection
