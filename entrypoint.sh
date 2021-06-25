#!/bin/bash

# Copyright 2019-2021 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

# Entrypoint script for all ForgeRock Platform UI applications.

/variable_replacement.sh /usr/share/nginx/html/js/*.js

if [[ -v SUBFOLDER ]]; then
    echo "Hosting under $SUBFOLDER"
    # creating with -p will build out recursive folders;
    mkdir -p /usr/share/nginx/html/$SUBFOLDER
    # rmdir will remove the top-level;
    rmdir /usr/share/nginx/html/$SUBFOLDER
    # which allows us to create a symlink at the top level
    ln -s /usr/share/nginx/html /usr/share/nginx/html/$SUBFOLDER
fi

echo "Starting Nginx"
nginx -g 'daemon off;'
