# Copyright (c) 2020 ForgeRock. All rights reserved.
#
# This software may be modified and distributed under the terms
# of the MIT license. See the LICENSE file for details.

###############################################################################
# Build Build Stage
###############################################################################
ARG BASE_TAG
FROM platform-shared:${BASE_TAG} AS build

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
