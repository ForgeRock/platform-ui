/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import UserList from './UserList';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');
jest.mock('@forgerock/platform-shared/src/api/governance/PermissionsApi');

describe('UserList', () => {
  let wrapper;
  function mountComponent() {
    setupTestPinia({ user: { userId: 'testId' } }, false);
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
          accountStatus: 'active',
          _id: 'testId',
        },
      ],
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
          'accountStatus',
        ],
      },
    },
  }));

  PermissionsApi.getPermissionsForUser.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        { permissions: { createUser: true } },
      ],
    },
  }));

  PermissionsApi.getPermissionsForUsers.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          id: 'testId',
          permissions: { deleteUser: true },
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
    expect(userRow.text()).toMatch('Status');
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

  it('shows account status', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const userRow = wrapper.find('tbody tr');
    expect(userRow.text()).toMatch('Active');
  });

  it('hides the account status column if no privileges', async () => {
    PrivilegeApi.getResourceTypePrivilege.mockImplementationOnce(() => Promise.resolve({
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

    wrapper = mountComponent();
    await flushPromises();

    const userRow = wrapper.find('thead tr');
    expect(userRow.text()).toMatch('Name');
    expect(userRow.text()).toMatch('Email');
    expect(userRow.text()).not.toMatch('Status');
  });
});
