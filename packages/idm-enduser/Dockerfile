FROM nginxinc/nginx-unprivileged:stable-alpine-slim

ARG WEB_ROOT_LOCATION=www/enduser
ARG NGINX_CONF=nginx.docker.conf

USER root
RUN apk upgrade --no-cache && apk add --no-cache gettext
USER nginx

COPY --chown=nginx:nginx ${NGINX_CONF} /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx ${WEB_ROOT_LOCATION}/ /usr/share/nginx/html
COPY --chown=nginx variable_replacement.sh /variable_replacement.sh
COPY --chown=nginx entrypoint.sh /entrypoint.sh

ENV IDM_REST_URL="/openidm"

CMD ["/entrypoint.sh"]
