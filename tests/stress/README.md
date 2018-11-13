# The Po.et Node Stress Tests

The stress tests are written with [K6](https://k6.io/)


## Running Local K6:

```bash
docker-compose up
```

If you test the endpoint create work, you requires run this line

```bash
docker-compose exec k6 npm run create-claim-api
```

```bash
docker-compose exec k6 bash
```

Example:

```bash
k6 run ./tests/stress/createWorks.js
```