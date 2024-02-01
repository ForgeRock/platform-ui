#!/usr/bin/env bash
set -euxo pipefail

kubernetes_namespace=${KUBERNETES_NAMESPACE:-default}

export CYPRESS_AM_USERNAME="amadmin"
export CYPRESS_AM_PASSWORD=$(kubectl --namespace $kubernetes_namespace get secret am-env-secrets -o jsonpath='{.data.AM_PASSWORDS_AMADMIN_CLEAR}' | base64 --d)
export CYPRESS_ACCESS_TOKEN=`curl -u idm-provisioning:$(kubectl --namespace $kubernetes_namespace get secret amster-env-secrets -o jsonpath='{.data.IDM_PROVISIONING_CLIENT_SECRET}' | base64 --d) --data 'grant_type=client_credentials&scope=fr:idm:*' -k "https://$(kubectl --namespace $kubernetes_namespace get configmaps platform-config -o jsonpath='{.data.FQDN}')/am/oauth2/access_token"`
export CYPRESS_FQDN=`kubectl --namespace $kubernetes_namespace get configmaps platform-config -o jsonpath='{.data.FQDN}'`
export CYPRESS_BASE_URL="https://$CYPRESS_FQDN"
export CYPRESS_MENUS_FILE="menus.platform"
export CYPRESS_ROUTES_FILE="routes.platform"
export TZ="Europe/London"

$@
