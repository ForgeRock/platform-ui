# Forgerock UI

<p align="center">
  <b>Forgerock UI</b>

  <p align="center">
    Monorepo containing various Forgerock UIs.
    <br>
    <a href="https://backstage.forgerock.com/docs/"><strong>Explore ForgeRock docs »</strong></a>
  </p>
  <p align="center">
    The purpose of this readme is to help users explore the ForgeRock UI monorepo. Which contains a variety of UI parts such as views, styles and components utilized for different 
    ForgeRock UIs.
  </p>
</p>

## Table of contents

- [Quick start](#quick-start)
- [Build Tools](#build-tools)
- [Testing tools](#testing-tools)
- [Application tools](#application-tools)
- [Code Style](#code-style)
- [Translations and Text](#translations-and-text)
- [Deployment](#deployment)
- [Theming](#theming)
- [Build command summary](#build-command-summary)
- [Browser support](#browser-support)

<a name="quick-start"></a>
## Development Quick start

- [Download and install node](https://nodejs.org/en/download/) version 14 or higher, or verify your node version `node -v` in your terminal. Your Node.js version should be >=14.
- This project uses a specific version of Yarn (3.6.1) that is bundled with the project in `.yarn/releases`. It's not required to install Yarn globally for this project, but if you are interested in how Yarn works or if you plan to use your own Yarn version, you can learn more about installing Yarn [here](https://yarnpkg.com/getting-started/install). You can verify the yarn version running `yarn -v` in your terminal.
- Clone or download the repo
- Navigate to newly cloned `platform-ui` directory, and install dependencies with yarn command: `yarn install`. Since this project uses [Yarn workspaces](https://yarnpkg.com/features/workspaces), this will install package requirements in all project folders under `packages`
- To start the development server, navigate to target project by changing directory to specific package inside the `platform-ui/packages` directory, and enter the command: `yarn dev`

<a name="build-tools"></a>
## Build Tools
- [Node](https://nodejs.org/en/) - Used for deploymenet and development
- [Vue CLI](https://cli.vuejs.org/) - Vue project and distribution management (layers ontop of webpack)
- [Webpack](https://webpack.js.org/) - Core distribution management
- [Yarn](https://yarnpkg.com/lang/en/) - Package manager

<a name="testing"></a>
## Testing

#### Unit tests

Testing is achieved with the [Jest Testing Framework](https://jestjs.io/) and configured globally inside: `jest.config.base.js` and locally to each project inside: `jest.config.js`

- To run unit tests **across all workspaces**, in the root `platform-ui` directory, run the command: `yarn unit` or `yarn unit:watch`
- To run unit tests on a **specific workspace**, `cd` to the specific directory, and run command `yarn unit`


#### End to End tests (E2E)

[Cypress](https://www.cypress.io/) is leveraged for all End to End tests

- To run E2E tests, `cd` to the specific directory where you want to run the tests, and run `e2e`, or `e2e:open`
- By default, the E2E test suite is configured to run against a UI hosted at https://default.iam.example.com, which is part of a full platform deployment. However, the tests may also be run against a remote platform or Forgerock Identity cloud deploymeny using the tasks `e2e:remote` or `e2e:remote:open`.

<a name="testing-tools"></a>
## Testing tools

The following testing tools are installed when you install the project dependencies:

- [Jest](https://jestjs.io/) - Unit testing
- [Cypress](https://www.cypress.io/) - E2E testing
- [Vue Test Utils](https://vue-test-utils.vuejs.org/) - Vue utility testing library

<a name="application-tools"></a>
## Application tools

The following application tools are installed when you install the project dependencies:
- [Vue](https://vuejs.org/v2/api/) - Primary JavaScript framework for the project
- [Vue compat](https://github.com/vuejs/core/tree/main/packages/vue-compat#readme) - Vue 3 migration build
- [Vue Router](https://router.vuejs.org/en/) - Application routing Vue library
- [Vue Bootstrap](https://bootstrap-vue.js.org/) - Bootstrap 4 Vue components
- [Axios](https://github.com/axios/axios) - JavaScript Promise Library
- [Vue i18n](https://kazupon.github.io/vue-i18n/en/) - Translation library for Vue
- [Vee Validate](https://github.com/baianat/vee-validate) - Form validation for Vue
- [lodash](https://lodash.com/) - Util library for preforming various efficient calculations
- [Pinia](https://pinia.vuejs.org/) / [VueX](https://vuex.vuejs.org/) - State management

<a name="code-style"></a>
## Code style

- [Vue Specific Eslint Rules](https://vuejs.github.io/eslint-plugin-vue/rules/#priority-b-strongly-recommended-improving-readability) - Linter rules specific to Vue
- [General Javascript Styles](https://github.com/airbnb/javascript) - Javascript base eslint rules
- [CSS Lint Rules](https://github.com/stylelint/stylelint-config-standard) - CSS base lint rules using amalgamation of airbnb's, Googles, Idiomatic's, and @mdo's style config

<a name="translations-and-text"></a>
## Translations and Text

Application translation uses [Vue i18n](https://kazupon.github.io/vue-i18n/en/) and the `openidm/info/uiconfig` endpoint to get the current user's browser language.

The project only contains `en` based translations and falls back to `en` if an unsupported language is detected. To change the default language fallback adjust VueI18n `/src/main.js`.

Adding and changing an existing message for the `en` base language involves either adding a key or editing an existing key.
Keys follow JSON structure; for example, if you wanted to edit the navigation bar `Profile` to `User Profile` you would need to locate the appropriate key `en.pages.app.profile` and change the text.
Inside of your Vue application you would then make use of that key with the built in translation function `{{$t('pages.app.profile')}}` or `this.$t('pages.app.profile')`.

Adding a new translation language means creating a new translation file inside of locales folder with a key matching the translation language code.

For example:

```
en.json
fr.json
gr.json
```

Then creating a JSON key structure that should be mirrored across all of the language files.

For example:

``` JSON
    {
        dashboard: {
            welcomeMessage: 'Welcome!'
        }
    }
```

<a name="deployment"></a>
## Deployment

Running `yarn build` creates a distribution file in the `dist` folder of that specific project. Each deployment use case is different.

<a name="theming"></a>
## Theming

The following theming tools are installed when you install the project dependencies:

- [SCSS](https://sass-lang.com/) - CSS enhancement library
- [Bootstrap 4](https://getbootstrap.com/docs/4.6/getting-started/introduction/) - CSS Styling framework

Theming makes use of two concepts:

- Theming follows the basic [Bootstrap theming guidelines](https://getbootstrap.com/docs/4.6/getting-started/theming/) and relies on SCSS variable overrides.
- The theme file is loaded with an optional flag when running the dev server or distribution build. For example, `yarn dev --theme=red` or `yarn build --theme=red`.

When you include the theme flag, the `node` build scripts attempt to locate a corresponding file in `src/scss`. The file must also contain a `-theme.scss` moniker, for example, `red-theme.scss`.

The default project includes three themes:
- ForgeRock default theme
- ForgeRock dark theme `yarn dev --theme=dark`
- ForgeRock rock theme `yarn dev --theme=rock`. This theme demonstrates how to use a full background image, with fallback to the default theme.


<a name="build-command-summary"></a>
## Build command summary

Inside of the packages folder of the monorepo you will find each stand alone project. These stand alone projects all rely on similar commands, on occation there are minor differences (for example theming doesn't apply to admin). Please check and package.json to see the specific commands. Here is a list of the universal commands.

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080 (increments by 1 automatically if port is in use).
yarn dev

# server with theme loaded (not admin)
yarn dev --theme=red

# build for production with minification
yarn build

# build with theme loaded (not admin)
yarn build --theme=red

# run all tests
yarn unit
```

<a name="browser-support"></a>
## Browser support

- Latest Edge
- Latest Firefox
- Latest Safari
- Latest Chrome
