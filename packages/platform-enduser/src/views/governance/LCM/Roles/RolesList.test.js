/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
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
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
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

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({
    bvModal: { value: { show: jest.fn(), hide: jest.fn() } },
  }),
}));

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

  it('displays an active and draft tab', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const tabs = wrapper.findAll('li.nav-item');
    expect(tabs.length).toBe(2);
    expect(tabs[0].text()).toContain('Active');
    expect(tabs[1].text()).toContain('Draft');
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

  it('submits deleteRole request with justification in common', async () => {
    AccessRequestApi.submitCustomRequest.mockImplementation(() => Promise.resolve({ data: { id: 'req-123' } }));
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.deleteRoleIds = ['roleId1'];
    await wrapper.vm.deleteRoles();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'deleteRole',
      expect.objectContaining({
        common: expect.objectContaining({ justification: 'LCM: Delete role' }),
        role: expect.objectContaining({ roleId: 'roleId1' }),
      }),
    );
  });

  describe('search results announcement', () => {
    it('passes no count to the announcer when there is no active search', async () => {
      wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBeNull();
    });

    it('announces the number of roles found after a search', async () => {
      wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.search('Test Role');
      await flushPromises();

      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBe(3);
    });

    it('re-announces when a new search returns the same result count', async () => {
      wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.search('Test Role');
      await flushPromises();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBe(3);

      // Same count (3), different search text — the count must pass through null at the start of the new query
      // so the live region's text changes and the screen reader re-announces.
      // Called without awaiting so the null state (set before the request resolves) can be observed.
      wrapper.vm.search('Test Role 2');
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBeNull();

      await flushPromises();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBe(3);
    });

    it('keeps the announcer silent while the search input is being typed into', async () => {
      // searchValue is v-model bound; the announcer must key off the committed search, not the live-typing value (which would announce stale counts
      // on every keystroke and be suppressed during active typing)
      wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.searchValue = 'Test';
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBeNull();
    });

    it('renders a single persistent announcer across tab switches', async () => {
      // Both tabs share one live region, mounted once outside the lazy tab panes
      AccessRequestApi.getUserRequests.mockResolvedValue({
        data: { totalCount: 2, result: [] },
      });

      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.findAllComponents({ name: 'SearchResultsAnnouncer' }).length).toBe(1);

      wrapper.vm.tabActivated(1);
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.roleStatus).toBe('draft');
      expect(wrapper.findAllComponents({ name: 'SearchResultsAnnouncer' }).length).toBe(1);
    });
  });
});
