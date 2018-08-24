# Storage Module

This module is responsible for interacting with ipfs - managing downloads.

## Configuration

The following configuration properties affect the Storage Module:

```js
{
  "downloadIntervalInSeconds": 1,
  "downloadRetryDelayInMinutes": 1,
  "downloadMaxAttempts": 20,
  "downloadTimeoutInSeconds": 30
}
```

## Database

The Storage module uses the `storage` collection.

Entries in the `storage` collection look like this:

```js
{
  "_id" : ObjectId("5b236c1551757306d975d6f8"),
  "ipfsFileHash" : "QmRcMsiG9FbfBomigXv4t67SURi877G8dFEzrhLCATC9fE",
  "lastDownloadAttemptTime" : 1529048279442,
  "downloadAttempts" : 1,
  "claimId" : "ce00f1cbce44b71d5fc80326ddb3eb7d0df1cc00795e78cf3201bebb3b82f9d8"
}
```

They can also look like this:

```js
{
  "_id" : ObjectId("5b236c1551757306d975d6ef"),
  "ipfsFileHash" : "QmNvLwsFPYQuCg2aXUvpUKzgQNAKfvenfjY8KqD29TzVwh",
  "lastDownloadAttemptTime" : 1529048118138,
  "downloadAttempts" : 1,
  "failureType" : "HARD",
  "failureReason" : "INVALID_JSON"
}
```

## Downloads

Download Requests come into the Storage module via the `PoetTimestampDownloaded` RabbitMQ message 
which is handled in the Router by the `onPoetTimestampsDownloaded` function.

This function calls the `download` function of the ClaimController, which simply inserts a new entry into the database, 
acting as an asynchronous download queue.

The Service will periodically call the `downloadNextHash` function of the ClaimController, which will pick up a single
entry from this queue and attempt to download it from IPFS.

> The interval between calls to `downloadNextHash` is controlled by the `downloadIntervalInSeconds` configuration key.

### Download Retry System

If `downloadNextHash` fails to download the file from IPFS it will update the entry in the database with details
of the failure. It will also increase the `downloadAttempts` field by one  and set `lastDownloadAttemptTime` to the current time.

Failed downloads will be retried later until the download attempt limit is reached. 

> The download attempt limit can be configured by the `downloadMaxAttempts` setting.

When a download fails the system will store two pieces of information on the failure: the failure reason and the type of failure.

#### Failure Reason  

Failure Type is stored in the `failureReason` in the database. 
This field is informative and currently unsued in the code.
At the moment, it's sole purpose is for manual debugging.

The amount of failed downloads, grouped by failure reason, 
can be examined using the `print-storage-errors` make command. 

```bash
$ sudo make print-storage-errors 
docker exec -i poet-mongo mongo poet < ./queries/storage-errors.mongo
{ "_id" : "INVALID_JSON", "count" : 339 }
{ "_id" : "IPFSTimeout", "count" : 1400 }
{ "_id" : null, "count" : 8551 }
```

#### Failure Type

Failure Type is stored in the `failureType` in the database. 

This field affects the retry system. If can be SOFT or HARD. HARD failure types won't be retried.