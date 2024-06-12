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

  exec 6<&-

  # Ask the user if they want to use the data from the remote environment info file
  read -p "Use info for $remote_environment_location stored in from 'e2e/.remote-environment-info.txt'? [Y/n]" remote_info_loaded

  if [[ "$remote_info_loaded" =~ ^([nN])$ ]]
  then
    echo "Remote environment info from 'e2e/.remote-environment-info.txt' will not be used"
  else
    echo "Remote environment info loaded from 'e2e/.remote-environment-info.txt':"
    echo "Remote environment location: $remote_environment_location"
    echo "Platform mode: $platform_mode"
    echo "Username of the remote environment admin to test with: $remote_environment_admin_username"
    echo "Password of the remote environment admin to test with: $remote_environment_admin_password"
  fi
fi

if [ ! -f $REMOTE_ENVIRONMENT_INFO_FILE ] || [[ "$remote_info_loaded" =~ ^([nN])$ ]]; then
  # Prompt user for remote environment info
  echo "Please provide the information for accessing the remote environment to be tested"
  read -p "Remote environment location (eg. openam-my-tenant.forgeblocks.com): " remote_environment_location
  read -p "Platform mode? [Y/n]:" platform_mode
  read -p "Username of the remote environment admin to test with (eg. my.email@forgerock.com): " remote_environment_admin_username
  read -p "Password of the remote environment admin to test with (eg. passw0rd): " remote_environment_admin_password

  # Ask if should save info, writing file if desired
  read -p "Save these inputs in 'e2e/.remote-environment-info.txt' for subsequent test runs? [Y/n]" store_inputs
  if [[ "$store_inputs" =~ ^([nN])$ ]]
  then
    echo "Remote environment informtion will not be stored"
  else
    # If an info file existed before, overwrite it
    if [ -f $REMOTE_ENVIRONMENT_INFO_FILE ]; then
      rm $REMOTE_ENVIRONMENT_INFO_FILE
    fi 
    echo "Storing remote environment information"
    echo $remote_environment_location >> $REMOTE_ENVIRONMENT_INFO_FILE
    echo $platform_mode >> $REMOTE_ENVIRONMENT_INFO_FILE
    echo $remote_environment_admin_username >> $REMOTE_ENVIRONMENT_INFO_FILE
    echo $remote_environment_admin_password >> $REMOTE_ENVIRONMENT_INFO_FILE
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
  export CYPRESS_TAGS="@forgeops"
else
  export CYPRESS_MENUS_FILE="menus.idcloud"
  export CYPRESS_ROUTES_FILE="routes.idcloud"
  export CYPRESS_IS_FRAAS="true"
  export CYPRESS_TAGS="@cloud"
fi

# Allow cypress-har-generator to run in electron browser
export ELECTRON_EXTRA_LAUNCH_ARGS=--remote-debugging-port=9222

$@
