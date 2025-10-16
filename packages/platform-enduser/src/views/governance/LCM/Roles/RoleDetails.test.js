/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as applicationImageResolver from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import {
  getRoleByIdMock,
  getSchemaMock,
  getPrivilegesMock,
  getManagedResourceListMock,
  getEntitlementListMock,
} from './mock';
import i18n from '@/i18n';
import RoleDetails from './RoleDetails';

mockModal();
mockNotification();
mockValidation(['required']);
mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });

jest.spyOn(SchemaApi, 'getSchema').mockImplementation((obj) => getSchemaMock(obj));
jest.spyOn(RoleApi, 'getRoleDataById').mockImplementation((id, status, dataType, queryParams = {}, requestId) => getRoleByIdMock(id, status, dataType, queryParams, requestId));
PermissionsApi.getPrivileges = jest.fn().mockImplementation(() => getPrivilegesMock());
jest.spyOn(ManagedResourceApi, 'getManagedResourceList').mockImplementation((resource, queryParams = {}) => getManagedResourceListMock(resource, queryParams));
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
AccessRequestApi.requestAction = jest.fn().mockImplementation(() => Promise.resolve({
  data: {},
}));
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));
jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));
applicationImageResolver.onImageError = jest.fn().mockImplementation(() => {});
EntitlementApi.getApplicationList.mockImplementation(() => Promise.resolve({
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
ManagedResourceApi.getManagedResourceList.mockImplementation(() => getManagedResourceListMock());
EntitlementApi.getEntitlementSchema.mockImplementation(() => Promise.resolve({
  data: {
    properties: {
      testObjectProperty: {
        type: 'string',
        order: 2,
        displayName: 'test object property',
      },
      testObjectProperty2: {
        type: 'string',
        order: 3,
        displayName: 'test object property2',
        flags: ['NOT_CREATABLE'],
      },
    },
  },
}));
EntitlementApi.getEntitlementList.mockImplementation(() => getEntitlementListMock());

describe('RoleDetails', () => {
  let wrapper;
  const app = createAppContainer();
  function mountComponent(user = { userId: '1234' }, params = {}) {
    setupTestPinia({ user });
    wrapper = mount(RoleDetails, {
      attachTo: app,
      global: {
        plugins: [i18n],
        mocks: {
          route: {
            params: {
              roleId: 'testId',
              roleStatus: 'active',
              ...params,
            },
          },
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
    });
    return wrapper;
  }

  it('displays the role name as a header on the page', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const roleName = wrapper.find('h1');
    expect(roleName.text()).toBe('Test Role');
  });

  it('has tabs for the role details, entitlements, and members', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const roleTabs = wrapper.findAll('li.nav-item');
    expect(roleTabs.length).toBe(3);
    expect(roleTabs[0].text()).toContain('Details');
    expect(roleTabs[1].text()).toContain('Entitlements');
    expect(roleTabs[2].text()).toContain('Members');
  });

  it('displays a "Save" button for existing roles if the user has modifyRole permissions', async () => {
    wrapper = mountComponent(null, { roleId: 'new' });
    await flushPromises();
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > button');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toBe('Save');
  });

  it('hides save buttons for existing roles if the user does not have modifyRole permissions', async () => {
    wrapper = mountComponent();
    PermissionsApi.getPrivileges.mockImplementationOnce(() => Promise.resolve({
      data: {
        permissions: ['viewRole'],
      },
    }));
    await flushPromises();
    const saveDraftDiv = wrapper.find('div.d-flex.justify-content-end');
    const saveDraftBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    expect(saveDraftDiv.exists()).toBe(true);
    expect(saveDraftBtn.exists()).toBe(false);
    expect(saveBtn.exists()).toBe(false);
  });

  it('displays the save buttons for new roles if the user has createRole permissions', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    PermissionsApi.getPrivileges.mockImplementationOnce(() => Promise.resolve({
      data: {
        permissions: ['createRole'],
      },
    }));
    wrapper = mountComponent(null, { roleId: 'new' });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    const saveDraftBtn = saveBtns[0];
    const saveBtn = saveBtns[1];
    expect(saveDraftBtn.exists()).toBe(true);
    expect(saveDraftBtn.text()).toBe('Save as Draft');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toBe('Save');
  });

  it('hides save buttons for new roles if the user does not have createRole permissions', async () => {
    wrapper = mountComponent(null, { roleId: 'new' });
    PermissionsApi.getPrivileges.mockImplementationOnce(() => Promise.resolve({
      data: {
        permissions: ['modifyRole'],
      },
    }));
    await flushPromises();
    const saveDraftDiv = wrapper.find('div.d-flex.justify-content-end');
    const saveDraftBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    expect(saveDraftDiv.exists()).toBe(true);
    expect(saveDraftBtn.exists()).toBe(false);
    expect(saveBtn.exists()).toBe(false);
  });

  it('calls the createRole endpoint with the "save" action when saving the role as a draft', async () => {
    const mockPayload = {
      role: {
        glossary: {},
        object: {
          description: '',
          entitlements: [],
          justifications: [],
          addedRoleMembers: [],
          name: '',
        },
        status: 'active',
      },
    };
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    const saveDraftBtn = wrapper.find('div.d-flex.justify-content-end > button');
    expect(saveDraftBtn.exists()).toBe(true);
    expect(saveDraftBtn.text()).toBe('Save as Draft');
    saveDraftBtn.trigger('click');
    await flushPromises();
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'save', null, mockPayload);
  });

  it('calls the createRole endpoint with the "publish" action when saving the role', async () => {
    const mockPayload = {
      role: {
        glossary: {},
        object: {
          description: '',
          entitlements: [],
          justifications: [],
          addedRoleMembers: [],
          name: '',
        },
        status: 'active',
      },
    };
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    expect(saveBtns.length).toBe(2);
    expect(saveBtns[1].text()).toBe('Save');
    saveBtns[1].trigger('click');
    await flushPromises();
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'publish', null, mockPayload);
  });
});
