#!/bin/bash

set -e
set -o pipefail

# always tag on git hash
TAG="v-$(git log -1 --pretty=%h)-beta"

docker build -t "${REPO}":"${TAG}" .

# if git tag release, tag semver
if [ -n "${TRAVIS_TAG}" ]; then 
    docker tag "${REPO}":"${TAG}" "${REPO}":"${TRAVIS_TAG}"
    docker tag "${REPO}":"${TAG}" "${REPO}":latest;
fi

# if master is updated, update the latest tag
if [ "$TRAVIS_BRANCH" == "master" ]; then 
    docker tag "${REPO}":"${TAG}" "${REPO}":latest;
fi