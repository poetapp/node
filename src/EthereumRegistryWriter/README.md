# EthereumRegistryWriter

Creates Anchor Receipts for claims and adds them along the referenced claim to a Po.et Ethereum Registry. 

## Configuration

The following configuration properties affect the EthereumRegistryWriter Module:

```ts
{
  "dbUrl": string,
  "rabbitmqUrl": string,
  "batchCreationIntervalInSeconds": number
}
```

## Breakdown

This module listens to RabbitMQ messages coming from other modules and builds an internal database of anchors for claims created by the running node (claims downloaded from the network that weren't created by this node will be ignored by this service).

The `ipfsFileHash` is added right along the `claimId` when the claim is created. The `ipfsDirectoryHash` is set when the IPFS directory is created. Everything else is set once the anchor is actually downloaded from Bitcoin, which means it has at least one confirmation. 

Whenever an IPFS directory is read and the list of IFPS files it contains is retrieved this service will iterate over them and verify that the IPFS directory it has associated for every IPFS file it has in its database matches, which serves to confirm that the IPFS file we're dealing with actually got anchored with in the IPFS directory we expected it to, and no other (otherwise we'd have an incorrect anchor), and sets `ipfsDirectoryHashVerified` to `true`. 

The same goes for verifying that the `claimId` in its database was actually anchored in the `ipfsFileHash` we expected it to, and if so, sets `ipfsFileHashVerified` to `true`. 

Once both `ipfsDirectoryHashVerified` and `ipfsFileHashVerified` are `true` for a given entry, it gets picked up by the Service, which then creates an IPFS Directory and stores the Claim along with the Anchor Receipt in it, and sets `ipfsDirectoryHashWithFiles` to the address of the directory.

After the entry has `ipfsDirectoryHashWithFiles` set, it once again gets picked up, this time to be stored in the Ethereum Po.et Registry Contract.

# Database

This module uses the `claimAnchorReceipts` collection. Entries in the collection look as follows:

```js
> db.claimAnchorReceipts.find().pretty()
{
  "_id" : ObjectId("5db7b6a5045a3747f20023ba"),
  "claimId" : "bdda37c20121c657eb40f249161c6aa8b86689ba3f75e296a5f6e5f815a18fa6",
  "ipfsFileHash" : "Qmat8mbci8qBfCZtfWmSx7g9piBLVEg99m4K4gqA8779zQ",
  "ipfsDirectoryHash" : "QmP3pMzGmjTFCc81ZCHB52E5D89K2zQu3xYTxXKoAMny5k",
  "blockHash" : "53ac10b9d0efc5239f9019df634e0acd7d901a07dffdcded1bdba4377cf2eb02",
  "blockHeight" : 104,
  "prefix" : "POET",
  "storageProtocol" : 0,
  "transactionId" : "a8f86dc7a1e190d52969220ceb270d6b13d0a08cba7d1ce71a3eb5ab2d65f2bb",
  "version" : 0,
  "ipfsDirectoryHashVerified" : true,
  "ipfsFileHashVerified" : true,
  "ipfsDirectoryHashWithFiles" : "QmVawzn56AYBo6ipCpbq93o1bHUPZnN8aipuBFRfYzprWX"
}
```
