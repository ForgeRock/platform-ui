#!/bin/sh

# Copyright 2019-2020 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

# Entrypoint script for all ForgeRock Platform UI applications.

export REPLACEMENT_PATH=/usr/share/nginx/html/js/*.js
. /home/app/variable_replacement.sh

echo "Starting Nginx"
nginx -g 'daemon off;'
