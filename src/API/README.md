# API

This module manages the HTTP API of the Po.et Node.

It has a close relationship with the View module: the View module is in charge of listening to different RMQ messages to build the state of the Po.et Node that is exposed to the world and the API module is in charge of actually exposing it to the world.

As such, API is the only module that has direct access to another module's DB: the View's module. This access is read-only.

For write operations (`POST` requests), the API broadcasts a RMQ message signaling the user's intent and immediately returns an ACK.

## Middlewares

See [/middlewares](/middlewares).
