# The Po.et Node

[![Greenkeeper badge](https://badges.greenkeeper.io/poetapp/node.svg)](https://greenkeeper.io/)

The Po.et Node allows you to timestamp documents in a decentralized manner. 

It's built on top of the Bitcoin's blockchain and [IPFS](https://ipfs.io/).

## Index

- [How to Run the Po.et Node](#how-to-run-the-poet-node)
    - [Install](#install)
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
- [Roadmap](#roadmap)


## Gitter
For any questions about developing an application that integrates with the Po.et Node or contributing to Po.et that aren't answered here check out our Gitter community at https://gitter.im/poetapp.

## How to Run the Po.et Node
To run the Po.et Node, you need to clone this repo, make sure you have NodeJS installed and just `npm start`.
You also need to have RabbitMQ, IPFS and MongoDB installed. See [Dependencies](#dependencies) down below.

### Install
```
# Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

# Activate NVM
. ~/.nvm/nvm.sh

# Install NodeJS
nvm install 9.3.0

# Clone The Po.et Node
git clone https://github.com/poetapp/node.git

# Build The Po.et Node
cd node
npm i
npm run build

# Run The Po.et Node
npm start
```

### Dependencies
The Po.et Node depends on RabbitMQ, IPFS, MongoDB and InsightAPI. By default, it looks for all these things in localhost, except for the InsightAPI, which defaults to https://test-insight.bitpay.com/. 

For a quick startup, we provide `make` commands that build and run these dependencies in Docker containers.
You just need to `sudo make mongo rabbit ipfs` once to create the Docker images, and `sudo make start-all` to start them when they shut down.

You can also `sudo make sh-mongo` and `sudo make sh-ipfs` to run the mongo shell or ssh into the IPFS container.

You'll need to have Docker installed and running for this. See [How to Install DockerCR](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-docker-ce).

No Docker image is provided for InsightAPI since Bitpay offers a usable InsightAPI publicly.

In a production environment, you may want to run these applications natively installed on the OS rather than dockerized. If you choose to run IPFS dockerized, make sure it's able to communicate with other IPFS nodes outside your network.

### Configuration
The Po.et Node comes with a default configuration that works out of the box.

By default, timestamping to the blockchain is disabled, and RabbitMQ, IPFS and MongoDB are expected to be running in localhost with their default ports.

You can change any configuration by placing a json file in `~/.po.et/configuration.json`. Po.et will look for this file upon startup and, if found, merge its contents with the default configuration. 

> **Note**: Po.et will NOT reload the configuration while it's running if you change it. You'll need to restart the Node for configuration changes to apply.

This is what the default configuration looks like:

```
{
  rabbitmqUrl: 'amqp://localhost',
  mongodbUrl: 'mongodb://localhost:27017/poet',
  ipfsUrl: 'http://localhost:5001',
  insightUrl: 'https://test-insight.bitpay.com/api',

  apiPort: 18080,
  poetNetwork: 'BARD',
  poetVersion: [0, 0, 0, 2],
  minimumBlockHeight: 1253828,
  blockchainReaderIntervalInSeconds: 5,

  enableTimestamping: false,
  bitcoinAddress: '',
  bitcoinAddressPrivateKey: '',
  timestampIntervalInSeconds: 30
}
```

To enable timestamping to the Bitcoin blockchain, you need to set `enableTimestamping` to `true` and provide a valid `bitcoinAddress` and the `bitcoinAddressPrivateKey` that owns it.

You can create a valid bitcoin address using [Ian Coleman's Mnemonic Code Converter](https://iancoleman.io/bip39/), creating and exporting the private keys and addresses from bitcoin-cli or wallets that support this or use any other means that work for you. 

You'll also need some bitcoins in that address. In testnet, you can get some for free using a [testnet faucet](https://www.google.com.ar/search?q=testnet+faucet). We've found [flyingkiwi's one](https://testnet.manu.backend.hamburg/faucet) particularly nice.

Right now, Po.et is timestamping to Testnet, so just make sure your address is a valid Testnet address.

### API
Currently, the Node exposes three endpoints.

#### `GET /works/:id`
Returns a single claim by its Id. 

For simplicity, this endpoint adds a `.timestamp` in the response, which is not a real part of the claim, but provides valuable information such as the id of the transaction in which this claim has been timestamped, the IPFS hash by which it can be found, etc.

Returns 404 if the claim isn't found in this Node's database. This doesn't strictly mean the claim doesn't exist in the Po.et network — it just doesn't exist in this Node.

#### `GET /works?publicKey=...`
Returns an array of claims — all the claims belonging to the passed public key.

#### `GET /works`
Retrieving all works isn't supported yet. The Node will assumme you intended to call `GET /works?publicKey=undefined`, which will normally return an empty array. Support for this endpoint will be added in the future.

#### `POST /works`
Publish a work. 

This endpoint is async — unless an immediate error can be detected (such as a malformed claim), the endpoint will return an ACK. There's no guarantee that the work has actually been processed, timestamped an sent to IPFS. To check that, you'll need to `GET /works/:id` and check the `.timestamp` attribute.

This endpoint expects a fully constructed claim — with the correct `.id`, `.publicKey`, `.signature` and `.dateCreated`. See [Building Claims](#building-claims) for information on how to correctly create these attributes.

### Building Claims
A Po.et Claim is a JSON object that holds arbitrary information plus a few attributes that allow the network to verify that the claim has actually been created by a certain person, that the claim has not been modified since its creation, and a special field `type` which will allow more features in the future.

For example, a claim could look like this:
```js
{
  id: '15867401b92567b4f7ea83e39a646ab9eb581b560bc78488b7a0c1b586c70215',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature: '304402201824b78d3703162eb7f240341968ebfecad1f002f988dbc9ec80c1317e49d6290220470124c7425a5d8024778991863f0a25931a7e45fb72223bea81728a08e30b50',
  type: ClaimType.Work,
  dateCreated: new Date('2017-12-11T22:58:11.375Z'),
  attributes: {
    name: 'The Murders in the Rue Morgue',
    author: 'Edgar Allan Poe',
    tags: 'short story, detective story, detective',
    dateCreated: '1841-01-01T00:00:00.000Z',
    datePublished: '1841-01-01T00:00:00.000Z',
    content: 'The mental features discoursed of as the analytical, are, in themselves, but little susceptible of analysis...'
  }
}

```

The `publicKey` field must be set to the public part of a key pair you own. You'll need the corresponding private key to proove this claim was generated by you. 

The `signature` must be set to the result of cryptographically signing the `id` field with the private key you own using the elliptic curve DSA signature scheme. This signature is currently being validated with [bitcore.Crypto.ECDSA.verify](https://github.com/bitpay/bitcore-lib/blob/master/lib/crypto/ecdsa.js#L270), and we're using [bitcore.Crypto.ECDSA.sign](https://github.com/bitpay/bitcore-lib/blob/master/lib/crypto/ecdsa.js#L279) to sign our claims.

The `id` field is the `sha256` of the claim, excluding the `id` and `signature` fields, so `getId(claim) == getId(getId(claim))`. We're using [decodeIO's implementation of](https://github.com/dcodeIO/protobuf.js) Google's [Protobuf library](https://github.com/google/protobuf) in order to serialize the claims to a byte buffer deterministically and hashing this byte buffer. The `.proto` file we're using can be found in [src/Serialization/PoetProto.json](./src/Serialization/PoetProto.json). There's a [poet.proto](./src/Serialization/poet.proto) file that you can use in any other programming language.

All this logic is abstracted away in four functions in our [Claim Helper](./src/Helpers/Claim.ts). We'll move this to a new version of [poet-js](https://github.com/poetapp/poet-js) soon, so there won't be any need to delve into these details. Just calling `createClaim(privateKey, claimType, attributes)` will do.

> You can find examples on how to build and publish claims in the integration tests in [test/Integration/PostWork](./test/Integration/PostWork.ts).

### Running as a Daemon
Create a file with the following contents and place it in `~/.config/systemd/user/poet-node.service`:

```
[Unit]
Description=Po.et Node Daemon
After=network.target

[Service]
ExecStart=/home/ubuntu/.nvm/versions/node/v9.3.0/bin/node /home/ubuntu/node/dist/babel/src/index.js daemon
WorkingDirectory=/home/ubuntu/node/dist/babel/src/
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=poet-node

[Install]
WantedBy=default.target
```

Make sure the paths to NodeJS and Po.et in the `ExecStart` and `WorkingDirectory` entries are correct.

You can then use the following commands to handle the daemon:
```
systemctl --user start poet-node
systemctl --user stop poet-node
systemctl --user about poet-node
systemctl --user restart poet-node
```

And `journalctl -f --user-unit poet-node` to tail the logs, or without the `-f` to just `less` them.

### Supported Platforms
The Po.et Node has been tested in Ubuntu, Linux Mint and Mac OS. 

The `npm run build` command depends on `npm run build-clear` and `npm run copy-json`, which use bash' `rm` and `cp`, so building under Windows may require some tweaking.

## Contributing

### Compiling
Run `npm run build` to compile the source. This will run TypeScript on the source files and place the output in `dist/ts`, and then it'll run Babel and place the output in `dist/babel`.

Currently, we're only using Babel to support [absolute import paths](https://github.com/tleunen/babel-plugin-module-resolver).

During development, you can also run `npm run watch` to automatically watch for file changes, build the changed files and restart the application on the fly. 

### Tests
Both unit and integration tests live in this same repo. You can run both with `npm test` or separately with `npm run test-unit` and `npm run test-integration`.

The integration tests are hard-coded to hit the `http://localhost:18080`. In the future, this will be picked up from an environment variable and defaulted to that same url.

> **Warning:** Running the integration tests wipes out the entire `db.poet.works` collection and inserts testing data. This is done by the `test/integration/PrepareDB.ts` file. In the future, a less invasive mechanism will be developed. Meanwhile, make sure you're comfortable with this before running the integration tests!

Currently, Po.et Node is lacking some tests. The most critical paths that aren't being tested right now are:
- Broadcasting of transactions in a single Node (submit work, wait a bit, get work and expect transactionId to be set and valid)
- Replication across nodes (submit WORK to Node A, get WORK in Node B)

See issues [#21][i21], [#22][i22], [#25][i25] and [#27][i27] for more info on this topic.

### Coverage
Coverage is generated with [Istanbul](https://github.com/istanbuljs/nyc) whenever tests are run.
A more complete report can be generated by running `npm run coverage`.

This area needs some reviewing — the reports look a bit off sometimes.

Also, we'll want the Travis job to check that coverage doesn't go down with pull requests. See [#11][i11].

### Branches and Pull Requests
The master branch is blocked - no one can commit to it directly. To contribute changes, branch off from master and make a PR back to it. 

TravisCI will run all tests automatically for all pull requests submitted.

### Code Style
Please run `npm run lint`. The linting configuration still needs some tweaking, and it'll be added to Travis in the future.

## Roadmap
Check out the [issues](https://github.com/poetapp/node/issues) to get a rough idea of what's next for The Po.et Node.

Currently they boil down to:
- 3 features
- 1 bug
- 1 research, which could lead to a new feature
- 9 issues focusing on testing
- 7 issues focusing on architecture

The features are:
- Batching claims together to limit the number of blockchain transactions required, and thus lower the amount of fees
- Providing an option to store whatever goes to IPFS in AWS' S3 as well, in case IPFS fails
- Blockchain Reader "Fast Mode", see [#30][i30] for more info

The two research issues are:
- The first is about the possibility of using Open Timestamps. This could enable fee-less timestamping, but may not be conpatible with storing extra data in the transaction output, which is used as a means of communication across Nodes.
- The second is about moving away from InsightAPI and using Bitcoin Core directly.

The issues focusing on testing are meant to ensure all different code paths are tested by automated tests. The most critical part here is testing replication across Po.et Nodes.

Of the 6 issues that focus on architecture:
- 3 are about logging
- One's a refactor to increase code quaility by following an official recommendation
- One's about creating proper database indexes
- One's about moving reusable logic away from Node into poet-js


[i11]: https://github.com/poetapp/node/issues/11
[i21]: https://github.com/poetapp/node/issues/21
[i22]: https://github.com/poetapp/node/issues/22
[i25]: https://github.com/poetapp/node/issues/25
[i27]: https://github.com/poetapp/node/issues/27
[i30]: https://github.com/poetapp/node/issues/30
