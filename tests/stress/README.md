# The Po.et Node Stress Tests

The stress tests are written with [K6](https://k6.io/)

## Running Local:

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

## Running against an External Domain:

```bash
docker-compose run -e NODE_HOST=https://regtest.qa.poetnetwork.net k6 bash
```

Inside the docker you can use the tool `K6`. 

Example:

```bash
npm run create-claim-api &
k6 run ./tests/stress/createWorks.js
```

## Environment variables:

NODE_HOST: The node Po.et location
CLAIM_HOST: The Api for create a Claim