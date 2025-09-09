/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

/**
 * Mocks the BootstrapVue modal composable for testing purposes.
 *
 * Sets up mock implementations for the `show` and `hide` methods of the modal,
 * and configures `useBvModal` to return these mocks.
 *
 * @returns {{ modalShow: jest.Mock, modalHide: jest.Mock }}
 *   An object containing the mocked `show` and `hide` functions.
 */
// eslint-disable-next-line import/prefer-default-export
export function mockModal() {
  const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
  useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });

  return {
    modalShow: bvModalOptions.show,
    modalHide: bvModalOptions.hide,
  };
}
