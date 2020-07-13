#!/bin/sh

# Copyright (c) 2020 ForgeRock. All rights reserved.
#
# This software may be modified and distributed under the terms
# of the MIT license. See the LICENSE file for details.

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
