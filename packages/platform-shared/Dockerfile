# Copyright 2019 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.
###############################################################################
# Platform-shared docker image
###############################################################################
FROM node:lts-slim

RUN apt-get update && apt-get install gettext-base

# Copy dependencies (supports yarn install)
COPY packages/platform-admin /home/app/packages/platform-admin/
COPY packages/platform-shared /home/app/packages/platform-shared/
COPY packages/platform-enduser /home/app/packages/platform-enduser/
COPY packages/platform-login /home/app/packages/platform-login/

# Copy dependency descriptors (only invalidates if dependencies change)
COPY package.json yarn.lock /home/app/
COPY packages/platform-shared/package.json /home/app/packages/platform-shared/

# Install dependencies (don’t generate yarn.lock)
WORKDIR /home/app/packages/platform-shared
RUN yarn install --pure-lockfile

# Copy source code
COPY . /home/app/
COPY dev-entrypoint.sh /dev-entrypoint.sh

EXPOSE 8080
