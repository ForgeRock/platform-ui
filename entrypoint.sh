#!/bin/sh

# Copyright 2019-2021 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

# Entrypoint script for all ForgeRock Platform UI applications.

/variable_replacement.sh /usr/share/nginx/html/js/*.js

echo "Starting Nginx"
nginx -g 'daemon off;'
