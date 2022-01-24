#!/bin/bash

VERSION=$(cat lerna.json | jq -r '.version')
NAME=$(cat package.json | jq -r '.name')
TAG="kajyr/${NAME}:${VERSION}"

docker run --rm -p 7000:7000 -e "API_KEY=qwerty" -e="DATA=/data/links.csv" -v ./data:/data $TAG 