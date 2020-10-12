/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
const defaultState = {
  amBaseURL: '',
  idmBaseURL: '',
  fraasLoggingKeyURL: null,
  returnRoute: '',
  returnRouteText: '',
};

const mutations = {
  setBaseURLs(state, env) {
    if (env.VUE_APP_AM_URL) {
      state.amBaseURL = env.VUE_APP_AM_URL;
    }

    if (env.VUE_APP_IDM_URL) {
      state.idmBaseURL = env.VUE_APP_IDM_URL;
    }

    if (env.VUE_APP_FRAAS === 'true') {
      if (env.VUE_APP_FRAAS_LOGGING_URL) {
        state.fraasLoggingKeyURL = env.VUE_APP_FRAAS_LOGGING_URL;
      }
    }
  },

  setReturnRoute(state, newValue) {
    if (newValue.returnRoute || newValue.returnRoute === '') {
      state.returnRoute = newValue.returnRoute;
    }

    if (newValue.returnRouteText || newValue.returnRouteText === '') {
      state.returnRouteText = newValue.returnRouteText;
    }
  },
};

export default {
  state: defaultState,
  mutations,
};
