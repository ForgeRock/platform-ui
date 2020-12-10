/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
