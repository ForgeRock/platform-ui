<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->
<div align="center">
  <img width="120" src="logo.png">
  <h1>Ping Identity Platform Login</h1>
  Login Application for the Ping Identity Platform.
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
yarn dev
```

### Compiles and minifies for production

```sh
yarn build
```

### Run your unit tests

```sh
yarn unit
```

### Run your e2e tests against the local UI backed by a platform deployment

```
yarn e2e
```

Ensure localhost 8083 is not currently reserved under a separate terminal

### Run your e2e tests against a remote UI that's part of a platform or ID cloud environment

```
yarn e2e:remote
```

### Lints and fixes files

```sh
yarn lint
```

## Environment variables

Currently environment variables are:

1) `VUE_APP_AM_URL` - URL of AM instance that will be used for authentication and selfservice processes
2) `VUE_APP_AM_ADMIN_URL` - URL of AMs admin instance that will be used for authentication and selfservice processes
3) `THEME` - Will load a corresponding theme.scss file (example dark-theme.scss).

These are made available in the .env file.

Access in Vue files:

```sh
process.env.VUE_APP_AM_URL
process.env.VUE_APP_AM_ADMIN_URL
```
