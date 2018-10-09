#!/bin/bash
set -e

mongo <<EOF
use $POET_DB
db.createUser({
  user:  '$POET_DB_USER',
  pwd: '$POET_DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$POET_DB'
  }]
})
EOF
