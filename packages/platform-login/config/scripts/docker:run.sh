#!/bin/sh

# Copyright 2019 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

DEFAULT_ROOT_PATH=$(cd ../../; echo $PWD)

read -p "? Enter the repository root ($DEFAULT_ROOT_PATH) " path
ROOT_PATH=${path:-$DEFAULT_ROOT_PATH}

docker run \
  --interactive \
  --publish-all \
  --tty \
  --volume $ROOT_PATH/packages/platform-login/src/:/home/app/packages/platform-login/src \
  --volume $ROOT_PATH/packages/platform-shared/src/:/home/app/packages/platform-shared/src \
  platform-login:development
