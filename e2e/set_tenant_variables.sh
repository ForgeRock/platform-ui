#!/usr/bin/env bash
# set -euxo pipefail

# Check for existance of a tenant info file
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
TENANT_INFO_FILE=$SCRIPT_DIR/.tenant-info.txt

if [ -f $TENANT_INFO_FILE ]; then
  # Load tenant info if a file exists
  exec 6< $TENANT_INFO_FILE

  read tenant_location <&6
  read tenant_admin_username <&6
  read tenant_admin_password <&6

  exec 6<&-

  echo "Tenant info loaded from 'e2e/.tenant-info.txt':"
  echo "Tenant location: $tenant_location"
  echo "Username of the tenant admin to test with: $tenant_admin_username"
  echo "Password of the tenant admin to test with: $tenant_admin_password"
else
  # Prompt user for tenant info
  echo "Tenant info file not found"

  echo "Please provide the information for accessing the ID cloud tenant to be tested"
  read -p "Tenant location (eg. openam-my-tenant.forgeblocks.com): " tenant_location
  read -p "Username of the tenant admin to test with (eg. my.email@forgerock.com): " tenant_admin_username
  read -p "Password of the tenant admin to test with (eg. passw0rd): " tenant_admin_password

  # Ask if should save info, writing file if desired
  read -p "Save these inputs in 'e2e/.tenant-info.txt' for subsequent test runs? [Y/n]" store_inputs
  if [[ "$store_inputs" =~ ^([nN])$ ]]
  then
      echo "Tenant informtion will not be stored"
  else
      echo "Storing tenant information"
      echo $tenant_location >> $TENANT_INFO_FILE
      echo $tenant_admin_username >> $TENANT_INFO_FILE
      echo $tenant_admin_password >> $TENANT_INFO_FILE
  fi
fi

# Export variables for Cypress

#kubernetes_namespace=${KUBERNETES_NAMESPACE:-default}

export CYPRESS_AM_USERNAME=$tenant_admin_username
export CYPRESS_AM_PASSWORD=$tenant_admin_password
# export CYPRESS_ACCESS_TOKEN=`curl -u idm-provisioning:$(kubectl --namespace $kubernetes_namespace get secret amster-env-secrets -o jsonpath="{.data.IDM_PROVISIONING_CLIENT_SECRET}" | base64 --d) --data "grant_type=client_credentials&scope=fr:idm:*" -k "https://$(kubectl --namespace $kubernetes_namespace get configmaps platform-config -o jsonpath="{.data.FQDN}")/am/oauth2/access_token"`
export CYPRESS_FQDN=$tenant_location
export CYPRESS_BASE_URL="https://$CYPRESS_FQDN"
export CYPRESS_MENUS_FILE="menus.idcloud"
export CYPRESS_ROUTES_FILE="routes.idcloud"
export CYPRESS_IS_FRAAS="true"

$@
