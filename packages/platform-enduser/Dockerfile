###############################################################################
# Dependencies Build Stage
###############################################################################
FROM node:lts-slim AS dependencies

# Copy dependencies (supports yarn install)
COPY packages/platform-admin /home/app/packages/platform-admin/
COPY packages/platform-components /home/app/packages/platform-components/
COPY packages/platform-login /home/app/packages/platform-login/

# Copy dependency descriptors (only invalidates if dependencies change)
COPY package.json yarn.lock /home/app/
COPY packages/platform-enduser/package.json /home/app/packages/platform-enduser/

# Install dependencies (don’t generate yarn.lock)
WORKDIR /home/app/packages/platform-enduser
RUN yarn install --pure-lockfile

# Copy source code
COPY . /home/app/

###############################################################################
# Development Build Stage
###############################################################################
FROM node:lts-slim AS development

# Copy result of `dependencies` build stage
COPY --from=dependencies /home/app/ /home/app

WORKDIR /home/app/packages/platform-enduser

EXPOSE 8080

ENTRYPOINT ["yarn", "run", "dev"]

###############################################################################
# Build Build Stage
###############################################################################
FROM node:lts-slim AS build

# Copy result of `dependencies` build stage
COPY --from=dependencies /home/app/ /home/app

WORKDIR /home/app/packages/platform-enduser

RUN yarn run build

###############################################################################
# Production Build Stage
###############################################################################
FROM nginx:1.17 as production

# Copy result of `build` build stage
COPY --from=build /home/app/packages/platform-enduser/dist/ /usr/share/nginx/html
