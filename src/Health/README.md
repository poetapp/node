# Health Module

This module is responsible for gathering data about the aplication.

## Responsiblites
- Watches for messages containing claimsNotDownloaded with ipfs file hashes and stores them into the database with failureReason, failureType, downloadAttempts, and lastDownloadAttemptTime.
- On a set interval, collect Bitcoin-Core information, check IPFS and Mongo Connections and store in the database.

## Configuration

The following configuration properties affect the Health Module:

```js
{
  "healthIntervalInSeconds": 30,
}
```

## Database

The Health module uses the `health` collection.

Entries in the `health` collection have a name property that defines the information. Each entry will have additional information based on the name. 

## Files

#### `Health.ts`   
The entry point for the module.

#### `IPFS.ts`
Implements an API for the IPFS service.

#### `Router.ts`   
Handles the communication between the different modules.

#### `Service.ts`
Collects information from Bitcoin-Core, IPFS, and Mongo at a set interval.