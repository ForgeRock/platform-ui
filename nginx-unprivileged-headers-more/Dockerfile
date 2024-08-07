# Copyright 2020-2024 ForgeRock AS. All Rights Reserved
#
# Use of this code requires a commercial software license with ForgeRock AS.
# or with one of its affiliates. All use shall be exclusively subject
# to such license between the licensee and ForgeRock AS.

ARG NGINX_VERSION

# First build stage, used to build an nginx module we use in our image
FROM gcr.io/engineering-devops/ci/base-images/nginxinc/nginx-unprivileged:${NGINX_VERSION} as build

ARG HEADERS_MORE_VERSION

USER root

RUN apt-get upgrade && \ 
    apt-get update && \
    apt-get install -y \
        openssh-client \
        git \
        wget \
        libxml2 \
        libxslt1-dev \
        libpcre3 \
        libpcre3-dev \
        zlib1g \
        zlib1g-dev \
        openssl \
        libssl-dev \
        libtool \
        automake \
        gcc \
        g++ \
        make && \
    rm -rf /var/cache/apt

RUN wget "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" -O nginx.tar.gz && \
  wget "https://github.com/openresty/headers-more-nginx-module/archive/v${HEADERS_MORE_VERSION}.tar.gz" -O headers_more.tar.gz

# Build the headers more nginx module as a dynamic module, reusing the same cli arguments as the nginx image used to build
RUN CONFARGS=$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p') \
	tar -zxC /usr/src -f nginx.tar.gz && \
  tar -zxC /usr/src -f headers_more.tar.gz && \
  cd /usr/src/nginx-${NGINX_VERSION} && \
  ./configure --with-compat $CONFARGS --add-dynamic-module=/usr/src/headers-more-nginx-module-${HEADERS_MORE_VERSION} && \
  make modules

USER 101

# Main stage, combine the upstream nginx image alpine slim variant with the built module and update dependencies
FROM gcr.io/engineering-devops/ci/base-images/nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine-slim

COPY nginx-unprivileged-headers-more/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/nginx-${NGINX_VERSION}/objs/ngx_http_headers_more_filter_module.so /usr/lib/nginx/modules/ngx_http_headers_more_filter_module.so

USER root

RUN apk update && \
  apk upgrade && \
  rm -rf /var/cache/apk/*

# Install gettext for envsubst used in variable_replacement.sh
RUN apk add --no-cache gettext

RUN chown -R nginx /usr/share/nginx/html
USER nginx
