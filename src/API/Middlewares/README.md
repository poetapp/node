# API Middlewares

## HttpExceptions

This middleware is responsible for converting exceptions thrown in the API module into HTTP responses.

If there's an error this middleware has no knowledge of, `Internal Server Error` is returned.

No other file in the module should have knowledge about HTTP response statuses.

## Logger

Adds the passed logger to KOA's `context`, making it available to other middlewares.

## RequestValidation

Adds Joi validation to API endpoints.
