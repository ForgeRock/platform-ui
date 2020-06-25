/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import {
  each,
  has,
  isNull,
} from 'lodash';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm.min';
import Notifications from 'vue-notification';
import PromisePoly from 'es6-promise';
import ToggleButton from 'vue-js-toggle-button';
import {
  ValidationObserver,
  ValidationProvider,
  extend,
  localize,
} from 'vee-validate';
import en from 'vee-validate/dist/locale/en.json';
import * as rules from 'vee-validate/dist/rules';
import Vue from 'vue';
import AppAuthHelper from 'appauthhelper/appAuthHelperCompat';
import SessionCheck from 'oidcsessioncheck';
import store from '@forgerock/platform-shared/src/store';
import { redirectToLogin } from '@forgerock/platform-shared/src/mixins/LoginMixin';
// eslint-disable-next-line import/no-extraneous-dependencies
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import router from './router';
import i18n from './i18n';
import App from './App';
import 'core-js/stable';

// Turn off production warning messages
Vue.config.productionTip = false;

PromisePoly.polyfill();

// Ready translated locale messages
// IDM Context default
const idmContext = process.env.VUE_APP_IDM_URL;

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
  document.body.className = '';

  if (has(to, 'meta.bodyClass')) {
    document.body.className = (document.body.className + to.meta.bodyClass).trim();
  }

  if (has(to, 'meta.authenticate')) {
    if (isNull(store.state.UserStore.userId)) {
      const authInstance = axios.create({
        baseURL: idmContext,
        timeout: 5000,
        headers: store.state.ApplicationStore.authHeaders,
      });

      authInstance.post('/authentication?_action=login').then((userDetails) => {
        store.commit('UserStore/setUserIdAction', userDetails.data.authorization.id);
        store.commit('UserStore/setManagedResourceAction', userDetails.data.authorization.component);
        store.commit('UserStore/setRolesAction', userDetails.data.authorization.roles);
        axios.all([
          authInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
          authInstance.post('privilege?_action=listPrivileges'),
          getSchema(userDetails.data.authorization.component, { baseURL: idmContext })]).then(axios.spread((profile, privilege, schema) => {
          store.commit('UserStore/setProfileAction', profile.data);
          store.commit('UserStore/setSchemaAction', schema.data);
          store.commit('UserStore/setAccess', privilege.data);

          next();
        }));
      },
      () => {
        // Recheck class in case of double login load using from location
        document.body.className = '';

        if (has(from, 'meta.bodyClass')) {
          document.body.className = (document.body.className + from.meta.bodyClass).trim();
        }

        next({ name: 'Login' });
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

// Globally load bootstrap vue components for use
Vue.use(BootstrapVue);

// Register validation components for global use
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});

// How to add an extra validation rule
// Date rule added for workflow
extend('date_format', {
  validate(value) {
    return value.match(/^\d{2}[.//]\d{2}[.//]\d{4}$/);
  },
  message: () => 'Invalid date format',
});

// For now use vee validate loclization, need to eventually convert to vue i18n
localize('en', en);

/*
  Basic Notification Example:
  this.$notify({
      group: 'IDMMessages', // Currently the only group
      type: 'success', // Available types success, failure, info, warning
      title: this.$t('common.messages.saveSuccess'), //Translated string
      text: this.$t('pages.resources.mappingSave') // Translated string (can also be html)
  });
 */
Vue.use(Notifications);
Vue.use(ToggleButton);

// required to use PascalCase `RouterView` and `RouterLink` instead of `router-view` and `router-link`
const RouterView = Vue.component('router-view');
const RouterLink = Vue.component('router-link');

Vue.component('RouterView', RouterView);
Vue.component('RouterLink', RouterLink);

const loadApp = () => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    i18n,
    template: '<App/>',
    components: { App },
  });
};
/*
    We will load the application regardless
 */
const startApp = () => {
  const idmInstance = axios.create({
    baseURL: idmContext,
    timeout: 5000,
    headers: {},
  });

  axios.all([
    idmInstance.get('/info/uiconfig'),
    idmInstance.get('info/features?_queryFilter=true')]).then(axios.spread((uiConfig, availability) => {
    if (uiConfig.data.configuration.lang) {
      i18n.locale = uiConfig.data.configuration.lang;
    }

    each(availability.data.result, (feature) => {
      if (feature.name === 'workflow') {
        store.commit('ApplicationStore/setWorkflowState', feature.enabled);
      }
    });

    return loadApp();
  }))
    .catch(() => loadApp());
};

const addAppAuth = () => {
  const AM_URL = store.state.ApplicationStore.amBaseURL;
  const commonSettings = {
    clientId: store.state.ApplicationStore.idmClientID,
    authorizationEndpoint: `${AM_URL}/oauth2/authorize`,
  };
  const { loginURL } = store.state.ApplicationStore;

  AppAuthHelper.init({
    clientId: commonSettings.clientId,
    authorizationEndpoint: commonSettings.authorizationEndpoint,
    tokenEndpoint: `${AM_URL}/oauth2/access_token`,
    revocationEndpoint: `${AM_URL}/oauth2/token/revoke`,
    endSessionEndpoint: `${AM_URL}/oauth2/connect/endSession`,
    resourceServers: {
      [store.state.ApplicationStore.idmBaseURL]: 'openid',
    },
    interactionRequiredHandler: store.state.ApplicationStore.loginURL ? () => {
      redirectToLogin(loginURL);
    } : undefined,
    tokensAvailableHandler(claims) {
      // this function is called every time the tokens are either
      // originally obtained or renewed
      const sessionCheck = new SessionCheck({
        clientId: commonSettings.clientId,
        opUrl: commonSettings.authorizationEndpoint,
        subject: claims.sub,
        invalidSessionHandler() {
          AppAuthHelper.logout().then(() => {
            // eslint-disable-next-line no-unused-expressions
            this.$store.state.ApplicationStore.loginURL ? redirectToLogin(loginURL) : AppAuthHelper.getTokens();
          });
        },
        cooldownPeriod: 5,
      });
      // check the validity of the session immediately
      sessionCheck.triggerSessionCheck();

      // check every minute
      setInterval(() => {
        sessionCheck.triggerSessionCheck();
      }, 60000);
      // check with every captured event
      document.addEventListener('click', () => {
        sessionCheck.triggerSessionCheck();
      });
      document.addEventListener('keypress', () => {
        sessionCheck.triggerSessionCheck();
      });

      startApp();
    },
  });

  // In this application, we want tokens immediately, before any user interaction is attempted
  AppAuthHelper.getTokens();

  // trigger logout from anywhere in the SPA by calling this global function
  window.logout = () => {
    AppAuthHelper.logout().then(() => {
      // eslint-disable-next-line no-unused-expressions
      store.state.ApplicationStore.loginURL ? redirectToLogin(loginURL) : AppAuthHelper.getTokens();
    });
  };
};

store.commit('ApplicationStore/setEnvironment', process.env);
addAppAuth();
