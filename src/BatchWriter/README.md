# Batcher Module
Groups IPFS file hashes into IPFS directories 

## Responsiblites
- Watches for messages containing new file hashes and stores them into the database to await being grouped
- On a set interval, group awaiting file hashes using IPFS directories, then publish a message contain the directory and file hashes

## Configuration

The following configuration properties affect the Batcher Module:

```ts
{
  "dbUrl": string,
  "rabbitmqUrl": string,
  "batchCreationIntervalInSeconds": number
}
```

## Files

#### `Batcher.ts`   
The entry point for the module.

#### `FileDAO.ts`   
A facade, data access object, to provide simplified manipulation of file hash state in the database.

#### `IPFS.ts`
Implements an API for the IPFS service.

#### `Router.ts`   
Handles the communication between the different modules.

In the previous service structure, the router would subscribe to events and call methods on controllers. Those controllers would then publish new messages. In the new system, all the subscribing/publishing of messages is handled by the router. This provides more clarity and flexibility.

#### `Service.ts`

Fires messages based on intervals and provides the ability to stop/start the intervals.
