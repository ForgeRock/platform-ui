/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/**
 * State - Enduser data store information
 *      @param {object} authHeaders - Request headers needed for authenticated requests
 *      @param {string} idmBaseURL - Location of IDM
 *      @param {string} theme - Current theme set for the application
 *      @param {string} idmClientID - IDM client ID used for calls
 */

import {
  set,
  endsWith,
  has,
} from 'lodash';

const defaultState = {
  amAdminURL: null,
  amBaseURL: null,
  authHeaders: null,
  googleMapsApiKey: '',
  idmBaseURL: '/openidm',
  idmClientID: null,
  loginRedirect: null,
  loginURL: null,
  oauthSaveObj: null,
  oauthSchema: null,
  theme: 'default',
};

const getters = {
  applicationState(state) { return state; },
};

const actions = {
  setEnvironment(context, env) {
    context.commit('setEnvironment', env);
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

  setOauthSaveObj(context, obj) {
    context.commit('setOauthSaveObj', obj);
  },

  clearOauthSaveObj(context) {
    context.commit('clearOauthSaveObj');
  },

  setOauthSchema(context, obj) {
    context.commit('setOauthSchema', obj);
  },

  clearOauthSchema(context) {
    context.commit('clearOauthSchema');
  },

  setOauthSaveObjPropertyValue(context, obj) {
    context.commit('setOauthSaveObjPropertyValue', obj);
  },
};

const mutations = {
  setEnvironment(state, env) {
    if (env.VUE_APP_AM_URL) {
      state.amBaseURL = env.VUE_APP_AM_URL;
    }

    if (env.VUE_APP_AM_ADMIN_URL) {
      state.amAdminURL = env.VUE_APP_AM_ADMIN_URL;
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

    if (env.VUE_APP_GOOGLE_MAPS_API_KEY) {
      state.googleMapsApiKey = env.VUE_APP_GOOGLE_MAPS_API_KEY;
    }
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
    state.loginRedirect = null;
  },

  setOauthSaveObj(state, obj) {
    state.oauthSaveObj = obj;
  },

  clearOauthSaveObj(state) {
    state.oauthSaveObj = null;
  },

  setOauthSchema(state, obj) {
    state.oauthSchema = obj;
  },

  clearOauthSchema(state) {
    state.oauthSchema = null;
  },

  setOauthSaveObjPropertyValue(state, obj) {
    const [objName, propName] = obj.model.split('.');
    const propertyExists = has(state.oauthSaveObj[objName], propName);

    if (endsWith(obj.model, '[0]')) {
      set(state.oauthSaveObj, `${obj.model.substring(0, obj.model.length - 3)}.value`, [obj.value]);
    } else if (!propertyExists) {
      set(state.oauthSaveObj, `${obj.model}`, obj.value);
    } else {
      set(state.oauthSaveObj, `${obj.model}.value`, obj.value);
    }
  },
};

export default {
  state: defaultState,
  getters,
  actions,
  mutations,
};
