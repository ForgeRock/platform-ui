# Copyright 2020-2026 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

ARG NGINX_IMAGE_VERSION

# First build stage, used to build an nginx module we use in our image
# Must use the same Alpine base as the runtime stage so the compiled .so
# is linked against musl — a Debian (glibc) build produces a module that
# is binary-incompatible with the Alpine (musl) runtime image.
FROM gcr.io/engineering-devops/ci/base-images/nginxinc/nginx-unprivileged:${NGINX_IMAGE_VERSION}-alpine-slim AS build

ARG HEADERS_MORE_VERSION

USER root

RUN apk upgrade --no-cache && \
  apk add --no-cache \
  openssh-client \
  git \
  wget \
  libxml2 \
  libxslt-dev \
  pcre2 \
  pcre2-dev \
  zlib \
  zlib-dev \
  openssl \
  openssl-dev \
  libtool \
  automake \
  gcc \
  g++ \
  make \
  linux-headers

# Detect the nginx version from the base image so the source download always matches
# Download and build the headers more nginx module as a dynamic module, reusing the same cli arguments
RUN NGINX_VERSION=$(nginx -v 2>&1 | sed 's/.*\///') && \
  wget "https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" -O nginx.tar.gz && \
  wget "https://github.com/openresty/headers-more-nginx-module/archive/v${HEADERS_MORE_VERSION}.tar.gz" -O headers_more.tar.gz && \
  CONFARGS=$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p') && \
  mkdir -p /usr/src && \
  tar -zxC /usr/src -f nginx.tar.gz && \
  tar -zxC /usr/src -f headers_more.tar.gz && \
  cd /usr/src/nginx-${NGINX_VERSION} && \
  sh -c "./configure --with-compat $CONFARGS --add-dynamic-module=/usr/src/headers-more-nginx-module-${HEADERS_MORE_VERSION}" && \
  make modules && \
  cp /usr/src/nginx-${NGINX_VERSION}/objs/ngx_http_headers_more_filter_module.so /tmp/ngx_http_headers_more_filter_module.so

USER 101

# Main stage, combine the upstream nginx image alpine slim variant with the built module and update dependencies
FROM gcr.io/engineering-devops/ci/base-images/nginxinc/nginx-unprivileged:${NGINX_IMAGE_VERSION}-alpine-slim

COPY nginx-unprivileged-headers-more/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /tmp/ngx_http_headers_more_filter_module.so /usr/lib/nginx/modules/ngx_http_headers_more_filter_module.so

USER root

RUN apk update && \
  apk upgrade && \
  rm -rf /var/cache/apk/*

# Install gettext for envsubst used in variable_replacement.sh
RUN apk add --no-cache gettext

RUN chown -R nginx /usr/share/nginx/html
USER nginx
