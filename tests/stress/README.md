# The Po.et Node Stress Tests

The stress tests are written with [K6](https://k6.io/)

## Running Local:

```bash
docker-compose up
```

If your test is the `create work` endpoint, you need to run this line

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
docker-compose run -e NODE_HOST=https://domain k6 bash
```

Inside the docker you can use the tool `K6`. 

Example:

```bash
npm run create-claim-api &
k6 run ./tests/stress/createWorks.js
```

## Options K6

--vus (int): k6 works with the concept of virtual users (VUs), which run scripts - they're essentially glorified, parallel while(true) loops.

Example:

`k6 run --vus 10 script.js`

--duration (int)s: Running a 30-second, 10-VU load test

Example:

`k6 run --vus 10 --duration 30s script.js`

More options on: https://docs.k6.io/docs/options

## Environment variables:

- NODE_HOST: The node Po.et location
- CLAIM_HOST: The Api for create a Claim

