# Platform Login

## Project setup
If you haven't installed the node packages, you can run it from inside this folder, it will climb up to the top level and install everything appropriately.

```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run dev
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your unit tests
```
yarn run test:unit
```

## Environment variables

Currently environment variables are:
1) VUE_APP_AM_URL - URL to be used by default if no goto after successful login/registration
2) VUE_APP_ENDUSER_URL - URL of AM instance that will be used for authentication and selfservice processes
3) THEME - Will load a corresponding theme.scss file (example dark-theme.scss).

These are made available in the .env file.

Access in Vue files:

```
process.env.VUE_APP_AM_URL
process.env.VUE_APP_ENDUSER_URL
```
