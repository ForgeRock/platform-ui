# Root for Forgerock platform UI

The root is intetended to handle all of the testing, mock and storybook intergration for the Forgerock UI platform.

## Getting started

First install yarn
```
brew install yarn
```

Next install node modules
```
yarn install
```

Now you should be able to run commands either from the root of the project or in each individual project (see each projects package.json for available commands)

## Project commands

### Run your end-to-end tests
```
yarn run test:admin:e2e
```

### Run your unit tests
```
yarn run test:components:unit
```

### Storybook component build

```
yarn run storybook:build
```

### Storybook component server

```
yarn run storybook:serve
```
