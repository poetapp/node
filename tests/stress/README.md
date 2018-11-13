# The Po.et Node Stress Tests

The stress test are written with [K6](https://k6.io/)


## Installation:

https://docs.k6.io/docs/installation


## Running K6:

https://docs.k6.io/docs/running-k6


```
docker-compose up
npm run create-claim-api // only for creating works
```

Alternatives to run the tests:

Docker 

`docker run -i loadimpact/k6 run - <script.js`

CLI

`k6 run -e CLAIM_HOST=http://localhost:9000 ./tests/stress/createWorks.js`

Options:

--vus 10 --duration 30s