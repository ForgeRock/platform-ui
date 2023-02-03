# Copyright (c) 2020-2023 ForgeRock. All rights reserved.
#
# This software may be modified and distributed under the terms
# of the MIT license. See the LICENSE file for details.

ARG BASE_TAG
FROM gcr.io/forgerock-io/nginx-unprivileged-headers-more:${BASE_TAG} as production

COPY --chown=nginx packages/platform-enduser/dist /usr/share/nginx/html

COPY --chown=nginx variable_replacement.sh /variable_replacement.sh
COPY --chown=nginx entrypoint.sh /entrypoint.sh

CMD ["/entrypoint.sh"]
