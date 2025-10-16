/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import i18n from '@/i18n';
import MembersTab from './MembersTab';

const { modalShow } = mockModal();
mockNotification();
mockValidation(['required']);

RoleApi.getRoleDataById = jest.fn().mockImplementation(() => Promise.resolve({
  result: [
    {
      id: 'user001', userName: 'ariela@email.com', givenName: 'Ariela', sn: 'Stonuary',
    },
    {
      id: 'user002', userName: 'barth@email.com', givenName: 'Barth', sn: 'Vasnev',
    },
  ],
  totalCount: 2,
}));
EntitlementApi.getApplicationList = jest.fn().mockImplementation(() => Promise.resolve({
  data: {
    result: [
      {
        application: {
          name: 'TestApp',
          id: 'TestId',
          objectTypes: [
            {
              name: 'TestObjectType',
              accountAttribute: 'accountAttribute1',
            },
            {
              name: 'TestObjectType2',
            },
          ],
        },
      },
    ],
  },
}));
ManagedResourceApi.getManagedResourceList = jest.fn().mockImplementation(() => Promise.resolve([]));

const roleSchemaMock = [{
  description: 'Role Members',
  items: {
    resourceCollection: [
      {
        conditionalAssociation: true,
        label: 'User',
        notify: true,
        path: 'managed/alpha_user',
        query: {
          fields: [
            'userName',
            'givenName',
            'sn',
          ],
          queryFilter: 'true',
        },
      },
    ],
  },
  relationshipGrantTemporalConstraintsEnforced: true,
  returnByDefault: false,
  title: 'Role Members',
  type: 'array',
  viewable: true,
  propName: 'members',
}];

describe('MembersTab', () => {
  let wrapper;
  const app = createAppContainer();
  function mountComponent(user = { userId: '1234' }, props = {}) {
    setupTestPinia({ user });
    wrapper = mount(MembersTab, {
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
        items: [
          {
            id: 'user001', userName: 'ariela@email.com', givenName: 'Ariela', sn: 'Stonuary',
          },
          {
            id: 'user002', userName: 'barth@email.com', givenName: 'Barth', sn: 'Vasnev',
          },
        ],
        count: 0,
        isActive: 'true',
        isLoading: false,
        loadData: jest.fn(),
        readOnly: false,
        request: {},
        roleId: 'testRoleId',
        roleSchema: roleSchemaMock,
        roleStatus: 'active',
        createRolePermission: false,
        ...props,
      },
    });
    return wrapper;
  }

  it('displays a button to add members', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const addMembersBtn = wrapper.find('button.btn-primary');
    expect(addMembersBtn.exists()).toBe(true);
  });

  it('hides the button to add members when readOnly is true', async () => {
    wrapper = mountComponent({}, { readOnly: true });
    await flushPromises();
    const addMembersBtn = wrapper.find('button.btn-primary');
    expect(addMembersBtn.exists()).toBe(false);
  });

  it('shows the modal to add members when the button is clicked', async () => {
    wrapper = mountComponent({}, { isTesting: true });
    await flushPromises();
    wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();
    const modal = wrapper.find('#addMembersModal');
    expect(modalShow).toHaveBeenCalledWith('addMembersModal');
    expect(modal.exists()).toBe(true);
  });

  it('displays each member in a table row', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const table = wrapper.find('table tbody');
    const rows = wrapper.findAll('table tbody tr');
    expect(table.exists()).toBe(true);
    expect(rows.length).toBe(2);
    expect(rows[0].text()).toContain('ariela@email.comArielaStonuary');
    expect(rows[1].text()).toContain('barth@email.comBarthVasnev');
  });
});
