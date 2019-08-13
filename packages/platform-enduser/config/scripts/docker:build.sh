#!/bin/sh
docker build \
  --file Dockerfile \
  --tag platform-enduser:development \
  --target development \
  ../..
