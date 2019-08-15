/**
 * State - Enduser data store information
 *      @param {object} authHeaders - Request headers needed for authenticated requests
 *      @param {object} amDataEndpoints - AM endpoints
 *      @param {string} idmBaseURL - Location of IDM
 *      @param {string} theme - Current theme set for the application
 *      @param {string} idmClientID - IDM client ID used for platform calls
 */
export default {
  state: {
    authHeaders: null,
    amDataEndpoints: null,
    loginRedirect: null,
    amBaseURL: null,
    idmBaseURL: '/openidm',
    loginURL: null,
    theme: 'default',
    idmClientID: null,
  },

  setEnvironment(env) {
    if (env.VUE_APP_AM_URL) {
      this.state.amBaseURL = env.VUE_APP_AM_URL;
    }

    if (env.VUE_APP_IDM_URL) {
      this.state.idmBaseURL = env.VUE_APP_IDM_URL;
    }

    if (env.THEME) {
      this.state.theme = env.THEME;
    }

    if (env.VUE_APP_IDM_CLIENTID) {
      this.state.idmClientID = env.VUE_APP_IDM_CLIENTID;
    }

    if (env.VUE_APP_LOGIN_URL) {
      this.state.loginURL = env.VUE_APP_LOGIN_URL;
    }
  },

  setAmDataEndpointsAction(amDataEndpoints) {
    this.state.amDataEndpoints = amDataEndpoints;
  },

  clearAmDataEndpointsAction() {
    this.state.amDataEndpoints = null;
  },

  setAuthHeadersAction(headers) {
    this.state.authHeaders = headers;
  },

  clearAuthHeadersAction() {
    this.state.authHeaders = null;
  },

  setLoginRedirect(redirect) {
    this.state.loginRedirect = redirect;
  },

  clearLoginRedirect() {
    this.state.loginRedirect = null;
  },

  clearEnduserSelfservice() {
    this.state.authHeaders = null;
    this.state.amDataEndpoints = null;
    this.state.loginRedirect = null;
  },
};
