# Copyright 2019 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.
###############################################################################
# Platform-shared docker image
###############################################################################
FROM gcr.io/engineering-devops/ci/node:14.15.0-stretch-slim

RUN apt-get update && apt-get install -y gettext-base python build-essential

# Copy dependency descriptors (only invalidates if dependencies change)
COPY package.json yarn.lock /home/app/
COPY packages/platform-admin/package.json /home/app/packages/platform-admin/
COPY packages/platform-enduser/package.json /home/app/packages/platform-enduser/
COPY packages/platform-login/package.json /home/app/packages/platform-login/
COPY packages/platform-registration/package.json /home/app/packages/platform-registration/
COPY packages/platform-shared/package.json /home/app/packages/platform-shared/

# Install dependencies (don’t generate yarn.lock)
WORKDIR /home/app/packages/platform-shared
RUN yarn install --immutable

# Copy source code
COPY . /home/app/
COPY dev-entrypoint.sh /dev-entrypoint.sh

EXPOSE 8080
