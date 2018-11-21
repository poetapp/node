# The Po.et Node

[![Build Status](https://travis-ci.org/poetapp/node.svg?branch=master)](https://travis-ci.org/poetapp/node)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Docker Automated build](https://img.shields.io/docker/automated/poetapp/node.svg?style=flat)](https://hub.docker.com/r/poetapp/node/)
[![Join the chat at https://gitter.im/poetapp/Lobby](https://badges.gitter.im/poetapp/Lobby.svg)](https://gitter.im/poetapp/Lobby)

The Po.et Node allows you to timestamp documents in a decentralized manner.

It's built on top of the [Bitcoin](https://github.com/bitcoin/bitcoin) blockchain and [IPFS](https://ipfs.io/).

## Index

- [How to Run the Po.et Node](#how-to-run-the-poet-node)
    - [Dependencies](#dependencies)
    - [Configuration](#configuration)
- [API](#api)
- [Building Claims](#building-claims)
- [Contributing](#contributing)
    - [Compiling](#compiling)
    - [Tests](#tests)
    - [Coverage](#coverage)
    - [Branches and Pull Requests](#branches-and-pull-requests)

## How to Run the Po.et Node

To run the Po.et Node, clone this repo, and make sure you have [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/) installed.

Clone the repo:
```bash
git clone https://github.com/poetapp/node.git
cd node
```

To start the Po.et Node environment, run:
```bash
docker-compose up --build
```

Using the instructions above, new blocks have to be generated manually. This is often desirable during development. To have blocks automatically generated, follow the instructions below instead to mine a new block every 5 seconds.

```bash
  $ cp docker-compose.override.yml.example docker-compose.override.yml
  # Edit docker-compose.override.yml and uncomment
  # the `regtest-watcher` service in `docker-compose.yml`
  $ docker-compose up --build
```

You only need to run `docker-compose build` to create or update the Docker images, and `docker-compose up -d` to start them. To shut everything down, it is recommended to use `docker-compose down --volumes`  to stop the running containers and clear any data. If you wish to keep data between invocations, use `docker-compose down`.

You can also `docker-compose exec mongo bash` and `docker-compose exec ipfs bash` to run the mongo shell or ssh into the IPFS container.

### Dependencies

The Po.et Node depends on [RabbitMQ](http://www.rabbitmq.com/), [IPFS](https://ipfs.io/), [Bitcoin Core](https://github.com/bitcoin/bitcoin) and [MongoDB](https://github.com/mongodb/mongo).

These dependencies are setup automatically when you run `docker-compose`.

### Configuration

The Po.et Node comes with a default configuration that works out of the box, which can be found here:
https://github.com/poetapp/node/blob/master/src/Configuration.ts#L82-L141

By default, anchoring to the blockchain is disabled (`enableAnchoring: false`). If you want to enable blockchain anchoring, you will need to the Bitcoin Core dependency to be running with a funded wallet so that it can pay the Bitcoin network transaction fees (either for testnet or real Bitcoin for mainnet).

You can change any configuration by passing configuration values via environment variables. The keys of these environment variables are always the SCREAMING_SNAKE_CASE equivalent of the configuration options listed in the default configuration. For example, the RabbitMQ URL (`rabbitmqUrl`) can be set with the `RABBITMQ_URL` environment variable.

> **Note**: Po.et will NOT reload the configuration while it's running if you change it. You will need to restart the Node for configuration changes to apply.

## API
Currently, the Node exposes four endpoints.

### `GET /works?issuer=xxx&limit=x&offset=x`
Returns a paginated array of signed verifiable work claims.

Accepts the following query parameters:

- `issuer`: string. If present, will only return works issued by this issuer.
- `limit`: number. Maximum number of results to return per request. Defaults to 10.
- `offset`: number. Number of claims to skip.

### `GET /works/:id`
Returns a single signed verifiable work claim by its Id.

For simplicity, this endpoint adds a `.anchor` in the response, which is not a real part of the claim, but provides valuable information such as the ID of the transaction in which this claim has been anchored, the IPFS directory hash in which it can be found, etc.

A 404 error is returned if the claim isn't found in this Node's database. This doesn't strictly mean the claim does not exist in the Po.et Network — it just doesn't exist in this Node.

### `POST /works`
Publish a signed verifiable work claim.

This endpoint is async and returns an ACK, unless an immediate error can be detected (e.g., a malformed claim). There is no guarantee that the work has actually been processed, sent to IPFS and anchored. To confirm that, you'll need to `GET /works/:id` and check the `.anchor` attribute.

This endpoint expects a fully constructed signed verifiable claim — with the correct `'@context'`, `.id`, `.issuer`, `.issuanceDate`, `.type`, and `sec:proof`. See [Building Claims](#building-claims) for information on how to correctly create these attributes.

### `POST /files`
Takes a multipart file upload. Currently only allows 1 file to be uploaded at a time and accepts 1 field which is the file to upload.

Returns an array with an object containing the hash and the archive URL of the file.

Example:

```
[
  {
    hash: "QmS1s76raH43mLT3dSsMt7Nev1t9bM33GTFTZ9foXJV4ZT",
    archiveUrl: "https://ipfs.io/ipfs/QmS1s76raH43mLT3dSsMt7Nev1t9bM33GTFTZ9foXJV4ZT"
  }
]
```

## Building Claims
A Po.et Claim is a signed verifiable claim that holds arbitrary information and allows the network to verify that the claim:

- has actually been created by a specific person,
- has not been modified since its creation, and
- contains a special field `type` which will allow more features in the future.

For more information about claims and their structure, please see:
https://github.com/poetapp/documentation/blob/master/reference/claims.md

### Verifying the Claim is on Bitcoin's Blockchain

Once node receives a claim, it stores the claim with some metadata including the following:
* The highest block read at the time node stores the claim
* Placeholders for the actual block that was mined including the claim

This allows the node application to track whether or not the claim actually has been successfully saved to the Bitcoin blockchain. There is a configuration value, `maximumTransactionAgeInBlocks`, that determines how far ahead the blockchain will grow before resubmitting the claim. Comparing this value against the delta between the highest block read and the block read at the time of claim creation will determine whether node resubmits the claim.


### Po.et JS
All the claim logic is abstracted away in [Po.et JS](https://github.com/poetapp/poet-js), so if you are working with JavaScript or TypeScript you can simply use the library:

```ts
import { configureCreateVerifiableClaim, createIssuerFromPrivateKey, getVerifiableClaimSigner } from '@po.et/poet-js'

const { configureSignVerifiableClaim } = getVerifiableClaimSigner()

const issuerPrivateKey = 'LWgo1jraJrCB2QT64UVgRemepsNopBF3eJaYMPYVTxpEoFx7sSzCb1QysHeJkH2fnGFgHirgVR35Hz5A1PpXuH6' 
const issuer = createIssuerFromPrivateKey(issuerPrivateKey)

const createVerifiableWorkClaim = configureCreateVerifiableClaim({ issuer })
const signVerifiableClaim = configureSignVerifiableClaim({ privateKey: issuerPrivateKey })

const workClaim = {
  name: 'The Raven',
  author: 'Edgar Allan Poe',
  tags: 'poem',
  dateCreated: '',
  datePublished: '1845-01-29T03:00:00.000Z',
  archiveUrl: 'https://example.com/raven',
  hash: '<hash of content>',
}

const unsignedVerifiableClaim = await createVerifiableWorkClaim(workClaim)
const signedWorkClaim = await signVerifiableClaim(unsignedVerifiableClaim)
```

> You can find more examples on how to build and publish claims in the integration tests in [tests/API/integration/PostWork.test](./tests/integration/API/PostWork.test.ts).

## Contributing

### Compiling
Run `npm run build` to compile the source. This will run TypeScript on the source files and place the output in `dist/ts`, and will then run Babel and place the output in `dist/babel`.

Currently, we're only using Babel to support [absolute import paths](https://github.com/tleunen/babel-plugin-module-resolver).

During development, you can also run `npm run watch` to automatically watch for file changes, build the changed files and restart the application on the fly.

### Tests
Unit and integration tests are located in this repo. You can run both with `npm test` or separately with `npm run test:unit` and `npm run test:integration`.

The integration tests run in isolated instances of the app and database. 

Functional tests are run as follows:

```bash
  $ docker-compose build
  $ docker-compose up
  $ docker-compose exec poet-node npm run test:functional
```

### Coverage
Coverage is generated with [Istanbul](https://github.com/istanbuljs/nyc). A more complete report can be generated by running `npm run coverage`, which will run `npm run coverage:unit` and `npm run coverage:integration` together. You may also execute these commands separately.

> Note: We are using our own forks of [nyc](https://github.com/istanbuljs/nyc) and [istanbul-lib-instrument](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-instrument) in order to add better support for TypeScript. We intend to contribute our forks back to nyc and istanbul-lib-instrument in order to make our solution available to the entire community. You can follow the issues in this [PR](https://github.com/poetapp/node/pull/230), and check the new PRs for [istanbul-lib-instrument](https://github.com/istanbuljs/istanbuljs/pull/204).

### Branches and Pull Requests
The master branch is blocked - no one can commit to it directly. To contribute changes, branch off of master and make a pull request back to it. Travis CI will run all tests automatically for all submitted pull requests, including linting (`npm run lint`). You can run `npm run lint:fix` for quick, automatic lint fixes.
