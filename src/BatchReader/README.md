# BatchReader Module
Reads IPFS files from IPFS directories.

## Responsiblites
- Watches for messages from the BlockchainReader that contain directory hashes and stores the hashes to be read.
- On a set interval, it finds and attempts to read file hashes from an IPFS directory and then publish a message containing the file hashes found for each directory

## Configuration

The following configuration properties affect the BatchReader Module:

```ts
{
  "dbUrl": string,
  "rabbitmqUrl": string,
  "readNextDirectoryIntervalInSeconds": number
}
```

## Files

#### `BatchReader.ts`   
The entry point for the module.

#### `ClaimController.ts`
Handles the business logic of claims.

#### `DirectoryDAO.ts`   
A facade, data access object, to provide simplified manipulation of directory hash state in the database.

#### `IPFS.ts`
Implements an API for the IPFS service.

#### `Router.ts`   
Handles the communication between the different modules.

In the previous service structure, the router would subscribe to events and call methods on controllers. Those controllers would then publish new messages. In the new system, all the subscribing/publishing of messages is handled by the router. This provides more clarity and flexibility.

#### `Service.ts`
Fires messages based on intervals and provides the ability to stop/start the intervals.
