/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';
import GovResourceTable from './index';

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

const mockItems = [
  {
    item: {
      type: 'entitlementGrant',
    },
    user: {
      accountStatus: 'active',
    },
    account: {
      userPrincipalName: 'test1@forgerock.com',
    },
    application: {
      name: 'test',
      templateName: 'test',
    },
    relationship: {
      id: '1234',
      properties: {
        grantTypes: [{
          grantType: 'recon',
          id: '1234',
        }],
      },
    },
  },
];

describe('GovResourceTable', () => {
  CommonsApi.getGlossarySchema = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  CommonsApi.getUserGrants = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: mockItems,
      totalCount: 1,
    },
  }));
  async function mountComponent(overrideProps) {
    jest.clearAllMocks();
    setupTestPinia({ user: { userId: 'testId' } });
    const wrapper = mount(GovResourceTable, {
      global: {
        plugins: [i18n, Notifications],
        mocks: {
          $bvModal: {
            show: jest.fn(),
            hide: jest.fn(),
          },
        },
      },
      props: {
        allowSelect: true,
        defaultSort: 'application.name',
        grantType: 'account',
        resourceName: 'directReportDetail',
        fields: [
          {
            key: 'appName',
            label: '',
          },
          {
            key: 'entitlementName',
            label: '',
          },
          {
            key: 'accountName',
            label: '',
          },
          {
            key: 'assignment',
            label: '',
          },
          {
            key: 'actions',
            label: '',
          },
        ],
        ...overrideProps,
      },
    });
    await flushPromises();
    return wrapper;
  }

  it('should have a loading spinner then have a table', async () => {
    const wrapper = await mountComponent();
    const myAccessSpinner = wrapper.find('[role="status"]');
    expect(myAccessSpinner.exists()).toBeTruthy();
    wrapper.setProps({ items: mockItems });
    await flushPromises();
    const myAccessTable = findByTestId(wrapper, 'gov-resource-table');
    expect(myAccessTable.exists()).toBeTruthy();
  });

  it('should have an input to search my access review table', async () => {
    const wrapper = await mountComponent();
    const searchMyAccessReviewTable = findByTestId(wrapper, 'search-gov-resource-table');
    expect(searchMyAccessReviewTable.exists()).toBeTruthy();
  });

  it('shows the actions menu if passed in and account assignment is direct', async () => {
    const wrapper = await mountComponent();
    let actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeFalsy();
    let badge = findByTestId(wrapper, 'status-badge');
    expect(badge.exists()).toBeFalsy();

    // We set the resourceName to 'directReportDetails' to test that the actions
    // menu should be showing and the badge should be set to 'Direct'.
    await wrapper.setProps({ items: mockItems });
    actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeTruthy();
    badge = findByTestId(wrapper, 'status-badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe(wrapper.vm.directAssignment);
  });

  it('shows the actions menu if showViewDetails is true', async () => {
    const wrapper = await mountComponent({ showViewDetails: true, parentResourceName: 'role' });
    wrapper.setProps({
      grantType: 'entitlement',
      items: [
        {
          item: {
            type: '',
          },
          user: {
            accountStatus: 'active',
          },
          account: {
            userPrincipalName: 'test1@forgerock.com',
          },
          application: {
            name: 'test',
            templateName: 'test',
          },
        },
      ],
    });
    await flushPromises();
    const actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeTruthy();
  });

  it('does not have the actions menu if account assignment is not direct', async () => {
    const wrapper = await mountComponent();
    let actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeFalsy();
    let badge = findByTestId(wrapper, 'status-badge');
    expect(badge.exists()).toBeFalsy();

    // We set the relationship's grantType: 'role' to test that the actions
    // menu should now be hidden since it should only show if set to 'recon'
    // and the badge assignment set to 'Role-based'.
    await wrapper.setProps({
      items: [
        {
          item: {
            type: 'accountGrant',
          },
          user: {
            accountStatus: 'active',
          },
          account: {
            userPrincipalName: 'test1@forgerock.com',
          },
          application: {
            name: 'test',
            templateName: 'test',
          },
          relationship: {
            id: '4321',
            properties: {
              grantTypes: [{
                grantType: 'role',
                id: '4321',
              }],
            },
          },
        },
      ],
    });
    actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeFalsy();
    badge = findByTestId(wrapper, 'status-badge');
    expect(badge.text()).toBe(wrapper.vm.roleBasedAssignment);
  });

  it('should open revoke modal when revoke is clicked', async () => {
    const wrapper = await mountComponent({ showViewDetails: true, grantType: 'entitlement' });
    const revoke = jest.spyOn(wrapper.vm, 'showRevokeModal');
    await wrapper.setProps({ items: mockItems });

    const actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    await actionOptionsMenu.trigger('click');
    await actionOptionsMenu.find('li:nth-of-type(2) > a').trigger('click'); // Revoke menu item

    expect(revoke).toHaveBeenCalled();
  });

  it('should show floating bar when row is selected, and show revoke modal when revoke button is clicked', async () => {
    const wrapper = await mountComponent({ showViewDetails: true, grantType: 'entitlement' });
    const revoke = jest.spyOn(wrapper.vm, 'showRevokeModal');
    await wrapper.setProps({ items: mockItems });
    wrapper.findAll('[role="row"]')[1].trigger('click');
    wrapper.findAll('[role="cell"]')[0].find('[type="checkbox"]').trigger('click');
    await flushPromises();
    wrapper.find('.floating-action-bar').findAll('[type="button"]')[1].trigger('click');

    expect(revoke).toHaveBeenCalled();
  });

  it('clearing the search input resets the query params', async () => {
    const wrapper = await mountComponent();
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const searchMyAccessReviewTable = findComponentByTestId(wrapper, 'search-gov-resource-table');
    await searchMyAccessReviewTable.vm.$emit('input', 'test');
    await searchMyAccessReviewTable.vm.$emit('clear');

    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.paginationPage).toBe(1);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('can sort table by descending', async () => {
    const wrapper = await mountComponent();
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.sortChanged({ sortBy: 'appName', sortDesc: true });
    expect(wrapper.vm.sortDesc).toBe(true);
    expect(loadSpy).toBeCalled();
    expect(wrapper.emitted()['load-data'][1][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'desc', grantType: 'account',
    });
  });

  it('can sort table by ascending', async () => {
    const wrapper = await mountComponent();
    wrapper.vm.sortChanged({ sortBy: 'appName', sortDesc: false });
    expect(wrapper.emitted()['load-data'][1][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'accountName', sortDesc: false });
    expect(wrapper.emitted()['load-data'][2][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: 'descriptor.idx./account.displayName', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'entitlementName', sortDesc: false });
    expect(wrapper.emitted()['load-data'][3][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: 'descriptor.idx./entitlement.displayName', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'roleName', sortDesc: false });
    expect(wrapper.emitted()['load-data'][4][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: 'role.name', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'status', sortDesc: false });
    expect(wrapper.emitted()['load-data'][5][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: '', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'other', sortDesc: false });
    expect(wrapper.emitted()['load-data'][6][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: null, sortDir: 'asc', grantType: 'account',
    });
  });

  it('emits sortBy of \'name\' when parent resource is role', async () => {
    const wrapper = await mountComponent();
    wrapper.setProps({ parentResourceName: 'alpha_role' });
    await flushPromises();
    wrapper.vm.loadData();
    expect(wrapper.emitted()['load-data'][1][0]).toStrictEqual({
      pageNumber: 0, pageSize: 10, sortBy: 'name', sortDir: 'asc', grantType: 'account',
    });
  });

  it('displays row cell name when parent resource is role', async () => {
    const wrapper = await mountComponent();
    await wrapper.setProps({ items: mockItems });
    await flushPromises();
    const roleAccountNameCell = wrapper.findAll('h3').filter((item) => item.text().includes('test'));
    expect(roleAccountNameCell[0].exists()).toBe(true);
  });

  it('can set page size', async () => {
    const wrapper = await mountComponent();
    wrapper.vm.loadData({ paginationPageSize: 20 });

    expect(wrapper.vm.paginationPageSize).toBe(20);
    expect(wrapper.emitted()['load-data']).toBeTruthy();
  });

  it('can set page', async () => {
    const wrapper = await mountComponent();
    wrapper.vm.loadData({ paginationPage: 2 });

    expect(wrapper.vm.paginationPage).toBe(2);
    expect(wrapper.emitted()['load-data']).toBeTruthy();
  });

  describe('loadData()', () => {
    it('sets table items when data is successfully loaded', async () => {
      const wrapper = await mountComponent();
      wrapper.setProps({
        items: [
          {
            item: {
              type: 'roleMembership',
            },
            user: {
              accountStatus: 'active',
            },
            account: {
              userPrincipalName: 'test1@forgerock.com',
            },
            application: {
              name: 'test1',
              templateName: 'test1',
            },
          },
          {
            item: {
              type: 'roleMembership',
            },
            user: {
              accountStatus: 'active',
            },
            account: {
              userPrincipalName: 'test2@forgerock.com',
            },
            application: {
              name: 'test2',
              templateName: 'test2',
            },
          },
        ],
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.items[0].account.userPrincipalName).toBe('test1@forgerock.com');
      expect(wrapper.vm.items[1].account.userPrincipalName).toBe('test2@forgerock.com');
    });

    it('displays noData component when no my access are found', async () => {
      const wrapper = await mountComponent();
      wrapper.setProps({ items: [] });
      await flushPromises();
      expect(wrapper.vm.isNoResultsFirstLoad).toBe(true);
      const noData = findByTestId(wrapper, 'gov-resource-table-no-results-first-load');
      expect(noData.exists()).toBeTruthy();
    });
  });

  describe('method getResourceDisplayName should return correct displayName', () => {
    it('item with descriptor should return property displayName value', async () => {
      const wrapper = await mountComponent();
      const item = {
        descriptor: {
          idx: {
            '/account': {
              displayName: 'Account name',
            },
          },
        },
      };
      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBe('Account name');
    });

    it('item without displayName property should return undefined', async () => {
      const wrapper = await mountComponent();
      const item = {
        descriptor: {
          idx: {
            '/account': {},
          },
        },
      };
      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBeUndefined();
    });

    it('item without resource property should return undefined', async () => {
      const wrapper = await mountComponent();
      const item = {
        descriptor: {
          idx: {
            '/account': {
              displayName: 'Account name',
            },
          },
        },
      };
      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/entitlement');

      expect(resourceDisplayName).toBeUndefined();
    });

    it('item without idx property should return undefined', async () => {
      const wrapper = await mountComponent();
      const item = { descriptor: {} };
      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBeUndefined();
    });

    it('item without descriptor property should return undefined', async () => {
      const wrapper = await mountComponent();
      const item = {};
      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBeUndefined();
    });
  });
});
