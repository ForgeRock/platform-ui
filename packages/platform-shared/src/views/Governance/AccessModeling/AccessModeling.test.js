/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as AccessModelingApi from '@forgerock/platform-shared/src/api/governance/AccessModelingApi';
import AccessModeling from './AccessModeling';
import i18n from '@/i18n';

const rolesMock = [
  {
    role: {
      description: 'Test role 1',
      id: 'roleId1',
      status: 'candidate',
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
      status: 'candidate',
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
      status: 'candidate',
      justifications: [],
    },
    permissions: {
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  },
];

AccessModelingApi.getRoleMetrics = jest.fn().mockResolvedValue({
  data: {},
});

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

describe('AccessModeling', () => {
  let wrapper;
  let routerPush;

  const app = createAppContainer();
  function mountComponent(props = {}) {
    routerPush = mockRouter().routerPush;
    wrapper = mount(AccessModeling, {
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

  it('queries role metrics on mount', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(AccessModelingApi.getRoleMetrics).toHaveBeenCalled();
  });

  it('displays each role in a table row', async () => {
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

  it('displays three cards with information on role metrics and role mining job', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const cards = wrapper.findAll('.card.access-card');
    expect(cards.length).toBe(3);
  });

  it('displays a button to launch the role mining job', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const runRoleMiningBtn = wrapper.find('button.btn-primary');
    expect(runRoleMiningBtn.exists()).toBe(true);
    expect(runRoleMiningBtn.text()).toContain('Run Role Mining Job');
  });

  it('navigates to access modeling role details page when clicking a table row', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll('table tbody tr');
    rows[0].trigger('click');
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith({
      name: 'AccessModelingDetails',
      params: {
        roleId: 'roleId1',
        status: 'candidate',
        tab: 'details',
      },
    });
  });
});
