/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import Shared from '@forgerock/platform-shared/src/store/modules/Shared';
import User from './modules/User';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // environment variables
    adminURL: null,
    idmClientID: null,
    theme: 'default',

    workflow: false,
    // realm info
    realm: 'root',
    realms: [],
    realmAliases: [],

    // FRaaS specific
    isFraas: false,
    hostedPages: true,
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

      if (state.realms.length) {
        const newRealm = state.realms.find((r) => r.name === realmName);
        state.realmAliases = (newRealm) ? newRealm.aliases : [];
      }
    },

    setWorkflowState(state, enabled) {
      state.workflow = enabled;
    },

    setHostedPagesState(state, enabled) {
      state.hostedPages = enabled;
    },
  },
  modules: {
    UserStore: {
      namespaced: true,
      getters: User.getters,
      state: User.state,
      mutations: User.mutations,
    },
    SharedStore: {
      namespaced: true,
      state: Shared.state,
      mutations: Shared.mutations,
    },
  },
});
