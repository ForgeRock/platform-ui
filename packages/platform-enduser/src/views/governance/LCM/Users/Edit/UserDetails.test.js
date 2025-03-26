/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import UserDetails from './UserDetails';
import i18n from '@/i18n';

jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { userId: 'testId' } })),
}));

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');

ManagedResourceApi.getManagedResource.mockImplementation(() => Promise.resolve({
  data: {
    userName: 'mikeTest',
    givenName: 'Mike',
    sn: 'Test',
    mail: 'test@test.com',
  },
}));

SchemaApi.getSchema.mockImplementation(() => Promise.resolve({
  data: {
    order: [
      'userName',
      'givenName',
      'sn',
      'mail',
    ],
    properties: {
      userName: {
        title: 'User Name',
        type: 'string',
      },
      givenName: {
        title: 'Given Name',
        type: 'string',
      },
      sn: {
        title: 'Surname',
        type: 'string',
      },
      mail: {
        title: 'Email Address',
        type: 'string',
      },
    },
  },
}));

PrivilegeApi.getResourceTypePrivilege.mockImplementation(() => Promise.resolve({
  data: {
    VIEW: {
      allowed: true,
      properties: [
        'userName',
        'givenName',
        'sn',
        'mail',
      ],
    },
  },
}));

describe('UserDetails', () => {
  let wrapper;
  function mountComponent() {
    setupTestPinia();
    return mount(UserDetails, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('has header with first name, last name, user name', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('.media-body').exists()).toBe(true);
    expect(wrapper.find('.media-body').text()).toContain('Mike Test');
    expect(wrapper.find('.media-body').text()).toContain('mikeTest');
  });

  it('has a tab for the user profile', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[role="tab"]').exists()).toBe(true);
    expect(wrapper.find('[role="tab"]').text()).toContain('Profile');
  });
});
