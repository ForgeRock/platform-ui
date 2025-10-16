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
import * as applicationImageResolver from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import i18n from '@/i18n';
import EntitlementsTab from './EntitlementsTab';

const { modalShow } = mockModal();
mockNotification();
mockValidation(['required']);

const mockEntitlementData = [
  {
    id: 'testEntitlement1',
    item: {
      objectType: 'directoryRole',
    },
    glossary: {},
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Global Administrator',
        },
      },
    },
    entitlement: {
      displayName: 'Global Administrator',
      _id: 'entitlement1',
    },
    application: {
      authoritative: false,
      changedFields: [
        '/uiConfig',
      ],
      connectorId: 'Target',
      description: 'Test',
      icon: '',
      id: 'testAppId',
      name: 'Target',
      objectTypes: [
        {
          name: '__GROUP__',
          accountAttribute: 'memberOf',
        },
        {
          name: 'User',
        },
        {
          name: 'servicePlan',
          accountAttribute: '__servicePlanIds__',
        },
        {
          name: 'directoryRole',
          accountAttribute: '__roles__',
        },
      ],
      templateName: 'azure.ad',
      templateVersion: '3.3',
    },
  },
  {
    id: 'testEntitlement2',
    item: {
      objectType: 'directoryRole',
    },
    glossary: {},
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Directory Readers',
        },
      },
    },
    entitlement: {
      displayName: 'Directory Readers',
      _id: 'entitlement2',
    },
    application: {
      authoritative: false,
      changedFields: [
        '/uiConfig',
      ],
      connectorId: 'Target',
      description: 'Test',
      icon: '',
      id: 'testAppId',
      name: 'Target',
      objectTypes: [
        {
          name: '__GROUP__',
          accountAttribute: 'memberOf',
        },
        {
          name: 'User',
        },
        {
          name: 'servicePlan',
          accountAttribute: '__servicePlanIds__',
        },
        {
          name: 'directoryRole',
          accountAttribute: '__roles__',
        },
      ],
      templateName: 'azure.ad',
      templateVersion: '3.3',
    },
  },
];

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));
RoleApi.getRoleDataById = jest.fn().mockImplementation(() => Promise.resolve({
  result: mockEntitlementData,
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
applicationImageResolver.onImageError = jest.fn().mockImplementation(() => {});

describe('EntitlementsTab', () => {
  let wrapper;
  const app = createAppContainer();
  function mountComponent(user = { userId: '1234' }, props = {}) {
    setupTestPinia({ user });
    wrapper = mount(EntitlementsTab, {
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
        items: [{
          application: { name: 'App1', id: 'app1' },
          descriptor: {
            idx: {
              '/entitlement': { displayName: 'Entitlement One' },
            },
          },
          item: { objectType: 'directoryRole' },
        }, {
          application: { name: 'App2', id: 'app2' },
          descriptor: {
            idx: {
              '/entitlement': { displayName: 'Entitlement Two' },
            },
          },
          item: { objectType: 'directoryRole' },
        }],
        count: 2,
        isActive: 'true',
        isLoading: false,
        loadData: jest.fn(),
        readOnly: false,
        request: {},
        roleId: 'testRoleId',
        roleSchema: [],
        roleStatus: 'active',
        createRolePermission: false,
        isTesting: true,
        ...props,
      },
    });
    return wrapper;
  }

  it('displays a button to add entitlements', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const addEntitlementsBtn = wrapper.find('button.btn-primary');
    expect(addEntitlementsBtn.exists()).toBe(true);
  });

  it('hides the button to add entitlements when readOnly is true', async () => {
    wrapper = mountComponent({}, { readOnly: true, isTesting: false });
    await flushPromises();
    const addEntitlementsBtn = wrapper.find('button.btn-primary');
    expect(addEntitlementsBtn.exists()).toBe(false);
  });

  it('shows the modal to add entitlements when the button is clicked', async () => {
    wrapper = mountComponent();
    await flushPromises();
    wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    const modal = wrapper.find('#addEntitlementsModal');
    expect(modalShow).toHaveBeenCalledWith('addEntitlementsModal');
    expect(modal.exists()).toBe(true);
  });

  it('displays each entitlement in a table row', async () => {
    wrapper = mountComponent({}, { items: mockEntitlementData });
    await flushPromises();
    await wrapper.vm.$nextTick();
    const table = wrapper.find('table tbody');
    const rows = wrapper.findAll('table tbody tr');
    expect(table.exists()).toBe(true);
    expect(rows.length).toBe(2);
    expect(rows[0].text()).toContain('Global Administrator');
    expect(rows[1].text()).toContain('Directory Readers');
  });
});
