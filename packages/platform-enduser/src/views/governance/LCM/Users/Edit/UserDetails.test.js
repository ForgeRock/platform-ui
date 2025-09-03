/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import UserDetails from './UserDetails';
import i18n from '@/i18n';

const { routerPush } = mockRouter({ params: { userId: 'testId' } });

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/PermissionsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

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

PermissionsApi.getPermissionsForUser.mockImplementation(() => Promise.resolve({
  data: {
    result: [
      { permissions: { modifyUser: true, viewUserAccess: true } },
    ],
  },
}));

RequestFormAssignmentsApi.getFormAssignmentByLcmOperation.mockImplementation(() => Promise.resolve({ data: { result: [] } }));

describe('UserDetails', () => {
  let wrapper;
  function mountComponent() {
    setupTestPinia(undefined, false);
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

  describe('user grants', () => {
    it('has a tab for each grant type if user has permisions', async () => {
      wrapper = mountComponent();
      await flushPromises();

      const accountGrants = wrapper.findAll('[role="tab"]')[1];
      expect(accountGrants.exists()).toBe(true);
      expect(accountGrants.text()).toContain('Accounts');

      const entitlementGrants = wrapper.findAll('[role="tab"]')[2];
      expect(entitlementGrants.exists()).toBe(true);
      expect(entitlementGrants.text()).toContain('Entitlements');

      const roleGrantsTab = wrapper.findAll('[role="tab"]')[3];
      expect(roleGrantsTab.exists()).toBe(true);
      expect(roleGrantsTab.text()).toContain('Roles');
    });

    it('hides grant type tabs is user has no permissions', async () => {
      PermissionsApi.getPermissionsForUser.mockImplementationOnce(() => Promise.resolve({
        data: {
          result: [
            { permissions: { modifyUser: true } },
          ],
        },
      }));
      wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.findAll('[role="tab"]').length).toBe(1);
    });

    it('shows account grants, if present', async () => {
      CommonsApi.getUserGrants.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              application: { name: 'testApp' },
            },
          ],
          totalCount: 1,
        },
      }));
      wrapper = mountComponent();
      await flushPromises();

      wrapper.findAll('[role="tab"]')[1].trigger('click');
      await flushPromises();

      const tableHeaders = wrapper.findAll('[role="columnheader"]');
      expect(tableHeaders[0].text()).toContain('Name');
      expect(tableHeaders[1].text()).toContain('Status');
      expect(wrapper.findAll('[role="cell"]')[0].text()).toContain('testApp');
    });

    it('add account navigates to catalog with the correct initial tab', async () => {
      CommonsApi.getUserGrants.mockImplementation(() => Promise.resolve({
        data: {
          result: [],
          totalCount: 0,
        },
      }));
      wrapper = mountComponent();
      await flushPromises();

      wrapper.findAll('[role="tab"]')[1].trigger('click');
      await flushPromises();

      const addButton = wrapper.find('.btn-primary');
      expect(addButton.exists()).toBe(true);
      expect(addButton.text()).toContain('Add Accounts');
      await addButton.trigger('click');
      expect(routerPush).toHaveBeenCalledWith({ name: 'AccessRequestNew', params: { catalogTab: 'application', returnPath: undefined } });
    });

    it('shows entitlement grants, if present', async () => {
      CommonsApi.getUserGrants.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              application: { name: 'testApp' },
              descriptor: {
                idx: {
                  '/entitlement': { displayName: 'testEntitlement' },
                  '/account': { displayName: 'testAccount' },
                },
              },
            },
          ],
          totalCount: 1,
        },
      }));
      wrapper = mountComponent();
      await flushPromises();

      wrapper.findAll('[role="tab"]')[2].trigger('click');
      await flushPromises();

      const tableHeaders = wrapper.findAll('[role="columnheader"]');
      expect(tableHeaders[0].text()).toContain('Application');
      expect(tableHeaders[1].text()).toContain('Name');
      expect(tableHeaders[2].text()).toContain('Account Name');
      expect(wrapper.findAll('[role="cell"]')[0].text()).toContain('testApp');
      expect(wrapper.findAll('[role="cell"]')[1].text()).toContain('testEntitlement');
      expect(wrapper.findAll('[role="cell"]')[2].text()).toContain('testAccount');
    });

    it('add entitlement navigates to catalog with the correct initial tab', async () => {
      CommonsApi.getUserGrants.mockImplementation(() => Promise.resolve({
        data: {
          result: [],
          totalCount: 0,
        },
      }));
      wrapper = mountComponent();
      await flushPromises();

      wrapper.findAll('[role="tab"]')[2].trigger('click');
      await flushPromises();

      const addButton = wrapper.find('.btn-primary');
      expect(addButton.exists()).toBe(true);
      expect(addButton.text()).toContain('Add Entitlements');
      await addButton.trigger('click');
      expect(routerPush).toHaveBeenCalledWith({ name: 'AccessRequestNew', params: { catalogTab: 'entitlement', returnPath: undefined } });
    });

    it('shows role grants, if present', async () => {
      CommonsApi.getUserGrants.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              role: { name: 'testRole' },
              relationship: { conditional: false },
              application: { name: 'testApp', templateName: 'testTemplate', templateVersion: '1_0-web' },
            },
          ],
          totalCount: 1,
        },
      }));
      wrapper = mountComponent();
      await flushPromises();

      wrapper.findAll('[role="tab"]')[3].trigger('click');
      await flushPromises();

      const tableHeaders = wrapper.findAll('[role="columnheader"]');
      expect(tableHeaders[0].text()).toContain('Name');
      expect(tableHeaders[1].text()).toContain('Time Constraint');
      expect(tableHeaders[2].text()).toContain('Assignment');
      expect(wrapper.findAll('[role="cell"]')[0].text()).toContain('testRole');
      expect(wrapper.findAll('[role="cell"]')[1].text()).toContain('--');
    });

    it('add role naviagtes to catalog with the correct initial tab', async () => {
      CommonsApi.getUserGrants.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              role: { name: 'testRole' },
              relationship: { conditional: false },
              application: { name: 'testApp', templateName: 'testTemplate', templateVersion: '1_0-web' },
            },
          ],
          totalCount: 1,
        },
      }));
      wrapper = mountComponent();
      await flushPromises();

      wrapper.findAll('[role="tab"]')[3].trigger('click');
      await flushPromises();

      const addButton = wrapper.find('.btn-primary');
      expect(addButton.exists()).toBe(true);
      expect(addButton.text()).toContain('Add Roles');
      await addButton.trigger('click');
      expect(routerPush).toHaveBeenCalledWith({ name: 'AccessRequestNew', params: { catalogTab: 'role', returnPath: undefined } });
    });
  });
});
