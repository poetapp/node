#!/bin/bash

set -e
set -o pipefail

docker login -u "${DOCKER_USER}" -p "${DOCKER_PASS}"

docker push "${REPO}"