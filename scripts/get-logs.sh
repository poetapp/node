#!/bin/sh
services="bitcoind-1  consul frost-api ipfs mongo poet-node rabbit redis vault"

mkdir /tmp/logs

for i in $services
do
   docker-compose logs $i > /tmp/logs/$i.log
done

