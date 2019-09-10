import _ from 'lodash';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm.min';
import Notifications from 'vue-notification';
import PromisePoly from 'es6-promise';
import ToggleButton from 'vue-js-toggle-button';
import VeeValidate from 'vee-validate';
import Vue from 'vue';
import AppAuthHelper from 'appauthhelper/appAuthHelperCompat';
import SessionCheck from 'oidcsessioncheck';
import router from './router';
import i18n from './i18n';
import App from './App';
import 'core-js/stable';
import store from './store/store';

// Turn off production warning messages
Vue.config.productionTip = false;

PromisePoly.polyfill();

// Ready translated locale messages
// IDM Context default
const idmContext = window.context || '/openidm';

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
	document.body.className = '';

	if (_.has(to, 'meta.bodyClass')) {
		document.body.className = (document.body.className + to.meta.bodyClass).trim();
	}

	if (_.has(to, 'meta.authenticate')) {
		if (_.isNull(store.state.UserStore.userId)) {
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
					authInstance.get(`schema/${userDetails.data.authorization.component}`)]).then(axios.spread((profile, privilege, schema) => {
					store.commit('UserStore/setProfileAction', profile.data);
					store.commit('UserStore/setSchemaAction', schema.data);
					store.commit('UserStore/setAccess', privilege.data);

					next();
				}));
			},
			() => {
				// Recheck class in case of double login load using from location
				document.body.className = '';

				if (_.has(from, 'meta.bodyClass')) {
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
/*
    Basic Validation Example:
    <p :class="{ 'control': true }">
        <input v-validate="'required|email'" :class="{'input': true, 'is-danger': errors.has('email') }" name="email" type="text" placeholder="Email">
        <span v-show="errors.has('email')" class="help is-danger">{{ errors.first('email') }}</span>
    </p>

    To use VeeValidate in a component include:

    $_veeValidate: {
        validator: 'new'
    }
 */
Vue.use(VeeValidate, { inject: false, fastExit: false });
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

// Global mixin for making openIDM REST calls
Vue.mixin({
	methods: {
		// Generated an axios ajax request service for consistent use of calls to IDM
		getRequestService(config) {
			let baseURL = idmContext;
			let timeout = 5000;
			let headers = {
				'content-type': 'application/json',
				'cache-control': 'no-cache',
				'x-requested-with': 'XMLHttpRequest',
			};

			if (config) {
				if (config.baseURL) {
					// eslint-disable-next-line prefer-destructuring
					baseURL = config.baseURL;
				}

				if (config.timeout) {
					// eslint-disable-next-line prefer-destructuring
					timeout = config.timeout;
				}

				if (config.headers && !_.isEmpty(config.headers)) {
					// eslint-disable-next-line prefer-destructuring
					headers = config.headers;
				}
			}

			headers = _.extend(headers, store.state.ApplicationStore.authHeaders || {});
			const instance = axios.create({
				baseURL,
				timeout,
				headers,
			});

			instance.interceptors.response.use(response => response, (error) => {
				if (error.response && error.response.data && error.response.data.code === 401) {
					this.$router.push({ name: 'Login' });

					return Promise.reject(error);
				} if (_.isUndefined(error.response)) {
					// In the case of critical error
					return Promise.reject(new Error(error.message));
				}
				return Promise.reject(error);
			});

			return instance;
		},
		// Headers used for oauth requests and selfservice
		getAnonymousHeaders() {
			const headers = store.state.ApplicationStore.authHeaders || { };
			return headers;
		},
		// Display a application notification
		displayNotification(notificationType, message) {
			/* istanbul ignore next */
			this.$notify({
				group: 'IDMMessages',
				type: notificationType,
				text: message,
			});
		},
		// Log a user out of their existing session
		logoutUser() {
			window.logout();
		},
		// One location for checking and redirecting a completed login for s user
		completeLogin() {
			if (!_.isNull(store.state.ApplicationStore.loginRedirect)) {
				this.$router.push(store.state.ApplicationStore.loginRedirect);
				store.dispatch('ApplicationStore/clearLoginRedirect');
			} else {
				this.$router.push('/');
			}
		},
	},
});

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

		if (uiConfig.data.configuration.amDataEndpoints) {
			this.$store.commit('ApplicationStore/setAmDataEndpointsAction', uiConfig.data.configuration.amDataEndpoints);
		}

		this.$store.commit('ApplicationStore/setEnduserSelfservice', availability.data.result);

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
	const redirectToLogin = () => {
		window.location.href = store.state.ApplicationStore.loginURL;
	};

	AppAuthHelper.init({
		clientId: commonSettings.clientId,
		authorizationEndpoint: commonSettings.authorizationEndpoint,
		tokenEndpoint: `${AM_URL}/oauth2/access_token`,
		revocationEndpoint: `${AM_URL}/oauth2/token/revoke`,
		endSessionEndpoint: `${AM_URL}/oauth2/connect/endSession`,
		resourceServers: {
			[store.state.ApplicationStore.idmBaseURL]: 'openid fr:idm:profile fr:idm:profile_update fr:idm:consent_read fr:idm:notifications',
			'http://localhost:8888/openidm': 'openid fr:idm:profile fr:idm:profile_update fr:idm:consent_read fr:idm:notifications',
		},
		interactionRequiredHandler: store.state.ApplicationStore.loginURL ? () => {
			redirectToLogin();
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
						this.$store.state.ApplicationStore.loginURL ? redirectToLogin() : AppAuthHelper.getTokens();
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
			store.state.ApplicationStore.loginURL ? redirectToLogin() : AppAuthHelper.getTokens();
		});
	};
};

store.commit('ApplicationStore/setEnvironment', process.env);
addAppAuth();
