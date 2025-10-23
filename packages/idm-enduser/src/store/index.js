/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
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
    },
  },
  mutations: {
    setAuthHeaders(state, val) {
      state.authHeaders = val;
    },
    setOAuthState(state, clientToken, originalToken, returnParams) {
      state.OAuthState = {
        clientToken,
        originalToken,
        returnParams,
      };
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
