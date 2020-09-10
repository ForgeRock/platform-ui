#!/bin/sh

# Copyright 2019-2020 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

# Entrypoint script for all ForgeRock Platform UI applications.

export REPLACEMENT_PATH=/home/app/packages/$1/.env
. /home/app/variable_replacement.sh

export VUE_APP_BUILD_NUMBER=local
export VUE_APP_BUILD_DATE_TIME="$(date +%s)"

cd /home/app/packages/$1
sed -i 's!\\!!g' .env
echo "Starting dev server"
yarn run dev
