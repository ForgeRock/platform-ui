<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
# Root for Forgerock platform UI

The root is intended to handle all of the testing, mock and storybook integration for the Forgerock UI platform.

## Getting started

First install yarn:

```
brew install yarn
```

Next install node packages:

```
yarn install
```

From here navigate into ```packages``` folder and choose the appropriate sub repo project. Each repo contains its repo specific readme.md

### Storybook component build

```
yarn run storybook:build
```

### Storybook component server

```
yarn run storybook:serve
```
