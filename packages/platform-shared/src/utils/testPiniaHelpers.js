/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/no-extraneous-dependencies */
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

/**
 * Creates a testing instance of pinia using the passed initial store state and makes it active so that components will see it in tests
 * @param {Object} initialState an object defining the initial state for stores to be used in a test
 * @param {Boolean} stubActions controls whether pinia stores have their actions/methods stubbed for easier data mocking (default true)
 */
export function setupTestPinia(initialState, stubActions = true) {
  const testPinia = createTestingPinia({
    initialState,
    stubActions,
  });
  setActivePinia(testPinia);
}

export default { setupTestPinia };
