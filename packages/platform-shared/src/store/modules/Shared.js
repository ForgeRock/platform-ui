/**
 * Copyright 2019-2021 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';

const defaultState = {
  amBaseURL: '',
  idmBaseURL: '',
  fraasLoggingKeyURL: null,
  googleMapsApiKey: '',
  returnRoute: '',
  returnRouteText: '',
  uiConfig: null,
};

const mutations = {
  setBaseURLs(state, env) {
    if (env.VUE_APP_AM_URL) {
      state.amBaseURL = getFQDN(env.VUE_APP_AM_URL);
    }

    if (env.VUE_APP_IDM_URL) {
      state.idmBaseURL = getFQDN(env.VUE_APP_IDM_URL);
    }

    if (env.VUE_APP_FRAAS === 'true') {
      if (env.VUE_APP_FRAAS_LOGGING_URL) {
        state.fraasLoggingKeyURL = env.VUE_APP_FRAAS_LOGGING_URL;
      }
    }

    if (env.VUE_APP_GOOGLE_MAPS_API_KEY) {
      state.googleMapsApiKey = env.VUE_APP_GOOGLE_MAPS_API_KEY;
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

  setUiConfig(state, newValue) {
    state.uiConfig = newValue;
  },
};

export default {
  state: defaultState,
  mutations,
};
