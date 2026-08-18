/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import Forbidden from './index';

jest.mock('@forgerock/platform-shared/src/mixins/LoginMixin', () => ({
  methods: { logoutUser: jest.fn() },
}));

const pushMock = jest.fn();

describe('Forbidden component', () => {
  function setup({ defaultRoute = null } = {}) {
    return mount(Forbidden, {
      global: {
        mocks: {
          $t: (key) => key,
          $store: {
            state: {
              SharedStore: { currentPackage: 'admin' },
              defaultRoute,
              enduserURL: 'https://enduser.example.com',
            },
          },
          $router: { push: pushMock },
        },
      },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['uses the recorded default route', { name: 'ManagedIdentities' }, { name: 'ManagedIdentities' }],
    ['falls back to Dashboard when no default route is set', null, { name: 'Dashboard' }],
  ])('%s', async (name, defaultRoute, expectedPush) => {
    const wrapper = setup({ defaultRoute });

    await wrapper.find('button').trigger('click');

    expect(pushMock).toHaveBeenCalledWith(expectedPush);
  });
});
