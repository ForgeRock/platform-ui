#!/usr/bin/env bash
# set -euxo pipefail
# Check for existance of a remote environment info file
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REMOTE_ENVIRONMENT_INFO_FILE=$SCRIPT_DIR/.remote-environment-info.txt

if [ -f $REMOTE_ENVIRONMENT_INFO_FILE ]; then
  # Load remote-environment info if a file exists
  exec 6< $REMOTE_ENVIRONMENT_INFO_FILE

  read remote_environment_location <&6
  read platform_mode <&6
  read remote_environment_admin_username <&6
  read remote_environment_admin_password <&6
  read workforce_enabled <&6

  exec 6<&-

  echo "Remote environment info loaded from 'e2e/.remote-environment-info.txt':"
  echo "Remote environment location: $remote_environment_location"
  echo "Platform mode: $platform_mode"
  echo "Username of the remote environment admin to test with: $remote_environment_admin_username"
  echo "Password of the remote environment admin to test with: $remote_environment_admin_password"
  echo "Run tests with workforce enabled: $workforce_enabled"
else
  # Prompt user for remote environment info
  echo "Remote environment info file not found"

  echo "Please provide the information for accessing the remote environment to be tested"
  read -p "Remote environment location (eg. openam-my-tenant.forgeblocks.com): " remote_environment_location
  read -p "Platform mode? [Y/n]:" platform_mode
  read -p "Username of the remote environment admin to test with (eg. my.email@forgerock.com): " remote_environment_admin_username
  read -p "Password of the remote environment admin to test with (eg. passw0rd): " remote_environment_admin_password
  read -p "Run tests with workforce enabled? [Y/n]: " workforce_enabled

  # Ask if should save info, writing file if desired
  read -p "Save these inputs in 'e2e/.remote-environment-info.txt' for subsequent test runs? [Y/n]" store_inputs
  if [[ "$store_inputs" =~ ^([nN])$ ]]
  then
      echo "Remote environment informtion will not be stored"
  else
      echo "Storing remote environment information"
      echo $remote_environment_location >> $REMOTE_ENVIRONMENT_INFO_FILE
      echo $platform_mode >> $REMOTE_ENVIRONMENT_INFO_FILE
      echo $remote_environment_admin_username >> $REMOTE_ENVIRONMENT_INFO_FILE
      echo $remote_environment_admin_password >> $REMOTE_ENVIRONMENT_INFO_FILE
      echo $workforce_enabled >> $REMOTE_ENVIRONMENT_INFO_FILE
  fi
fi

# Export variables for Cypress
export CYPRESS_AM_USERNAME=$remote_environment_admin_username
export CYPRESS_AM_PASSWORD=$remote_environment_admin_password
export CYPRESS_FQDN=$remote_environment_location
export CYPRESS_BASE_URL="https://$CYPRESS_FQDN"
if [[ "$platform_mode" =~ ^([yY])$ ]]
then
  export CYPRESS_MENUS_FILE="menus.platform"
  export CYPRESS_ROUTES_FILE="routes.platform"
  export CYPRESS_IS_FRAAS="false"
  export CYPRESS_TAGS="forgeops"
else
  export CYPRESS_MENUS_FILE="menus.idcloud"
  export CYPRESS_ROUTES_FILE="routes.idcloud"
  export CYPRESS_IS_FRAAS="true"
  export CYPRESS_TAGS="cloud"
fi

if [[ "$workforce_enabled" =~ ^([yY])$ ]]
then
  export CYPRESS_WORKFORCE_ENABLED="true"
else
  export CYPRESS_WORKFORCE_ENABLED="false"
fi

$@
