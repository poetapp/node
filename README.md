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
    - [Install](#install)
    - [Docker](#docker)
    - [Makefile](#makefile)
    - [Dependencies](#dependencies)
    - [Configuration](#configuration)
- [API](#api)
    - [Building Claims](#building-claims)
    - [Running as a Daemon](#running-as-a-daemon)
    - [Supported Platforms](#supported-platforms)
- [Contributing](#contributing)
    - [Compiling](#compiling)
    - [Tests](#tests)
    - [Coverage](#coverage)
    - [Branches and Pull Requests](#branches-and-pull-requests)
    - [Code Style](#code-style)


## How to Run the Po.et Node
To run the Po.et Node, clone this repo, make sure you have [Node.js](https://nodejs.org/) installed and then `npm start`. You also need to have [RabbitMQ](http://www.rabbitmq.com/), [IPFS](https://ipfs.io/), [Bitcoin Core](https://github.com/bitcoin/bitcoin) and [MongoDB](https://github.com/mongodb/mongo) installed (see [Dependencies](#dependencies) below).

### Install
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

# Activate NVM
. ~/.nvm/nvm.sh

# Clone The Po.et Node
git clone https://github.com/poetapp/node.git

# Build The Po.et Node
cd node

# Install NodeJS (will install node version in .nvmrc)
nvm install

npm i
npm run build

# Run The Po.et Node
npm start
```

### Docker
You need to have [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/) installed.
```bash
git clone https://github.com/poetapp/node.git
cd node
docker-compose up --build
```

### Makefile
```bash
# Clone The Po.et Node
git clone https://github.com/poetapp/node.git

cd node

make all

# to clean up and stop processes:
make stop
make clean
```

Make Commands available:
```bash
make all # makes all dependencies
make stop # stops the docker containers
make clean # removes node_modules and all stopped containers
make setup # setup the nodejs dependencies
make containers # creates the dependent docker containers for mongodb, rabbitmq, bitcoind and ipfs
```

### Dependencies
The Po.et Node depends on RabbitMQ, IPFS, MongoDB and Bitcoin Core. By default, it looks for all of them in localhost.

For a quick startup, we provide `make` commands that build and run these dependencies in Docker containers. You will need to have Docker installed and running for this (see [How to Install Docker CE](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-docker-ce)).

You only need to run `sudo make mongo rabbit ipfs` once to create the Docker images, and `sudo make start-all` to start them when they shut down.

You can also `sudo make sh-mongo` and `sudo make sh-ipfs` to run the mongo shell or ssh into the IPFS container.

In a production environment, you may want to run these applications natively installed on the OS rather than dockerized. If you choose to run IPFS dockerized, make sure it's able to communicate with other IPFS nodes outside your network.

### Configuration
The Po.et Node comes with a default configuration that mostly works out of the box.

By default, timestamping to the blockchain is disabled, and Bitcoin Core, RabbitMQ, IPFS and MongoDB are expected to be running on localhost with their default ports.

You can change any configuration by placing a JSON file in `~/.po.et/configuration.json`. Po.et will look for this file upon startup and, if found, merge its contents with the default configuration.

Alternatively, you can pass configuration values via environment variables. The keys of these environment variables are always the SCREAMING_SNAKE_CASE equivalent of the configuration options listed in the default configuration. For example, the RabbitMQ URL can be set with a `rabbitmqUrl` entry in `~/.po.et/configuration.json` or with the `RABBITMQ_URL` environment variable.

> **Note**: Po.et will NOT reload the configuration while it's running if you change it. You will need to restart the Node for configuration changes to apply.

This is what the default configuration looks like:

```js
{
  rabbitmqUrl: 'amqp://localhost',
  mongodbUrl: 'mongodb://localhost:27017/poet',
  ipfsUrl: 'http://localhost:5001',
  bitcoinUrl: '127.0.0.1',
  bitcoinPort: 18332,
  bitcoinNetwork: 'testnet',
  bitcoinUsername: 'bitcoinrpcuser',
  bitcoinPassword: 'bitcoinrpcpassword',

  apiPort: 18080,
  poetNetwork: 'BARD',
  poetVersion: [0, 0, 0, 2],
  minimumBlockHeight: 1253828,
  blockchainReaderIntervalInSeconds: 5,

  // insightUrl will soon be deprecated
  insightUrl: 'https://test-insight.bitpay.com/api',
  bitcoinAddress: '',
  bitcoinAddressPrivateKey: '',

  enableTimestamping: false,
  timestampIntervalInSeconds: 30,
  batchCreationIntervalInSeconds: 600
  readNextDirectoryIntervalInSeconds: 30
}
```

The node works out-of-the-box with the default configuration as long as it's running with the MongoDB, IPFS, RabbitMQ and Bitcoin Core docker images provided in this repository (see [docker-compose.yml](./docker-compose.yml)).

Anchoring to the Bitcoin blockchain must always be enabled manually. This is done by setting `enableTimestamping` to `true` and providing a valid `bitcoinAddress` and the corresponding `bitcoinAddressPrivateKey`.

A valid Bitcoin address can be created using [Ian Coleman's Mnemonic Code Converter](https://iancoleman.io/bip39/), or by creating and exporting the private keys and addresses from bitcoin-cli or wallets that support key exporting.

The configured Bitcoin address must have enough Bitcoins to afford transaction fees. One way to get free testnet coins is using a [testnet faucet](https://www.google.com.ar/search?q=testnet+faucet). We've found [flyingkiwi's one](https://testnet.manu.backend.hamburg/faucet) particularly nice.

To use a custom instance of Bitcoin Core, the instance must be running with RPC enabled and `bitcoinUsername` and `bitcoinPassword` must be set to the Bitcoin RPC username and password, respectively.

## API
Currently, the Node exposes four endpoints.

### `GET /works/:id`
Returns a single claim by its Id.

For simplicity, this endpoint adds a `.timestamp` in the response, which is not a real part of the claim, but provides valuable information such as the ID of the transaction in which this claim has been timestamped, the IPFS directory hash in which it can be found, etc.

A 404 error is returned if the claim isn't found in this Node's database. This doesn't strictly mean the claim does not exist in the Po.et Network — it just doesn't exist in this Node.

### `GET /works?publicKey=...&limit=x&offset=x`
Returns a paginated array of claims, with all of the claims belonging to the passed public key. Default limit per request is 10 claims. This is configurable with limit and offset paramaters where offset is the number of claims to skip and limit is the number of claims returned per request.

### `GET /works?offset=x&limit=x`
Returns a paginated array of claims, which defaults to 10 per request. This is configurable with limit and offset parameters where offset is the number of claims to skip and limit is the number of claims returned per request.

### `POST /works`
Publish a work.

This endpoint is async, unless an immediate error can be detected (e.g., a malformed claim), in which case the endpoint will return an ACK. There is no guarantee that the work has actually been processed, timestamped and sent to IPFS. To confirm that, you'll need to `GET /works/:id` and check the `.timestamp` attribute.

This endpoint expects a fully constructed claim — with the correct `.id`, `.publicKey`, `.signature` and `.dateCreated`. See [Building Claims](#building-claims) for information on how to correctly create these attributes.

## Building Claims
A Po.et Claim is a JSON object that holds arbitrary information plus a few attributes that allow the network to verify that the claim:

- has actually been created by a specific person,
- has not been modified since its creation, and
- contains a special field `type` which will allow more features in the future.

<!-- [TODO: Remove the rest of this section on building claims and replace with a link to `documentation/blob/master/protocol/claims.md`] -->

For example, a claim could look like this:
```js
{
  id: '15867401b92567b4f7ea83e39a646ab9eb581b560bc78488b7a0c1b586c70215',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature: '304402201824b78d3703162eb7f240341968ebfecad1f002f988dbc9ec80c1317e49d6290220470124c7425a5d8024778991863f0a25931a7e45fb72223bea81728a08e30b50',
  type: ClaimType.Work,
  created: new Date('2017-12-11T22:58:11.375Z').toISOString(),
  attributes: {
    name: 'The Murders in the Rue Morgue',
    author: 'Edgar Allan Poe',
    tags: 'short story, detective story, detective',
    dateCreated: '1841-01-01T00:00:00.000Z',
    datePublished: '1841-01-01T00:00:00.000Z',
    text: 'The mental features discoursed of as the analytical, are, in themselves, but little susceptible of analysis...'
  }
}

```

The `publicKey` field must be set to the public part of a key pair you own. You'll need the corresponding private key to prove this claim was generated by you.

The `signature` must be set to the result of cryptographically signing the `id` field with the private key you own using the elliptic curve DSA signature scheme. This signature is currently being validated with [bitcore.Crypto.ECDSA.verify](https://github.com/bitpay/bitcore-lib/blob/master/lib/crypto/ecdsa.js#L270), and we're using [bitcore.Crypto.ECDSA.sign](https://github.com/bitpay/bitcore-lib/blob/master/lib/crypto/ecdsa.js#L279) to sign our claims.

The `id` field is the `sha256` of the claim, excluding the `id` and `signature` fields, so `getId(claim) == getId(getId(claim))`. We're using [DigitalBazaar's jsonld](https://github.com/digitalbazaar/jsonld.js) implementation of [JSON-LD](https://www.w3.org/2018/jsonld-cg-reports/json-ld/) in order to serialize the claims to a byte buffer deterministically and hashing this byte buffer.

### Po.et JS
All this logic is abstracted away in [Po.et JS](https://github.com/poetapp/poet-js), so if you're working with JavaScript or TypeScript you can simply use the `createClaim(privateKey, claimType, attributes)` function like so:

```ts
import { ClaimType, createClaim } from '@po.et/poet-js'

const privateKey = <YOUR_PRIVATE_KEY>

const claim = await createClaim(privateKey, ClaimType.Work, {
  name: 'The Murders in the Rue Morgue',
  author: 'Edgar Allan Poe',
  tags: 'short story, detective story, detective',
  dateCreated: '1841-01-01T00:00:00.000Z',
  datePublished: '1841-01-01T00:00:00.000Z',
  text: 'The mental features discoursed of as the analytical, are, in themselves, but little susceptible of analysis...'
})

```

> You can find more examples on how to build and publish claims in the integration tests in [test/Integration/PostWork](./test/Integration/PostWork.ts).

### Running as a Daemon
Create a file with the following contents and place it in `~/.config/systemd/user/poet-node.service`:

```
[Unit]
Description=Po.et Node Daemon
After=network.target

[Service]
ExecStart=/home/ubuntu/.nvm/versions/node/v10.9.0/bin/node /home/ubuntu/node/dist/babel/src/index.js daemon
WorkingDirectory=/home/ubuntu/node/dist/babel/src/
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=poet-node

[Install]
WantedBy=default.target
```

Make sure the paths to Node.js and Po.et in the `ExecStart` and `WorkingDirectory` entries are correct.

You can then use the following commands to handle the daemon:
```
systemctl --user start poet-node
systemctl --user stop poet-node
systemctl --user about poet-node
systemctl --user restart poet-node
```

And `journalctl -f --user-unit poet-node` to tail the logs, or without the `-f` to just `less` them.

### Supported Platforms
The Po.et Node has been tested on Ubuntu, Linux Mint and Mac OS X.

The `npm run build` command depends on `npm run build-clear` and `npm run copy-json`, which use bash' `rm` and `cp`. Therefore building under Windows may require some tweaking.

## Contributing

### Compiling
Run `npm run build` to compile the source. This will run TypeScript on the source files and place the output in `dist/ts`, and will then run Babel and place the output in `dist/babel`.

Currently, we're only using Babel to support [absolute import paths](https://github.com/tleunen/babel-plugin-module-resolver).

During development, you can also run `npm run watch` to automatically watch for file changes, build the changed files and restart the application on the fly.

### Tests
Unit and integration tests are located in this repo. You can run both with `npm test` or separately with `npm run test:unit` and `npm run test:integration`.

The integration tests are hard-coded to hit `http://localhost:18080`. In the future, this will be picked up from an environment variable and defaulted to that same url.

> **Warning:** Running the integration tests wipes out the entire `db.poet.works` collection and inserts testing data. This is done by the `test/integration/PrepareDB.ts` file. In the future, a less invasive mechanism will be developed. Meanwhile, make sure you're comfortable with this before running the integration tests!

Functional tests are run as follows:

  - Setup a docker-compose override file
```bash
  $ cp docker-compose.override.yml.example docker-compose.override.yml
```
  - Edit the new file and uncomment the 'bitcoind-2' service
      - DO NOT uncomment the `volumes` section. It is only used for debugging.
  - Build and run the functional tests
```bash
  $ docker-compose build
  $ docker-compose up
  $ docker-compose exec poet-node npm run test:functional
```

See issues [#22](poetapp/node#22), [#25](poetapp/node#25) and [#27](poetapp/node#27) for more info on this topic.

### Coverage
Coverage is generated with [Istanbul](https://github.com/istanbuljs/nyc). A more complete report can be generated by running `npm run coverage`, which will run `npm run coverage:unit` and `npm run coverage:integration` together. You may also execute these commands separately.

> Note: We are using our own forks of [nyc](https://github.com/istanbuljs/nyc) and [istanbul-lib-instrument](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-instrument) in order to add better support for TypeScript. We intend to contribute our forks back to nyc and istanbul-lib-instrument in order to make our solution available to the entire community. You can follow the issues in this [PR](https://github.com/poetapp/node/pull/230), and check the new PRs for [istanbul-lib-instrument](https://github.com/istanbuljs/istanbuljs/pull/204).

### Branches and Pull Requests
The master branch is blocked - no one can commit to it directly. To contribute changes, branch off of master and make a pull request back to it. Travis CI will run all tests automatically for all submitted pull requests, including linting (`npm run lint`). You can run `npm run lint:fix` for quick, automatic lint fixes.
