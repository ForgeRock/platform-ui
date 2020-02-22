<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
# Root for Forgerock platform UI

The root is intended to handle all of the testing, mock and storybook integration for the Forgerock UI platform.

## Getting started
### ForgeOps setup
First: ensure you have all the latest versions of the required third-party software seen here: [third-party software](https://ea.forgerock.com/docs/forgeops/devops-guide-minikube/#devops-implementation-env-sw).

#### Authentication configuration
Before running the setup, there’s a configuration file that needs to be updated for the register to work appropriately. Go to `docker` > `7.0` > `cdk` > `idm` > `conf` > `authentication.json`, and update the commented line below:

```js
{
    "rsFilter" : {
        // …
        "propertyMapping" : {
            "authenticationId" : "userName", // changed from “_id”
            "userRoles" : "authzRoles"
        }
        // …
```

Now, we should be ready to start the setup.

#### Minikube setup and run
Run each setup scripts from below individually within your local, cloned repo of [forgeops](https://stash.forgerock.org/projects/CLOUD/repos/forgeops/browse):

```sh
minikube start --memory=8192 --disk-size=40g \
  --vm-driver=virtualbox --bootstrapper kubeadm --kubernetes-version=1.15.0

minikube addons enable ingress

minikube ssh sudo ip link set docker0 promisc on

eval $(minikube docker-env)

kubens default

./bin/config.sh init

skaffold dev
```

#### Localhost setup
Add your dev IP to the `/etc/hosts` file:

```sh
minikube ip
# copy the IP from stdout

sudo vi /etc/hosts

# Within the hosts file
<IP copied from above> default.iam.example.com
```

You can then visit http://default.iam.example.com/am for AM and http://default.iam.example.com/admin for IDM.

#### Add certificate exception to browser
Visit default.iam.example.com/am with your chosen browser and accept the unknown certificate.

### Platform UI setup
Install `yarn` globally and project dependencies:

```sh
# Install Yarn for dependency management
# (Will only need to run once)
brew install yarn

# Install dependencies at root
cd ~/<path-to-dir>/platform-ui
yarn install

# Create a separate terminal window for each package
# (Except for `platform-shared`)
cd ~/<path-to-dir>/platform-ui/packages/<package>

# Run the following script in each terminal
yarn dev
```

### Creating our first user
Running `localhost:8888`, and you should be forwarded to login page. If not, you may not have all the packages running. You can go straight to the login with `localhost:8083/#/service/Login`. Once you're there, click on “Create an account” and fill out the form. Upon successful user creation, you will be placed within the end user app: `localhost:8888`.

You will have two users now:

- **an end user**: the one you just created above)
- **an admin user**: the default one you used to login to AM; `amadmin` and `password`

If you want to use both, remember to use separate browsers or use a regular window and incognito window for the other so the two sessions don't overlap.

### Additional Notes
#### Platform-UI URLs
1. Login: `localhost:8083`
2. Admin: `localhost:8082`
3. End user: `localhost:8888`
4. Express: `localhost:8080`

#### Rebuilding ForgeOps
When you pull new code from `origin` you will need to restart ForgeOps. To do that, run this script to remove the old Minikube instance:

```sh
minikube delete
```

Then, rerun *all* the commands above in section “ForgeOps setup”.

#### Troubleshooting’
1. AM pod can become problematic. The solution is to force kill the pod and let the cluster regenerate: `kubectl delete pod <AMPODNAME> —grace-period=0 —force`
2. Sometimes when you delete the cluster and bring it back up, the IP of the cluster increments: `minikube ip`, then edit your hosts file again `sudo vi /etc/hosts` with that new IP for `default.iam.example.com`
3. If you get an error about UUID’s from AM when trying to register a user, you may need to go back and edit the IDM configuration to use `userName` as the authentication ID and not `_id`. Make that change (at the top of this file), and then delete and restart your Minikube setup.

### Storybook component build

```
yarn run storybook:build
```

### Storybook component server

```
yarn run storybook:serve
```

## Key Build and Deployment Technologies
- [Node](https://nodejs.org/en/) - Used for deploymenet and development
- [Vue CLI](https://cli.vuejs.org/) - Vue project and distribution management (layers ontop of webpack)
- [Webpack](https://webpack.js.org/) - Core distribution management
- [Yarn](https://yarnpkg.com/lang/en/) - Package manager

## Key Development Technologies
- [Vue](https://vuejs.org/v2/api/) - Primary JavaScript framework for the project
- [Vue Router](https://router.vuejs.org/en/) - Application routing Vue library
- [Vue Bootstrap](https://bootstrap-vue.js.org/) - Bootstrap 4 Vue components
- [Axios](https://github.com/axios/axios) - JavaScript Promise Library
- [Vue i18n](https://kazupon.github.io/vue-i18n/en/) - Translation library for Vue
- [Vee Validate](https://github.com/baianat/vee-validate) - Form validation for Vue
- [lodash](https://lodash.com/) - Util library for preforming various efficient calculations
- [VueX](https://vuex.vuejs.org/) - State management

## Key Testing Technologies
- [Jest](https://jestjs.io/) - Unit testing
- [Cypress](https://www.cypress.io/) - E2E testing

## Misc Important Technologies
- [Story Book](https://storybook.js.org/) - Component viewing and testing

## Code style
- [Vue Specific Eslint Rules](https://vuejs.github.io/eslint-plugin-vue/rules/#priority-b-strongly-recommended-improving-readability) - Linter rules specific to Vue
- [General Javascript Styles](https://github.com/airbnb/javascript) - Javascript base eslint rules
- [CSS Lint Rules](https://github.com/stylelint/stylelint-config-standard) - CSS base lint rules using amalgamation of airbnb's, Googles, Idiomatic's, and @mdo's style config

Please see package.json for any modifications to these rules
