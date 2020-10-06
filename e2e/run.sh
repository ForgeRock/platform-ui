#!/usr/bin/env bash
set -euxo pipefail

packages=(@forgerock/platform-login @forgerock/platform-enduser @forgerock/platform-admin)
exit_codes=()

set +e
for package in ${packages[@]}; do
    yarn workspace "$package" run cypress run --headless
    exit_codes+=($?)
done
set -e

yarn run mochawesome-merge ./packages/*/mochawesome-report/*.json -o mochawesome-report.json
yarn run marge mochawesome-report.json

for exit_code in ${exit_codes[@]}; do
    if [[ $exit_code -ne 0 ]]; then
        exit $exit_code
    fi
done
