#!/bin/sh
DEFAULT_ROOT_PATH=$(cd ../../; echo $PWD)

read -p "? Enter the repository root ($DEFAULT_ROOT_PATH) " path
ROOT_PATH=${path:-$DEFAULT_ROOT_PATH}

docker run \
  --interactive \
  --publish-all \
  --tty \
  --volume $ROOT_PATH/packages/platform-enduser/src/:/home/app/packages/platform-enduser/src \
  platform-enduser:development
