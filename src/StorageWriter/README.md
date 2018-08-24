# StorageWriter Module

This module is responsible for interacting with ipfs - managing uploads.

## Uploads

Uploads come into the Storage module via the `NewClaim` RabbitMQ message
which is handled in the Router by the `onNewClaim` function.

`onNewClaim` calls the `create` function of the ClaimController, 
which immediately adds the claim to IPFS and stores it in the database. 
