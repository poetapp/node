
## TODO

- create docker-compose file for running functional tests.
    - add a separate container for the functional tests?
        - or just run them in poet-node-a?
    - use top-level docker-compose file.
    - overrides as needed.
        - add poet-node-b
        - rabbitmq changes for poet-node-b.
        - mongo database names for each poet-node-b.

## Running functional tests

```bash
  $ docker-compose build
  $ docker-compose up
  $ docker-compose exec poet-node npm run test:functional
```

### NOTES

- mine 200 blocks to get money useing rpc via curl.
    - curl --user bitcoinrpcuser:bitcoinrpcpassword --data-binary '{"jsonrpc":
      "1.0", "id":"curltest", "method": "generate", "params": [200] }'
      http://localhost:18443

- `npm run create-claim`. extract claim id.
- wait 10 seconds.
- curl /works/:id
- Should have
    - ipfshash
    - transaction id
    - block height
    - timestamp
