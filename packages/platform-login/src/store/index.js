/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createStore } from 'vuex';
import Shared from '@forgerock/platform-shared/src/store/modules/Shared';

export default createStore({
  mutations: {
    setHostedJourneyPagesState(state, enabled) {
      state.hostedJourneyPages = enabled;
    },
  },
  modules: {
    SharedStore: {
      namespaced: true,
      state: Shared.state,
      mutations: Shared.mutations,
    },
  },
});
