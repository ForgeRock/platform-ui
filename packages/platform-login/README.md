<div align="center">
  <img width="120" src="logo.png">
  <h1>ForgeRock Platform Login</h1>
  Login Application for the ForgeRock Platform.
  <p>
</div>

- [Project setup](#project-setup)
  - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
  - [Compiles and minifies for production](#compiles-and-minifies-for-production)
  - [Run your tests](#run-your-tests)
  - [Lints and fixes files](#lints-and-fixes-files)
  - [Run your unit tests](#run-your-unit-tests)
- [Environment variables](#environment-variables)
- [Docker](#docker)
  - [Development](#development)
  - [Production](#production)

## Project setup

If you haven't installed the node packages, you can run it from inside this folder, it will climb up to the top level and install everything appropriately.

```sh
yarn install
```

### Compiles and hot-reloads for development

```sh
yarn run dev
```

### Compiles and minifies for production

```sh
yarn run build
```

### Run your tests

```sh
yarn run test
```

### Lints and fixes files

```sh
yarn run lint
```

### Run your unit tests

```sh
yarn run test:unit
```

## Environment variables

Currently environment variables are:

1) `VUE_APP_AM_URL` - URL to be used by default if no goto after successful login/registration
1) `VUE_APP_ENDUSER_URL` - URL of AM instance that will be used for authentication and selfservice processes
1) `THEME` - Will load a corresponding theme.scss file (example dark-theme.scss).

These are made available in the .env file.

Access in Vue files:

```sh
process.env.VUE_APP_AM_URL
process.env.VUE_APP_ENDUSER_URL
```

## Docker

### Development

Execute all `docker` commands from the root of the repository.

```sh
docker build \
  --file packages/platform-login/Dockerfile \
  --tag platform-login:development \
  --target development \
  .
```

```sh
docker run \
  --interactive \
  --publish-all \
  --tty \
  --volume <PATH_TO_REPO>/packages/platform-login/src/:/home/app/packages/platform-login/src \
  --volume <PATH_TO_REPO>/packages/platform-components/src/:/home/app/packages/platform-components/src \
  platform-login:development
```

### Production

Execute all `docker` commands from the root of the repository.

```sh
docker build \
  --file packages/platform-login/Dockerfile \
  --tag platform-login:production \
  --target production \
  .
```

```sh
docker run \
  --publish-all \
  platform-login:production
```
