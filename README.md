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
- [Running against a local IDM](#running-against-a-local-idm)
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

### Setting up Nix (recommended)

This repository uses a pinned [Nix flake](https://nixos.wiki/wiki/Flakes) to provide reproducible developer tooling on macOS and Linux. We recommend the [Determinate Nix Installer](https://determinate.systems/nix-installer/); the [official Nix installer](https://nixos.org/download/) is also supported. Windows users should use [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install); native Windows shells are not supported.

From the repository root, run:

```sh
nix develop
platform-ui-doctor
YARN_ENABLE_GLOBAL_CACHE=1 yarn install --immutable
```

If you use [direnv](https://direnv.net/), run `direnv allow` once to load the flake shell automatically. Nix provides the development tooling; Docker, backend services, credentials, certificates, and environment configuration remain separate prerequisites where needed.

### Manual setup

Without Nix, use a Node.js version manager to install Node.js 24.10.0 (Node 14+ is the minimum supported by older tooling) and use the bundled Yarn 3.6.1. Clone the repo, run `yarn install --immutable` from its root, then enter a package under `packages` and run `yarn dev`. Do not install another global Yarn version: `.yarnrc.yml` selects the checked-in release.

Docker Desktop or another Docker daemon must be installed and running for Docker-based tests. Install and configure `gcloud` manually when cloud tests are needed, authenticating through your organization's approved process. Certificate scripts may require local Java tooling and certificates. E2E tests require access to a suitable ForgeOps or cloud backend plus its environment/proxy configuration.
To start the development server, navigate to a target package inside `platform-ui/packages` and run `yarn dev`.

<a name="running-against-a-local-idm"></a>
## Running against a local IDM

The Admin UI has an IDM mode (`VUE_APP_DEPLOYMENT_TYPE=IDM`) that talks to a standalone IDM instead of an AM-backed platform — for IDM product work and UI PR review (see also the [IDM UI PR Guide](https://pingidentity.atlassian.net/wiki/spaces/UE/pages/2809135155) and [IDM Basic Setup](https://pingidentity.atlassian.net/wiki/spaces/UE/pages/2010546328) on Confluence).

1. **Get IDM running.** Any of these work:
   - An extracted IDM (from Backstage, or built locally with `mvn clean install` and `openidm-zip/target/openidm-*.zip`), started with `./startup.sh`. Default project, `localhost:8080`, `openidm-admin/openidm-admin`. Add `jpda` to debug the Java side from IntelliJ on :5005.
   - An IDM already running any other way — started by hand, from an IDE, under [platman](https://github.com/ping-rocks/openam-manager/blob/dev/platman/README.md), or a docker compose lab. Whatever answers on the IDM port is picked up as-is.
   - Leave it to the VS Code tasks: set `PLATFORM_UI_IDM_HOME` (see step 3) and the "IDM (local)" debug config or "dev: start idm admin" task starts it for you.

2. **Run the UI**: `cd packages/platform-admin && yarn dev:idm` → `http://localhost:8082`. The dev server proxies `/openidm` to `https://localhost:8443` (a stock zip install's HTTPS listener). The `idm-enduser` package works the same way with plain `yarn dev` on `:8889`.

3. **If your IDM differs from the stock install**, set what moved in `~/.config/platform-ui/dev.env` (created by the "dev: first-time setup" VS Code task, or by hand):

   | Key | Default | What it does |
   |---|---|---|
   | `PLATFORM_UI_IDM_PORT` | `8080` | Port the tasks use to detect and health-check a running IDM |
   | `PLATFORM_UI_IDM_SCHEME` | `http` | Scheme of the listener the readiness probe hits — `https` for an IDM answering only on its TLS listener |
   | `PLATFORM_UI_IDM_USER` / `PLATFORM_UI_IDM_PASSWORD` | `openidm-admin` | Credentials for the `/openidm/info/ping` readiness probe |
   | `PLATFORM_UI_IDM_HOME` | — | Only needed if the tasks should start IDM for you; the directory containing `startup.sh` |
   | `VUE_APP_IDM_PROXY_TARGET` | `https://localhost:8443` | IDM origin the dev server proxies `/openidm` to — scheme://host[:port] only, no `/openidm` path (e.g. a docker compose lab on `:9443`) |

   When running `yarn dev:idm` by hand (outside the VS Code tasks), export `VUE_APP_IDM_PROXY_TARGET` yourself or uncomment it in `packages/platform-admin/.env.idm` (or `packages/idm-enduser/.env`).

4. **Debugging the UI with the debugger attached**: open the repo in VS Code and pick the "IDM (local) — admin" config in the Run and Debug panel. It starts IDM (or adopts the one already running), the dev server, and a Chromium profile the debugger can attach to. See `.vscode/tasks.json` and `.vscode/scripts/` — everything there is also runnable from any terminal.

An IDM you started yourself is never stopped by these tasks — teardown only touches an IDM the tasks started.

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
