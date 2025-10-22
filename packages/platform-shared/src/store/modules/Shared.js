/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
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
  autoAccessReportsUrl: null,
  autoAccessTenantId: null,
  autoCustomReportsEnabled: false,
  autoReportsEnabled: false,
  currentPackage: '',
  applicationPolicyEnabled: false,
  fraasEnvironmentUrl: null,
  fraasFederationUrl: null,
  fraasLoggingKeyURL: null,
  fraasMonitoringURL: null,
  fraasPromotionAllowableIngressUrls: null,
  fraasPromotionUrl: null,
  fraasPromotionIngressUrl: null,
  fraasPromotionEgressUrl: null,
  googleFontsApiKey: '',
  googleMapsApiKey: '',
  governanceEnabled: false,
  governanceEnabledV4: false,
  hasAmUrl: false,
  idmBaseURL: '',
  igaApiUrl: null,
  igaOrchestrationApiUrl: null,
  helixEnvironmentId: '',
  helixEnvironmentUrl: '',
  journeyAIAgentVersion: null,
  journeyAIEnabled: false,
  managedObjectMinimumUIFilterLength: {},
  maxIdleExpirationTime: null,
  maxSessionExpirationTime: null,
  newMultiselectEnabled: false,
  mtlsEnabled: false,
  fraasMtlsFqdn: null,
  pingFederateUrl: null,
  nodeVersioningEnabled: false,
  promoteAppsViaApi: false,
  riskAdminEnabled: false,
  riskDashboardEnabled: false,
  showEsvUi: false,
  uiConfig: null,
  webStorageAvailable: true,
  workforceEnabled: false,
  wsfedEnabled: false,
  templateBuilderEnabled: false,
  enableSamlSigningCheckbox: false,
  enableManagedObjectSchemaEditor: false,
  overrideSessionTimeoutsEnabled: false,
  enableMonitoringUI: false,
};

