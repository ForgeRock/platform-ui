#!/bin/bash

# Copyright 2019-2021 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

# Entrypoint script for all ForgeRock Platform UI applications.

/home/app/variable_replacement.sh /home/app/packages/$1/.env

export VUE_APP_BUILD_NUMBER=local

cd /home/app/packages/$1

if [[ -v SUBFOLDER ]]; then
    echo "Hosting under $SUBFOLDER"

    sed -i "s!const SUBFOLDER = '\./';!const SUBFOLDER = '/$SUBFOLDER/';!g" vue.config.js
fi

echo "Starting dev server"
yarn run dev
