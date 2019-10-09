/**
 * State - Enduser data store information
 *      @param {object} authHeaders - Request headers needed for authenticated requests
 *      @param {object} amDataEndpoints - AM endpoints
 *      @param {string} idmBaseURL - Location of IDM
 *      @param {string} theme - Current theme set for the application
 *      @param {string} idmClientID - IDM client ID used for calls
 */

const defaultState = {
  authHeaders: null,
  amDataEndpoints: null,
  loginRedirect: null,
  amBaseURL: null,
  idmBaseURL: '/openidm',
  loginURL: null,
  theme: 'default',
  idmClientID: null,
};

const getters = {
  applicationState(state) { return state; },
};

const actions = {
  setEnvironment(context, env) {
    context.commit('setEnvironment', env);
  },
  setAmDataEndpointsAction(context, amDataEndpoints) {
    context.commmit('setAmDataEndpointsAction', amDataEndpoints);
  },

  clearAmDataEndpointsAction(context) {
    context.commmit('clearAmDataEndpointsAction');
  },

  setAuthHeadersAction(context, headers) {
    context.commmit('setAuthHeadersAction', headers);
  },

  clearAuthHeadersAction(context) {
    context.commmit('clearAuthHeadersAction');
  },

  setLoginRedirect(context, redirect) {
    context.commmit('setLoginRedirect', redirect);
  },

  clearLoginRedirect(context) {
    context.commmit('clearLoginRedirect');
  },
};

const mutations = {
  setEnvironment(state, env) {
    if (env.VUE_APP_AM_URL) {
      state.amBaseURL = env.VUE_APP_AM_URL;
    }

    if (env.VUE_APP_IDM_URL) {
      state.idmBaseURL = env.VUE_APP_IDM_URL;
    }

    if (env.THEME) {
      state.theme = env.THEME;
    }

    if (env.VUE_APP_ENDUSER_CLIENT_ID) {
      state.idmClientID = env.VUE_APP_ENDUSER_CLIENT_ID;
    }

    if (env.VUE_APP_LOGIN_URL) {
      state.loginURL = env.VUE_APP_LOGIN_URL;
    }

    if (env.VUE_APP_ADMIN_URL) {
      state.adminURL = env.VUE_APP_ADMIN_URL;
    }
  },

  setAmDataEndpointsAction(state, amDataEndpoints) {
    state.amDataEndpoints = amDataEndpoints;
  },

  clearAmDataEndpointsAction(state) {
    state.amDataEndpoints = null;
  },

  setAuthHeadersAction(state, headers) {
    state.authHeaders = headers;
  },

  clearAuthHeadersAction(state) {
    state.authHeaders = null;
  },

  setLoginRedirect(state, redirect) {
    state.loginRedirect = redirect;
  },

  clearLoginRedirect(state) {
    state.loginRedirect = null;
  },

  clearEnduserSelfservice(state) {
    state.authHeaders = null;
    state.amDataEndpoints = null;
    state.loginRedirect = null;
  },
};

export default {
  state: defaultState,
  getters,
  actions,
  mutations,
};
