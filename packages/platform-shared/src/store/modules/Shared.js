/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';

const defaultState = {
  amBaseURL: '',
  analyticsURL: '',
  autoAccessEnabled: false,
  autoAccessJasUrl: null,
  autoAccessApiUrl: null,
  idmBaseURL: '',
  currentPackage: '',
  fraasEnvironmentUrl: null,
  fraasFederationUrl: null,
  fraasLoggingKeyURL: null,
  fraasMonitoringURL: null,
  fraasPromotionUrl: null,
  fraasPromotionIngressUrl: null,
  fraasPromotionEgressUrl: null,
  googleFontsApiKey: '',
  googleMapsApiKey: '',
  governanceEnabled: false,
  governanceEnabledV2: false,
  igaApiUrl: null,
  returnRoute: '',
  returnRouteText: '',
  uiConfig: null,
  hasAmUrl: false,
  showEsvUi: false,
  showServiceAccountUi: false,
  webStorageAvailable: true,
  workforceEnabled: false,
};

const mutations = {
  setBaseURLs(state, env) {
    if (env.VUE_APP_AM_URL && env.VUE_APP_AM_URL.length > 0) {
      state.hasAmUrl = true;
      state.amBaseURL = getFQDN(env.VUE_APP_AM_URL);
    }

    if (env.VUE_APP_IDM_URL) {
      state.idmBaseURL = getFQDN(env.VUE_APP_IDM_URL);
    }

    if (env.VUE_APP_ANALYTICS_API_URL) {
      state.analyticsURL = env.VUE_APP_ANALYTICS_API_URL;
    }

    if (env.VUE_APP_FRAAS === 'true') {
      if (env.VUE_APP_FRAAS_ENV_URL) {
        state.fraasEnvironmentUrl = env.VUE_APP_FRAAS_ENV_URL;
      }
      if (env.VUE_APP_FRAAS_LOGGING_URL) {
        state.fraasLoggingKeyURL = env.VUE_APP_FRAAS_LOGGING_URL;
      }
      if (env.VUE_APP_FRAAS_MONITORING_URL) {
        state.fraasMonitoringURL = env.VUE_APP_FRAAS_MONITORING_URL;
      }
      if (env.VUE_APP_ENABLE_AUTO_ACCESS === 'true') {
        state.autoAccessEnabled = true;
        if (env.VUE_APP_AUTO_ACCESS_API_URL) {
          state.autoAccessApiUrl = env.VUE_APP_AUTO_ACCESS_API_URL;
        }
        if (env.VUE_APP_AUTO_ACCESS_JAS_URL) {
          state.autoAccessJasUrl = env.VUE_APP_AUTO_ACCESS_JAS_URL;
        }
      }
      if (env.VUE_APP_ENABLE_GOVERNANCE === 'true' || env.VUE_APP_ENABLE_GOVERNANCE === true || env.VUE_APP_ENABLE_GOVERNANCE_V2 === 'true' || env.VUE_APP_ENABLE_GOVERNANCE_V2 === true) {
        if (env.VUE_APP_IGA_API_URL) {
          state.igaApiUrl = env.VUE_APP_IGA_API_URL;
        }
      }
      if (env.VUE_APP_FRAAS_FEDERATION_ENFORCEMENT_URL) {
        state.fraasFederationUrl = env.VUE_APP_FRAAS_FEDERATION_ENFORCEMENT_URL;
      }
      if (env.VUE_APP_FRAAS_PROMOTION_URL) {
        state.fraasPromotionUrl = env.VUE_APP_FRAAS_PROMOTION_URL;
      }
      if (env.VUE_APP_FRAAS_PROMOTION_CONFIG_INGRESS_URL) {
        state.fraasPromotionIngressUrl = env.VUE_APP_FRAAS_PROMOTION_CONFIG_INGRESS_URL;
      }
      if (env.VUE_APP_FRAAS_PROMOTION_CONFIG_EGRESS_URL) {
        state.fraasPromotionEgressUrl = env.VUE_APP_FRAAS_PROMOTION_CONFIG_EGRESS_URL;
      }
    }

    if (env.VUE_APP_GOOGLE_FONTS_API_KEY) {
      state.googleFontsApiKey = env.VUE_APP_GOOGLE_FONTS_API_KEY;
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

  setCurrentPackage(state, newValue) {
    state.currentPackage = newValue;
  },

  setFeatureFlags(state, env) {
    if (env.VUE_APP_FRAAS === 'true') {
      if (env.VUE_APP_SHOW_ESV_UI) {
        state.showEsvUi = env.VUE_APP_SHOW_ESV_UI === 'true' || env.VUE_APP_SHOW_ESV_UI === true;
      }
      if (env.VUE_APP_SHOW_SERVICE_ACCOUNT_UI) {
        state.showServiceAccountUi = env.VUE_APP_SHOW_SERVICE_ACCOUNT_UI === 'true' || env.VUE_APP_SHOW_SERVICE_ACCOUNT_UI === true;
      }
      if (env.VUE_APP_ENABLE_GOVERNANCE === 'true' || env.VUE_APP_ENABLE_GOVERNANCE === true) {
        state.governanceEnabled = true;
      }
      if (env.VUE_APP_ENABLE_GOVERNANCE_V2 === 'true' || env.VUE_APP_ENABLE_GOVERNANCE_V2 === true) {
        state.governanceEnabled = true;
        state.governanceEnabledV2 = true;
      }
    }

    if (env.VUE_APP_ENABLE_WORKFORCE) {
      state.workforceEnabled = env.VUE_APP_ENABLE_WORKFORCE === 'true' || env.VUE_APP_ENABLE_WORKFORCE === true;
    }
  },
  setWebStorageAvailable(state, val) {
    state.webStorageAvailable = val;
  },
};

export default {
  state: defaultState,
  mutations,
};
