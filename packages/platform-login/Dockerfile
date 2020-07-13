# Copyright (c) 2020 ForgeRock. All rights reserved.
#
# This software may be modified and distributed under the terms
# of the MIT license. See the LICENSE file for details.

###############################################################################
# Dependencies Build Stage
###############################################################################
FROM node:lts-slim AS dependencies

# Copy dependencies (supports yarn install)
COPY packages/platform-admin /home/app/packages/platform-admin/
COPY packages/platform-shared /home/app/packages/platform-shared/
COPY packages/platform-enduser /home/app/packages/platform-enduser/

# Copy dependency descriptors (only invalidates if dependencies change)
COPY package.json yarn.lock /home/app/
COPY packages/platform-login/package.json /home/app/packages/platform-login/

# Install dependencies (don’t generate yarn.lock)
WORKDIR /home/app/packages/platform-login
RUN yarn install --pure-lockfile

# Copy source code
COPY . /home/app/

###############################################################################
# Build Build Stage
###############################################################################
FROM node:lts-slim AS build

# Copy result of `dependencies` build stage
COPY --from=dependencies /home/app/ /home/app

WORKDIR /home/app/packages/platform-login

RUN yarn run build

###############################################################################
# Production Build Stage
###############################################################################
FROM nginxinc/nginx-unprivileged:1.17 as production

# Copy result of `build` build stage
COPY --from=build --chown=nginx /home/app/packages/platform-login/dist/ /usr/share/nginx/html

COPY --chown=nginx variable_replacement.sh /variable_replacement.sh
COPY --chown=nginx entrypoint.sh /entrypoint.sh

CMD ["/entrypoint.sh"]
