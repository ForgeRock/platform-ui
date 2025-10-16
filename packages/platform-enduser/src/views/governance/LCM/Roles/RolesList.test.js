/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import RolesList from './RolesList';
import i18n from '@/i18n';

const rolesMock = [
  {
    role: {
      description: 'Test role 1',
      id: 'roleId1',
      name: 'Test Role 1',
      justifications: [],
      entitlements: [
        'entitlementId1',
        'entitlementId2',
        'entitlementId3',
      ],
    },
    permissions: {
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  },
  {
    role: {
      id: 'roleId2',
      name: 'Test Role 2',
      roleOwner: 'managed/user/001',
      justifications: [],
    },
    glossary: {
      idx: {
        '/role': {
          roleOwner: 'managed/user/001',
        },
      },
    },
    permissions: {
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  },
  {
    role: {
      applications: [
        {
          _ref: 'managed/alpha_application/001',
          _refResourceCollection: 'managed/alpha_application',
        },
      ],
      description: 'Test Role 3',
      id: 'roleId3',
      name: 'Test Role 3',
      justifications: [],
    },
    permissions: {
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  },
];

PermissionsApi.getPrivileges = jest.fn().mockResolvedValue(({
  data: {
    permissions: [
      'createRole',
      'modifyRole',
      'publishRole',
      'deleteRole',
    ],
  },
}));
RoleApi.getRoleList = jest.fn().mockResolvedValue({
  data: {
    totalHits: 3,
    result: rolesMock,
  },
});

describe('RolesList', () => {
  let wrapper;
  const app = createAppContainer();
  function mountComponent(user = { userId: '1234' }, props = {}) {
    setupTestPinia({ user });
    wrapper = mount(RolesList, {
      attachTo: app,
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            userId: 'testUserId',
            state: {
              SharedStore: {
                uiConfig: {},
              },
            },
          },
        },
      },
      props: {
        roles: [],
        ...props,
      },
    });
    return wrapper;
  }

  it('displays each entitlement in a table row', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const table = wrapper.find('table tbody');
    const rows = wrapper.findAll('table tbody tr');
    expect(table.exists()).toBe(true);
    expect(rows.length).toBe(3);
    expect(rows[0].text()).toContain('Test Role 1');
    expect(rows[1].text()).toContain('Test Role 2');
    expect(rows[2].text()).toContain('Test Role 3');
  });

  it('displays a button to create a new role', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const newRoleBtn = wrapper.find('button.btn-primary');
    expect(newRoleBtn.exists()).toBe(true);
    expect(newRoleBtn.text()).toContain('New role');
  });

  it('routes user to the correct Role Details page when an existing role row is clicked', async () => {
    const { routerPush } = mockRouter();
    wrapper = mountComponent();
    await flushPromises();
    const rows = wrapper.findAll('table tbody tr');
    rows[0].trigger('click');
    await flushPromises();
    expect(routerPush).toHaveBeenCalledWith({
      name: 'RoleDetails',
      params: {
        roleId: 'roleId1',
        roleStatus: 'active',
      },
    });
  });

  it('routes user to the correct Role Details page when the "new role" button is clicked', async () => {
    const { routerPush } = mockRouter();
    wrapper = mountComponent();
    await flushPromises();
    wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    expect(routerPush).toHaveBeenCalledWith({
      name: 'RoleDetails',
      params: {
        roleId: 'new',
        roleStatus: 'active',
      },
    });
  });

  it('hides the "new role" button if the user does not have createRole permission', async () => {
    wrapper = mountComponent();
    PermissionsApi.getPrivileges = jest.fn().mockResolvedValueOnce({
      data: {
        permissions: [
          'modifyRole',
          'publishRole',
          'deleteRole',
        ],
      },
    });
    await flushPromises();
    const newRoleBtn = wrapper.find('button.btn-primary');
    expect(newRoleBtn.exists()).toBe(false);
  });
});