const mutations = {
  setEnvironment(state, env) {
    if (env.VUE_APP_FRAAS?.toString() === 'true') {
      state.isFraas = true;
    }
  },
  setBaseURLs(state, env) {
    if (env.VUE_APP_AM_URL?.length > 0) {
      state.amBaseURL = getFQDN(env.VUE_APP_AM_URL);
    }

    if (env.VUE_APP_IDM_URL) {
      state.idmBaseURL = getFQDN(env.VUE_APP_IDM_URL);
    }

    if (env.VUE_APP_ANALYTICS_API_URL) {
      state.analyticsURL = getFQDN(env.VUE_APP_ANALYTICS_API_URL);
    }

    if (env.VUE_APP_FRAAS?.toString() === 'true') {
      if (env.VUE_APP_FRAAS_ENV_URL) {
        state.fraasEnvironmentUrl = getFQDN(env.VUE_APP_FRAAS_ENV_URL);
      }

      if (env.VUE_APP_ENABLE_MTLS?.toString() === 'true') {
        state.fraasMtlsFqdn = env.VUE_APP_MTLS_FQDN;
      }

      if (env.VUE_APP_FRAAS_LOGGING_URL) {
        state.fraasLoggingKeyURL = getFQDN(env.VUE_APP_FRAAS_LOGGING_URL);
      }

      if (env.VUE_APP_FRAAS_MONITORING_URL) {
        state.fraasMonitoringURL = getFQDN(env.VUE_APP_FRAAS_MONITORING_URL);
      }

      if (env.VUE_APP_ENABLE_AUTO_ACCESS?.toString() === 'true') {
        if (env.VUE_APP_AUTO_ACCESS_API_URL) {
          state.autoAccessApiUrl = getFQDN(env.VUE_APP_AUTO_ACCESS_API_URL);
        }
        if (env.VUE_APP_AUTO_ACCESS_JAS_URL) {
          state.autoAccessJasUrl = getFQDN(env.VUE_APP_AUTO_ACCESS_JAS_URL);
        }
        if (env.VUE_APP_AUTO_ACCESS_TENANT_ID) {
          state.autoAccessTenantId = env.VUE_APP_AUTO_ACCESS_TENANT_ID;
        }
      }

      if (env.VUE_APP_ENABLE_JOURNEY_AI?.toString() === 'true') {
        state.journeyAIAgentVersion = env.VUE_APP_HELIX_JOURNEY_AGENT_VERSION;
        state.helixEnvironmentUrl = getFQDN(env.VUE_APP_HELIX_ENVIRONMENT_URL);
        state.helixEnvironmentId = env.VUE_APP_HELIX_ENVIRONMENT_ID;
      }

      if (env.VUE_APP_ENABLE_GOVERNANCE?.toString() === 'true' || env.VUE_APP_ENABLE_GOVERNANCE_DEV?.toString() === 'true') {
        if (env.VUE_APP_IGA_API_URL) {
          state.igaApiUrl = getFQDN(env.VUE_APP_IGA_API_URL);
        }
        if (env.VUE_APP_IGA_ORCHESTRATION_API_URL) {
          state.igaOrchestrationApiUrl = getFQDN(env.VUE_APP_IGA_ORCHESTRATION_API_URL);
        }
      }

      if (env.VUE_APP_FRAAS_FEDERATION_ENFORCEMENT_URL) {
        state.fraasFederationUrl = getFQDN(env.VUE_APP_FRAAS_FEDERATION_ENFORCEMENT_URL);
      }

      if (env.VUE_APP_FRAAS_PROMOTION_URL) {
        state.fraasPromotionUrl = getFQDN(env.VUE_APP_FRAAS_PROMOTION_URL);
      }

      if (env.VUE_APP_FRAAS_ALLOWABLE_CONFIG_PROMOTION_INGRESS_URLS) {
        state.fraasPromotionAllowableIngressUrls = env.VUE_APP_FRAAS_ALLOWABLE_CONFIG_PROMOTION_INGRESS_URLS;
      }

      if (env.VUE_APP_FRAAS_PROMOTION_CONFIG_INGRESS_URL) {
        state.fraasPromotionIngressUrl = env.VUE_APP_FRAAS_PROMOTION_CONFIG_INGRESS_URL;
      }

      if (env.VUE_APP_FRAAS_PROMOTION_CONFIG_EGRESS_URL) {
        state.fraasPromotionEgressUrl = env.VUE_APP_FRAAS_PROMOTION_CONFIG_EGRESS_URL;
      }

      if (env.VUE_APP_ENABLE_WSFED?.toString() === 'true') {
        state.pingFederateUrl = getFQDN(env.VUE_APP_PINGFEDERATE_URL);
      }
    }

    if (env.VUE_APP_AUTO_ACCESS_REPORTS_URL) {
      state.autoAccessReportsUrl = getFQDN(env.VUE_APP_AUTO_ACCESS_REPORTS_URL);
    }

    if (env.VUE_APP_GOOGLE_FONTS_API_KEY) {
      state.googleFontsApiKey = env.VUE_APP_GOOGLE_FONTS_API_KEY;
    }

    if (env.VUE_APP_GOOGLE_MAPS_API_KEY) {
      state.googleMapsApiKey = env.VUE_APP_GOOGLE_MAPS_API_KEY;
    }
  },

  setUiConfig(state, newValue) {
    state.uiConfig = newValue;
  },

  setCurrentPackage(state, newValue) {
    state.currentPackage = newValue;
  },

  setFeatureFlags(state, env) {
    if (env.VUE_APP_AM_URL?.length > 0) {
      state.hasAmUrl = true;
    }

    if (env.VUE_APP_FRAAS === 'true') {
      if (env.VUE_APP_SHOW_ESV_UI?.toString() === 'true') {
        state.showEsvUi = true;
      }

      if (env.VUE_APP_ENABLE_GOVERNANCE_DEV?.toString() === 'true') {
        state.governanceEnabled = true;
        state.governanceDevEnabled = true;
      } else if (env.VUE_APP_ENABLE_GOVERNANCE?.toString() === 'true') {
        state.governanceEnabled = true;
      }

      if (env.VUE_APP_ENABLE_MTLS?.toString() === 'true') {
        state.mtlsEnabled = true;
      }

      if (env.VUE_APP_ENABLE_JOURNEY_AI?.toString() === 'true') {
        state.journeyAIEnabled = true;
      }

      if (env.VUE_APP_ENABLE_AUTO_ACCESS?.toString() === 'true') {
        state.autoAccessEnabled = true;
      }

      if (env.VUE_APP_ENABLE_MONITORING_UI?.toString() === 'true') {
        state.enableMonitoringUI = true;
      }

      if (env.VUE_APP_PROMOTE_APPS_VIA_API?.toString() === 'true') {
        state.promoteAppsViaApi = true;
      }
    }

    if (env.VUE_APP_ENABLE_SAML_SIGNING_CHECKBOX?.toString() === 'true') {
      state.enableSamlSigningCheckbox = true;
    }

    if (env.VUE_APP_ENABLE_APPLICATION_POLICY?.toString() === 'true') {
      state.applicationPolicyEnabled = true;
    }

    if (env.VUE_APP_ENABLE_TEMPLATE_BUILDER?.toString() === 'true') {
      state.workforceEnabled = true;
      state.templateBuilderEnabled = true;
    } else if (env.VUE_APP_ENABLE_WORKFORCE?.toString() === 'true') {
      state.workforceEnabled = true;
    }

    if (env.VUE_APP_ENABLE_MANAGED_OBJECT_SCHEMA_EDITOR?.toString() === 'true') {
      state.enableManagedObjectSchemaEditor = true;
    }

    if (env.VUE_APP_NODE_VERSIONING_ENABLED?.toString() === 'true') {
      state.nodeVersioningEnabled = true;
    }

    if (env.VUE_APP_ENABLE_WSFED?.toString() === 'true') {
      state.wsfedEnabled = true;
    }

    if (env.VUE_APP_ENABLE_ANALYTICS_CUSTOM_REPORTING?.toString() === 'true') {
      state.autoCustomReportsEnabled = true;
    }

    if (env.VUE_APP_ENABLE_ANALYTICS_REPORTING?.toString() === 'true') {
      state.autoReportsEnabled = true;
    }

    if (env.VUE_APP_ENABLE_OVERRIDE_SESSION_TIMEOUTS?.toString() === 'true') {
      state.overrideSessionTimeoutsEnabled = true;
    }
  },
  // Needed for Login since setFeatureFlags isn't called there
  setNewMultiselectEnabled(state, env) {
    state.newMultiselectEnabled = env.VUE_APP_ENABLE_NEW_MULTISELECT?.toString() === 'true';
  },
  setWebStorageAvailable(state, val) {
    state.webStorageAvailable = val;
  },
  setManagedObjectMinimumUIFilterLength(state, { managedObjectName, val }) {
    state.managedObjectMinimumUIFilterLength[managedObjectName] = val;
  },
  setMaxIdleExpirationTime(state, val) {
    state.maxIdleExpirationTime = val;
  },
  setMaxSessionExpirationTime(state, val) {
    state.maxSessionExpirationTime = val;
  },
  setRiskAdminEnabled(state, val) {
    state.riskAdminEnabled = val;
  },
  setRiskDashboardEnabled(state, val) {
    state.riskDashboardEnabled = val;
  },
};

const getters = {
  maxIdleExpirationTime: (state) => state.maxIdleExpirationTime,
  maxSessionExpirationTime: (state) => state.maxSessionExpirationTime,
};

export default {
  state: defaultState,
  mutations,
  getters,
};
