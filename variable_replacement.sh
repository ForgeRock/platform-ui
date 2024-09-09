#!/bin/sh

# Copyright 2019-2024 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

echo "Replacing env vars in JS"
echo ""
echo "Setting AM URL as $AM_URL"
echo "Setting AM ADMIN URL as $AM_ADMIN_URL"
echo "Setting ANALYTICS API URL as $ANALYTICS_API_URL"
echo "Setting IDM REST URL as $IDM_REST_URL"
echo "Setting IDM ADMIN URL as $IDM_ADMIN_URL"
echo "Setting IDM UPLOAD URL as $IDM_UPLOAD_URL"
echo "Setting IDM EXPORT URL as $IDM_EXPORT_URL"
echo "Setting ENABLE ANALYTICS DASH as $ENABLE_ANALYTICS_DASH"
echo "Setting ENABLE AUTO CUSTOM REPORTS as $ENABLE_ANALYTICS_CUSTOM_REPORTING"
echo "Setting ENABLE AUTO REPORTS as $ENABLE_ANALYTICS_REPORTING"
echo "Setting ENABLE EXTENDED SAML CONFIG as $ENABLE_EXTENDED_SAML_CONFIG"
echo "Setting ENABLE SAML JOURNEYS as $ENABLE_SAML_JOURNEYS"
echo "Setting ENABLE GOVERNANCE as $ENABLE_GOVERNANCE"
echo "Setting ENABLE GOVERNANCE DEVELOPMENT as $ENABLE_GOVERNANCE_DEV"
echo "Setting ENABLE CERTS UI as $ENABLE_CERTS_UI"
echo "Setting ENABLE WORKFORCE as $ENABLE_WORKFORCE"
echo "Setting ENABLE WORKFORCE as $ENABLE_WORKFORCE_ADVANCED_SYNC"
echo "Setting ENABLE TEMPLATE BUILDER as $ENABLE_TEMPLATE_BUILDER"
echo "Setting ENDUSER URL as $ENDUSER_UI_URL"
echo "Setting ENDUSER CLIENT ID as $ENDUSER_CLIENT_ID"
echo "Setting ADMIN CLIENT ID as $ADMIN_CLIENT_ID"
echo "Setting PLATFORM UI LOCALE as $PLATFORM_UI_LOCALE"
echo "Setting PLATFORM ADMIN URL as $PLATFORM_ADMIN_URL"
echo "Setting PLATFORM UI IS FRAAS as $PLATFORM_UI_IS_FRAAS"
echo "Setting RCS AGENT ENABLED as $RCS_AGENT_ENABLED"
echo "Setting FRAAS LOGGING URL as $FRAAS_LOGGING_URL"
echo "Setting FRAAS ENVIRONMENT URL as $FRAAS_ENV_URL"
echo "Setting FRAAS FEDERATION ENFORCEMENT URL as $FRAAS_FEDERATION_ENFORCEMENT_URL"
echo "Setting FRAAS MONITORING URL as $FRAAS_MONITORING_URL"
echo "Setting FRAAS PROMOTION URL as $FRAAS_PROMOTION_URL"
echo "Setting LOWER CONFIG INGRESS as $LOWER_CONFIG_INGRESS"
echo "Setting UPPER CONFIG EGRESS as $UPPER_CONFIG_EGRESS"
echo "Setting SHOW ESV UI as $SHOW_ESV_UI"
echo "Setting FRAAS DEFAULT REALM as $FRAAS_DEFAULT_REALM"
echo "Setting FRAAS ADMIN NAME as $FRAAS_ADMIN_MANAGED_OBJECT_NAME"
echo "Setting MENUS FILE as $MENUS_FILE"
echo "Setting ROUTES FILE as $ROUTES_FILE"
echo "Setting GOOGLE FONTS API KEY as $GOOGLE_FONTS_API_KEY"
echo "Setting GOOGLE MAPS API KEY as $GOOGLE_MAPS_API_KEY"
echo "Setting ENABLE AUTO ACCESS as $ENABLE_AUTO_ACCESS"
echo "Setting AUTO ACCESS API URL as $AUTO_ACCESS_API_URL"
echo "Setting AUTO ACCESS JAS URL as $AUTO_ACCESS_JAS_URL"
echo "Setting AUTO ACCESS REPORTS URL as $AUTO_ACCESS_REPORTS_URL"
echo "Setting AUTO ACCESS TENANT ID as $AUTO_ACCESS_TENANT_ID"
echo "Setting ALIGN GOTO PRECEDENCE as $ALIGN_GOTO_PRECEDENCE"
echo "Setting IGA API URL as $IGA_API_URL"
echo "Setting IGA ORCHESTRATION API URL as $IGA_ORCHESTRATION_API_URL"
echo "Setting PROMOTE APPS VIA API as $PROMOTE_APPS_VIA_API"
echo "Setting ENABLE NEW MULTISELECT as $ENABLE_NEW_MULTISELECT"
echo "Setting SCRIPT BINDINGS API ENABLED as $SCRIPT_BINDINGS_API_ENABLED"

# Replace env vars in JavaScript files
for file in $@
do
  echo "Processing $file ..."

  # Use the existing JS file as template
  if [ ! -f "/tmp/$(basename $file).tmpl" ]; then
    cp "$file" "/tmp/$(basename $file).tmpl"
  fi

  envsubst '$AM_URL $AM_ADMIN_URL $ANALYTICS_API_URL $ENABLE_ANALYTICS_DASH $ENABLE_ANALYTICS_CUSTOM_REPORTING $ENABLE_ANALYTICS_REPORTING $ENABLE_EXTENDED_SAML_CONFIG $ENABLE_SAML_JOURNEYS $ENABLE_GOVERNANCE $ENABLE_GOVERNANCE_DEV $ENABLE_CERTS_UI $ENABLE_WORKFORCE $ENABLE_WORKFORCE_ADVANCED_SYNC $ENABLE_TEMPLATE_BUILDER $IDM_REST_URL $IDM_ADMIN_URL $IDM_UPLOAD_URL $IDM_EXPORT_URL $ENDUSER_UI_URL $ENDUSER_CLIENT_ID $ADMIN_CLIENT_ID $PLATFORM_UI_LOCALE $PLATFORM_ADMIN_URL $PLATFORM_UI_IS_FRAAS $RCS_AGENT_ENABLED $FRAAS_LOGGING_URL $FRAAS_DEFAULT_REALM $FRAAS_ADMIN_MANAGED_OBJECT_NAME $FRAAS_ENV_URL $SHOW_ESV_UI $MENUS_FILE $ROUTES_FILE $FRAAS_MONITORING_URL $GOOGLE_FONTS_API_KEY $GOOGLE_MAPS_API_KEY $ENABLE_AUTO_ACCESS $AUTO_ACCESS_API_URL $AUTO_ACCESS_JAS_URL $AUTO_ACCESS_TENANT_ID $ALIGN_GOTO_PRECEDENCE $FRAAS_PROMOTION_URL $FRAAS_FEDERATION_ENFORCEMENT_URL $LOWER_CONFIG_INGRESS $UPPER_CONFIG_EGRESS $IGA_API_URL $AUTO_ACCESS_REPORTS_URL $IGA_ORCHESTRATION_API_URL $PROMOTE_APPS_VIA_API $ENABLE_NEW_MULTISELECT $SCRIPT_BINDINGS_API_ENABLED' < "/tmp/$(basename $file).tmpl" > "$file"
done
