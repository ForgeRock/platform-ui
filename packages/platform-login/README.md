<div align="center">
  <img width="120" src="logo.png">
  <h1>ForgeRock Platform Login</h1>
  Login Application for the ForgeRock Platform.
  <p>
</div>

- [Project Setup](#project-setup)
  - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
  - [Compiles and minifies for production](#compiles-and-minifies-for-production)
  - [Run your tests](#run-your-tests)
  - [Lints and fixes files](#lints-and-fixes-files)
  - [Run your unit tests](#run-your-unit-tests)
  - [Build (Development) Docker Image](#build-development-docker-image)
  - [Run (Development) Docker Container](#run-development-docker-container)
- [Environment variables](#environment-variables)

## Project Setup

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

### Build (Development) Docker Image

```sh
yarn run docker:build
# Image is tagged `platform-login:development`
```

### Run (Development) Docker Container

```sh
yarn run docker:run
```

## Environment variables

Currently environment variables are:

1) `VUE_APP_AM_URL` - URL of AM instance that will be used for authentication and selfservice processes
3) `THEME` - Will load a corresponding theme.scss file (example dark-theme.scss).

These are made available in the .env file.

Access in Vue files:

```sh
process.env.VUE_APP_AM_URL
```
