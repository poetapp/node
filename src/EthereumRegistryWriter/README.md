# EthereumRegistryWriter

Creates Anchor Receipts for claims and adds them along the referenced claim to a Po.et Ethereum Registry. 

## Configuration

The configuration options for this service are detailed in the `EthereumRegistryWriterConfiguration` interface. The configuration is loaded in the `index.ts` file.

## Files

### index.ts

Loads the configuration, creates the parent logger and instantiates and runs the EthereumRegistryWriter, passing it the loaded configuration.

### EthereumRegistryWriter

Composition root of the entire micro service.

### Router

Responsible for interaction with RabbitMQ.

### Scheduler

Responsible for running and managing intervals.

### Business

All business logic goes here.

## Business Logic Breakdown

This module listens to RabbitMQ messages coming from other modules and builds an internal database of anchor receipts for claims submitted to this node. Claims downloaded from the network that weren't submitted to this node are ignored by this service.

The `claimFile` is added right along the `claimId` when the claim is submitted to this node. The `ipfsDirectoryHash` is set when the IPFS directory is created. Everything else is set once the anchor receipt is actually downloaded from Bitcoin, which means it has at least one confirmation. 

Whenever an batch directory is read and the list of files it contains is retrieved this service iterates over them and confirms that the Batch Directory it has associated for every Claim File it has in its database matches, which serves to confirm that the IPFS file we're dealing with actually got anchored with in the IPFS directory we expected it to, and no other (otherwise we'd have an incorrect anchor), and sets `batchDirectoryConfirmed` to `true`.

If there are any Claim Files in the database that don't match the Batch Directory we expected them to, the service will log a warning.

The same goes for confirming that the `claimId` in the database was actually anchored in the `claimFile` we expected it to, and if so, sets `claimFileConfirmed` to `true`.

As with the confirmation of Batch Directories, the service will log a warning for unexpected Claim Id - Claim File matches. 

Once both `claimFileConfirmed` and `batchDirectoryConfirmed` are `true` for a given entry, it gets picked up by the Scheduler, which then creates an IPFS Directory and stores the Claim along with the Anchor Receipt in it, and sets `claimAndAnchorReceiptDirectory` to the address of the directory.

After the entry has `claimAndAnchorReceiptDirectory` set, it once again gets picked up by the Scheduler, this time to be stored in the Ethereum Po.et Registry Contract.

If the `claimAndAnchorReceiptDirectory` gets successfully stored in the Ethereum contract, the cidCount() from the contract gets written to the database as `registryIndex` for reference. 

The actual index of the entry in the contract's array should be greater than or equal to `registryIndex`, but there's no guarantee that it's the actual index since reading the count and storing a value are two separate, non-atomic operations, and the order in which elements are written to the contract's array is not guaranteed to be deterministic.

## Database

This module uses the `claimAnchorReceipts` collection. Entries in the collection look as follows:

```js
> db.claimAnchorReceipts.find().pretty()
{
  "_id" : ObjectId("5dc66ac1804e2f27453ae0ed"),
  "claimId" : "da9e8b71edbed23778cf286863a59f19be4119cb0edc70269dfed2a8d9cf6ea4",
  "claimFile" : "QmeKmeDJawE39Lu4R4B6GsM2uJqKmkGUGaEXTBeHXheZJK",
  "anchorReceipt" : {
    "storageProtocol" : 0,
    "prefix" : "POET",
    "version" : 0,
    "ipfsDirectoryHash" : "QmNhdBgy6U8LAgHYvrXg4ya3L2BAB1xt8UtCtGTZjLDmop",
    "transactionId" : "5c5072848065cfa7c526bf29f8c016e9a40db5c1d1b3e9336ec31e12e80ca31b",
    "blockHeight" : 140,
    "blockHash" : "1a3653f5d41022fdab18faa226fb5ceea6d99d2bbc85c5323b1c466c7e3a2f13"
  },
  "batchDirectoryConfirmed" : true,
  "claimFileConfirmed" : true,
  "anchorReceiptFile" : "QmasXBjkzao1FSjq1qY6bbukiHdAny4Aac6SRRPbcCeNLs",
  "claimAndAnchorReceiptDirectory" : "QmdoPtQGX3aVkmSBv4QrggBsAB2cLLaGxyX4XH4wmuXubY",
  "registryIndex" : 1727
}
```
