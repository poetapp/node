# The Po.et Node Stress Tests

The stress tests are written with [K6](https://k6.io/)

## Running Local K6:

```bash
docker-compose up
```

If your test is the endpoint `create work`, you need to run this line

```bash
docker-compose exec k6 npm run create-claim-api
```

```bash
docker-compose exec k6 bash
```

Inside the docker you can use the tool `K6`. 

Example:

```bash
k6 run ./tests/stress/createWorks.js
```