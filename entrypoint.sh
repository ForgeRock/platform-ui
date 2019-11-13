#!/bin/sh

# Copyright 2019 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

# Entrypoint script for all ForgeRock Platform UI applications.

echo "Replacing env vars in JS"
echo ""
echo "Setting AM URL as $AM_URL"
echo "Setting IDM REST URL as $IDM_REST_URL"
echo "Setting IDM ADMIN URL as $IDM_ADMIN_URL"
echo "Setting LOGIN URL as $LOGIN_UI_URL"
echo "Setting ENDUSER URL as $ENDUSER_UI_URL"
echo "Setting ENDUSER CLIENT ID as $ENDUSER_CLIENT_ID"
echo "Setting ADMIN CLIENT ID as $ADMIN_CLIENT_ID"

# Replace env vars in JavaScript files
for file in /usr/share/nginx/html/js/*.js
do
  echo "Processing $file ..."

  # Use the existing JS file as template
  if [ ! -f "/tmp/$(basename $file).tmpl" ]; then
    cp "$file" "/tmp/$(basename $file).tmpl"
  fi

  envsubst '$AM_URL $IDM_REST_URL $IDM_ADMIN_URL $LOGIN_UI_URL $ENDUSER_UI_URL $ENDUSER_CLIENT_ID $ADMIN_CLIENT_ID' < "/tmp/$(basename $file).tmpl" > "$file"
done

echo "Starting Nginx"
nginx -g 'daemon off;'

