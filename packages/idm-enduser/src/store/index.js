/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createStore } from 'vuex';
import Shared from '@forgerock/platform-shared/src/store/modules/Shared';

export default createStore({
  state: {
    authHeaders: {},
    OAuthState: {
      clientToken: null,
      originalToken: null,
      returnParams: null,
      linkedProvider: null,
    },
    workflow: false,
  },
  mutations: {
    setAuthHeaders(state, val) {
      state.authHeaders = val;
    },
    setOAuthState(state, params) {
      state.OAuthState = {
        clientToken: params.clientToken,
        originalToken: params.originalToken,
        returnParams: params.returnParams,
        linkedProvider: params.linkedProvider,
      };
    },
    clearOAuthState(state) {
      state.OAuthState = {
        clientToken: null,
        originalToken: null,
        returnParams: null,
        linkedProvider: null,
      };
    },
    setWorkflowState(state, enabled) {
      state.workflow = enabled;
    },
  },
  modules: {
    SharedStore: {
      namespaced: true,
      state: Shared.state,
      mutations: Shared.mutations,
    },
    FeatureFlagsStore: {
      namespaced: true,
      state: {
        isSelfServiceEnabled: process.env.VUE_APP_ENABLE_SELF_SERVICE === 'true',
      },
    },
  },
});
