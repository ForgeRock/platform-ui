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
  jsonSchemas: {},
  jsonSchemaData: {},
  theme: 'default',
  workflow: false,
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

  setWorkflowState(context, enabled) {
    context.commit('setWorkflowState', enabled);
  },

  setSchema(context, obj) {
    context.commit('setSchema', obj);
  },

  clearSchema(context, schemaType) {
    context.commit('clearSchema', schemaType);
  },

  setSchemaData(context, obj) {
    context.commit('setSchemaData', obj);
  },

  clearSchemaData(context, schemaType) {
    context.commit('clearSchemaData', schemaType);
  },

  setSchemaDataPropertyValue(context, obj) {
    context.commit('setSchemaDataPropertyValue', obj);
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

    if (env.VUE_APP_ADMIN_URL) {
      state.adminURL = env.VUE_APP_ADMIN_URL;
    }

    if (env.VUE_APP_GOOGLE_MAPS_API_KEY) {
      state.googleMapsApiKey = env.VUE_APP_GOOGLE_MAPS_API_KEY;
    }
  },
  setWorkflowState(state, enabled) {
    state.workflow = enabled;
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

  setSchema(state, obj) {
    state.jsonSchemas[obj.schemaType] = obj.schema;
  },

  clearSchema(state, schemaType) {
    state.jsonSchemas[schemaType] = null;
  },

  setSchemaData(state, obj) {
    state.jsonSchemaData[obj.schemaType] = obj.data;
  },

  clearSchemaData(state, schemaType) {
    state.jsonSchemaData[schemaType] = null;
  },

  setSchemaDataPropertyValue(state, obj) {
    const { value, schemaType, model } = obj;

    let modelName = model;
    let valueToSet = value;

    // A model path ending with [0] indicates the backend is expecting an array
    // but we have presented a single value input to the user whose value should be stored as a single array entry
    if (endsWith(model, '[0]')) {
      // To get the correct location of the property to save we need to remove the '[0]' from the end of model
      modelName = model.substring(0, model.length - 3);
      valueToSet = [value];
    }

    const propertyExists = has(state.jsonSchemaData[schemaType], modelName);

    if (!propertyExists || endsWith(modelName, 'userpassword')) {
      set(state.jsonSchemaData[schemaType], modelName, valueToSet);
    } else {
      set(state.jsonSchemaData[schemaType], `${modelName}.value`, valueToSet);
    }
  },
};

export default {
  state: defaultState,
  getters,
  actions,
  mutations,
};
