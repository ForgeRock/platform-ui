/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import UserList from './UserList';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');

describe('UserList', () => {
  let wrapper;
  function mountComponent() {
    return mount(UserList, {
      global: {
        plugins: [i18n],
      },
    });
  }

  ManagedResourceApi.getManagedResourceList.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          userName: 'mikeTest',
          givenName: 'Mike',
          sn: 'Test',
          mail: 'test@test.com',
        },
      ],
    },
  }));

  it('has columns for name and email', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const userRow = wrapper.find('thead tr');
    expect(userRow.text()).toMatch('Name');
    expect(userRow.text()).toMatch('Email');
  });

  it('shows the first name, last name, and userName', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const userRow = wrapper.find('tbody tr');
    expect(userRow.text()).toMatch('Mike');
    expect(userRow.text()).toMatch('Test');
    expect(userRow.text()).toMatch('mikeTest');
  });

  it('shows email', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const userRow = wrapper.find('tbody tr');
    expect(userRow.text()).toMatch('test@test.com');
  });
});
