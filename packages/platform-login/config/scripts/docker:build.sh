#!/bin/sh
docker build \
  --file Dockerfile \
  --tag platform-login:development \
  --target development \
  ../..
