/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createStore } from 'vuex';
import Shared from '@forgerock/platform-shared/src/store/modules/Shared';
import AutoAccess from '@forgerock/platform-shared/src/store/modules/AutoAccess';

export default createStore({
  state: {
    // environment variables
    adminURL: null,
    idmClientID: null,
    theme: 'default',

    workflow: false,
    // realm info
    realm: 'root',
    realms: [],

    // FRaaS specific
    isFraas: false,
    hostedPages: true,

    // user
    privileges: [],
    approvalsCount: null,
    certificationCount: null,
    fulfillmentTasksCount: null,
    violationsCount: null,
    inboxTotalCount: null,
    requestCartUsers: [],

    // governance lcm settings
    govLcmSettings: {},
    govLcmEnabled: false,
    govLcmEntitlement: false,
    govLcmUser: false,
  },
  mutations: {
    setEnvironment(state, env) {
      if (env.VUE_APP_ADMIN_URL) {
        state.adminURL = env.VUE_APP_ADMIN_URL;
      }

      if (env.VUE_APP_ENDUSER_CLIENT_ID) {
        state.idmClientID = env.VUE_APP_ENDUSER_CLIENT_ID;
      }

      if (env.THEME) {
        state.theme = env.THEME;
      }

      if (env.VUE_APP_FRAAS === 'true') {
        state.isFraas = true;
      }
    },

    setRealm(state, realm) {
      const realmName = (realm.startsWith('/')) ? realm.substring(1) : realm;
      state.realm = realmName;
    },

    setWorkflowState(state, enabled) {
      state.workflow = enabled;
    },

    setHostedPagesState(state, enabled) {
      state.hostedPages = enabled;
    },

    setPrivileges(state, privileges) {
      state.privileges = privileges;
    },

    setCertificationCount(state, count) {
      state.certificationCount = count;
      state.inboxTotalCount = state.approvalsCount + state.certificationCount + state.violationsCount + state.fulfillmentTasksCount;
    },

    setApprovalsCount(state, count) {
      state.approvalsCount = count;
      state.inboxTotalCount = state.approvalsCount + state.certificationCount + state.violationsCount + state.fulfillmentTasksCount;
    },

    setFulfillmentTasksCount(state, count) {
      state.fulfillmentTasksCount = count;
      state.inboxTotalCount = state.approvalsCount + state.certificationCount + state.violationsCount + state.fulfillmentTasksCount;
    },

    setViolationsCount(state, count) {
      state.violationsCount = count;
      state.inboxTotalCount = state.approvalsCount + state.certificationCount + state.violationsCount + state.fulfillmentTasksCount;
    },

    setRequestCartUsers(state, users) {
      state.requestCartUsers = users;
    },

    setGovLcmSettings(state, lcmSettings) {
      state.govLcmSettings = lcmSettings;
    },

    setGovLcmEntitlement(state, { createEntitlement, viewEntitlement }) {
      state.govLcmEntitlement = (createEntitlement || viewEntitlement);
      if (state.govLcmEntitlement) state.govLcmEnabled = true;
    },

    setGovLcmUser(state, { viewUser }) {
      state.govLcmUser = viewUser;
      if (state.govLcmUser) state.govLcmEnabled = true;
    },
  },
  modules: {
    ...AutoAccess,
    SharedStore: {
      namespaced: true,
      state: Shared.state,
      mutations: Shared.mutations,
      getters: Shared.getters,
    },
  },
});
