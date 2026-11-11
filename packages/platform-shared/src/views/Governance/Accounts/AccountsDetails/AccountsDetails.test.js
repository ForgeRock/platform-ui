/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { useBreadcrumbStore } from '@forgerock/platform-shared/src/stores/breadcrumb';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as resourceUtil from '@forgerock/platform-shared/src/utils/governance/resource';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import * as AccountsApi from '@/api/governance/AccountApi';
import AccountsDetails from './AccountsDetails';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

jest.spyOn(CommonsApi, 'getIgaAccessRequest').mockResolvedValue({ data: { requireRequestJustification: false } });

mockRouter({ params: { accountId: 'system/Target/User/102' } });

let wrapper;

const testAccount = {
  id: 'system/Target/User/102',
  application: {
    name: 'app name',
    templateName: 'templateName',
    icon: 'test',
  },
  keys: {
    accountId: 'account-456',
  },
  user: {
    id: '123',
    userName: 'jDoe',
    givenName: 'John',
    sn: 'Doe',
  },
  glossary: {
    idx: {
      '/account': {
        accountType: 'default',
      },
    },
  },
  descriptor: {
    idx: {
      '/account': {
        displayName: 'account name',
      },
    },
  },
  account: {
    username: 'account-user',
  },
};

function mountComponent(accountType, props = {}, isAdmin = false) {
  const account = cloneDeep(testAccount);
  if (accountType === 'orphan') {
    delete account.user;
  }
  if (accountType === 'disconnected') {
    // uncorrelated but still showing the entitlements tab (isCorrelated || isDisconnected)
    delete account.user;
    account.application.isDisconnected = true;
  }
  AccountsApi.getAccountById = jest.fn().mockReturnValue(Promise.resolve({
    data: account,
  }));
  AccountsApi.getAccountEntitlements = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [],
    },
  }));
  AccountsApi.getAccountGlossaryAttributesData = jest.fn().mockReturnValue(Promise.resolve({}));
  CommonsApi.getGlossarySchema = jest.fn().mockReturnValue(Promise.resolve({}));

  mockModal();
  setupTestPinia(isAdmin ? { user: { idmRoles: ['adminUser'], idmUIAdminRoles: ['adminUser'] } } : undefined);
  wrapper = mount(AccountsDetails, {
    global: {
      plugins: [Notifications],
      stubs: {
        // the shared edit modal fetches its own data and renders its own
        // success modal, which would shadow the delete-flow modal under test
        EditAccountModal: true,
      },
      mocks: {
        $t: (t) => t,
        $bvModal: { show: jest.fn(), hide: jest.fn() },
      },
    },
    props: { isTesting: true, ...props },
  });
}

describe('AccountsDetails', () => {
  afterEach(() => {
    jest.spyOn(CommonsApi, 'getIgaAccessRequest').mockResolvedValue({ data: { requireRequestJustification: false } });
  });

  describe('breadcrumb return route', () => {
    function mountWithQuery(query = {}) {
      mockRouter({ params: { accountId: 'system/Target/User/102' }, query });
      mountComponent(undefined, { isEndUser: false });
      return flushPromises();
    }

    it('returns the breadcrumb to the unmanaged application when entered from its Objects tab', async () => {
      await mountWithQuery({ originAppId: 'app-1', originAppName: 'My App' });

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects');
      expect(breadcrumbStore.returnRouteText).toBe('My App');
    });

    it('returns the breadcrumb to the originating side tab when one was set', async () => {
      await mountWithQuery({ originAppId: 'app-1', originAppName: 'My App', originObjectTab: 'accounts' });

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects/accounts');
      expect(breadcrumbStore.returnRouteText).toBe('My App');
    });

    it('falls back to the application label when no origin name is passed', async () => {
      await mountWithQuery({ originAppId: 'app-1' });

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects');
      expect(breadcrumbStore.returnRouteText).toBe('Application');
    });

    it('keeps the global accounts breadcrumb when there is no origin query', async () => {
      await mountWithQuery({});

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/accounts');
      expect(breadcrumbStore.returnRouteText).toBe('Accounts');
    });

    it('keeps the enduser breadcrumb even when origin query present', async () => {
      await mountWithQuery({ originAppId: 'app-1', originAppName: 'My App' });
      // remount as enduser to verify branch precedence
      mountComponent(undefined, { isEndUser: true });
      await flushPromises();

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/my-machine-accounts');
      expect(breadcrumbStore.returnRouteText).toBe('Machine Accounts');
    });
  });

  it('should retrieve the account on load', async () => {
    mountComponent();
    await flushPromises();

    const title = wrapper.find('h1.pb-1');
    const subtitle = wrapper.find('h1.h5');

    expect(title.text()).toBe(wrapper.vm.account.descriptor.idx['/account'].displayName);
    expect(subtitle.text()).toBe(wrapper.vm.account.application.name);
  });

  it('should display the tabs', async () => {
    mountComponent();
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(2);
    expect(tabs.map((tab) => tab.text())).not.toContain('governance.accounts.details.tabs.objectProperties');
  });

  it('shows the Account Properties content in the Details tab', async () => {
    mountComponent();
    await flushPromises();

    const objectProperties = wrapper.findComponent({ name: 'ObjectProperties' });
    expect(objectProperties.exists()).toBe(true);
    expect(objectProperties.props('objectProperties')).toEqual(testAccount.account);
    expect(objectProperties.props('schema')).toEqual({});
    expect(objectProperties.props('enableCollapse')).toBe(true);
    expect(objectProperties.props('isCollapsed')).toBe(false);

    await objectProperties.find('.section-header').trigger('click');
    await wrapper.vm.$nextTick();

    expect(objectProperties.props('isCollapsed')).toBe(true);
    expect(objectProperties.find('.collapse.show').exists()).toBe(false);
  });

  it('collapses the Account Details card when its header is clicked', async () => {
    mountComponent();
    await flushPromises();

    const detailsTab = wrapper.findComponent({ name: 'DetailsTab' });
    expect(detailsTab.props('enableCollapse')).toBe(true);
    expect(detailsTab.props('isCollapsed')).toBe(false);

    await detailsTab.find('.section-header').trigger('click');
    await wrapper.vm.$nextTick();

    expect(detailsTab.props('isCollapsed')).toBe(true);
    expect(detailsTab.find('.collapse.show').exists()).toBe(false);
  });

  it('defaults to Details when the removed Object Properties route is requested', async () => {
    mockRouter({ params: { accountId: testAccount.id, tab: 'objectProperties' } });
    mountComponent();
    await flushPromises();

    expect(wrapper.vm.tabIndex).toBe(0);
    expect(wrapper.find('.tabs').text()).not.toContain('governance.accounts.details.tabs.objectProperties');
  });

  it('shows the Activity tab for admin users', async () => {
    mountComponent(undefined, { isEndUser: false });
    await flushPromises();

    const tabs = wrapper.find('.tabs').findAll('li');
    const tabTitles = tabs.map((tab) => tab.text());
    expect(tabs.length).toBe(3);
    expect(tabTitles).toContain('governance.accounts.details.tabs.activity');
  });

  it('hides the Activity tab for end users', async () => {
    mountComponent();
    await flushPromises();

    const tabs = wrapper.find('.tabs').findAll('li');
    const tabTitles = tabs.map((tab) => tab.text());
    expect(tabTitles).not.toContain('governance.accounts.details.tabs.activity');
  });

  it('shows the Delete Account panel for admin users', async () => {
    mountComponent(undefined, { isEndUser: false }, true);
    await flushPromises();

    const deletePanel = wrapper.find('[data-testid="account-detail-delete"]');
    expect(deletePanel.exists()).toBe(true);
    expect(deletePanel.text()).toContain('deletePanel.deleteType');
    expect(deletePanel.text()).toContain('common.cannotBeUndone');
  });

  it('hides the Delete Account panel for end users', async () => {
    mountComponent();
    await flushPromises();

    expect(wrapper.find('[data-testid="account-detail-delete"]').exists()).toBe(false);
  });

  it('submits a deleteAccount request when the delete modal is confirmed', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
    mountComponent(undefined, { isEndUser: false }, true);
    await flushPromises();

    await wrapper.find('[data-testid="account-detail-delete"] button').trigger('click');
    await flushPromises();

    const deleteModal = wrapper.findComponent({ name: 'DeleteModal' });
    expect(deleteModal.exists()).toBe(true);
    deleteModal.vm.$emit('delete-item');
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('deleteAccount', {
      common: {
        context: { type: 'admin' },
      },
      account: {
        accountId: testAccount.keys.accountId,
        applicationId: testAccount.application.id,
      },
    });
    expect(wrapper.vm.requestId).toBe('request-1');
  });

  it('omits the admin context in the deleteAccount request for non-admin users', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
    mountComponent(undefined, { isEndUser: false }, false);
    await flushPromises();

    wrapper.vm.showDeleteConfirmModal();
    await flushPromises();

    const deleteModal = wrapper.findComponent({ name: 'DeleteModal' });
    expect(deleteModal.exists()).toBe(true);
    deleteModal.vm.$emit('delete-item');
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('deleteAccount', {
      account: {
        accountId: testAccount.keys.accountId,
        applicationId: testAccount.application.id,
      },
    });
  });

  it('shows the request confirmation modal with the created request id after deletion', async () => {
    const modalShow = jest.fn();
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-9' } });
    mountComponent(undefined, { isEndUser: false }, true);
    await flushPromises();

    wrapper.vm.bvModal.value.show = modalShow;
    await wrapper.find('[data-testid="account-detail-delete"] button').trigger('click');
    await flushPromises();
    wrapper.findComponent({ name: 'DeleteModal' }).vm.$emit('delete-item');
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalled();
    expect(wrapper.vm.requestId).toBe('request-9');
    expect(modalShow).toHaveBeenCalledWith('delete-account-success');
    const successModal = wrapper.findComponent({ name: 'RequestSubmitSuccessModal' });
    expect(successModal.exists()).toBe(true);
    expect(successModal.props('requestId')).toBe('request-9');
  });

  it('navigates back to the accounts list after the delete confirmation modal closes', async () => {
    const { routerPush } = mockRouter({ params: { accountId: testAccount.id } });
    jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
    mountComponent(undefined, { isEndUser: false }, true);
    await flushPromises();

    await wrapper.find('[data-testid="account-detail-delete"] button').trigger('click');
    await flushPromises();
    wrapper.findComponent({ name: 'DeleteModal' }).vm.$emit('delete-item');
    await flushPromises();

    const successModal = wrapper.findComponent({ name: 'RequestSubmitSuccessModal' });
    expect(successModal.props('routerPath')).toBe('Accounts');
    // closing the success modal is what navigates back to the list
    expect(routerPush).not.toHaveBeenCalled();
    // the navigation is bound to the inner BModal's hidden event
    successModal.findComponent({ name: 'BModal' }).vm.$emit('hidden');
    await flushPromises();
    expect(routerPush).toHaveBeenCalledWith({ name: 'Accounts' });
  });

  it('does not show the request confirmation modal when the deleteAccount request fails', async () => {
    const modalShow = jest.fn();
    jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockRejectedValue(new Error('fail'));
    mountComponent(undefined, { isEndUser: false }, true);
    await flushPromises();

    wrapper.vm.bvModal.value.show = modalShow;
    await wrapper.find('[data-testid="account-detail-delete"] button').trigger('click');
    await flushPromises();
    wrapper.findComponent({ name: 'DeleteModal' }).vm.$emit('delete-item');
    await flushPromises();

    expect(wrapper.vm.requestId).toBe('');
    expect(modalShow).not.toHaveBeenCalledWith('delete-account-success');
    expect(wrapper.vm.isDeleting).toBe(false);
  });

  it('shows an error and does not navigate when the deleteAccount request fails', async () => {
    jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockRejectedValue(new Error('fail'));
    mountComponent(undefined, { isEndUser: false }, true);
    await flushPromises();

    await wrapper.find('[data-testid="account-detail-delete"] button').trigger('click');
    await flushPromises();
    wrapper.findComponent({ name: 'DeleteModal' }).vm.$emit('delete-item');
    await flushPromises();

    expect(wrapper.vm.isDeleting).toBe(false);
  });

  it('should not display entitlement tab for non user account', async () => {
    mountComponent('orphan');
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(1);
  });

  async function activateEntitlementsTab() {
    const tabLink = wrapper.find('.tabs').findAll('li')[1].find('a');
    await tabLink.trigger('click');
    await flushPromises();
    return wrapper.findComponent(FrGovResourceTable);
  }

  it('calls submitCustomRequest with entitlementRemove on revoke-items emit', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ status: 'success' });
    mountComponent();
    await flushPromises();

    const itemsToRevoke = [{ assignmentId: 'assignment-1' }];
    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('revoke-items', { itemsToRevoke });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementRemove', {
      common: expect.objectContaining({
        entitlementId: 'assignment-1',
        userId: testAccount.user.id,
        accountId: testAccount.keys.accountId,
      }),
    });
  });

  it('calls submitCustomRequest with entitlementGrant on assign-resources emit', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('assign-resources', { entitlements: [{ entitlementId: 'a/b/entitlement-1' }, { entitlementId: 'a/b/entitlement-2' }], justification: '' });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.objectContaining({
        entitlementId: 'entitlement-1',
        userId: testAccount.user.id,
        accountId: testAccount.keys.accountId,
      }),
    });
  });

  it('calls submitCustomRequest with entitlementGrant on assign-resources emit with { entitlementId } objects', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('assign-resources', {
      entitlements: [
        { entitlementId: 'a/b/entitlement-1', assignmentId: 'assignment-1' },
        { entitlementId: 'a/b/entitlement-2', assignmentId: 'assignment-2' },
      ],
      justification: '',
    });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.objectContaining({
        entitlementId: 'entitlement-1',
        userId: testAccount.user.id,
        accountId: testAccount.keys.accountId,
      }),
    });
  });

  it('submits entitlementGrant without userId when the account has no correlated user', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent('disconnected');
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('assign-resources', { entitlements: [{ entitlementId: 'a/b/entitlement-1' }], justification: '' });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.objectContaining({
        entitlementId: 'entitlement-1',
        accountId: testAccount.keys.accountId,
      }),
    });
    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.not.objectContaining({ userId: expect.anything() }),
    });
  });

  it('includes justification in common when assign-resources payload has a non-empty justification', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('assign-resources', { entitlements: [{ entitlementId: 'a/b/entitlement-1' }], justification: 'business reason' });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.objectContaining({
        entitlementId: 'entitlement-1',
        userId: testAccount.user.id,
        justification: 'business reason',
      }),
    });
  });

  it('does not include justification in common when assign-resources payload justification is empty', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('assign-resources', { entitlements: [{ entitlementId: 'a/b/entitlement-1' }], justification: '' });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.not.objectContaining({ justification: expect.anything() }),
    });
  });

  it('does not include justification in common when assign-resources payload justification is whitespace only', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('assign-resources', { entitlements: [{ entitlementId: 'a/b/entitlement-1' }], justification: '   ' });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.not.objectContaining({ justification: expect.anything() }),
    });
  });

  it('passes requireRequestJustification true to FrGovResourceTable when API returns true', async () => {
    jest.spyOn(CommonsApi, 'getIgaAccessRequest').mockResolvedValue({ data: { requireRequestJustification: true } });
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    expect(govResourceTable.props('requireRequestJustification')).toBe(true);
  });

  it('passes requireRequestJustification false to FrGovResourceTable when API returns false', async () => {
    jest.spyOn(CommonsApi, 'getIgaAccessRequest').mockResolvedValue({ data: { requireRequestJustification: false } });
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    expect(govResourceTable.props('requireRequestJustification')).toBe(false);
  });

  it('calls getEntitlements on get-entitlements emit', async () => {
    const getEntitlementsSpy = jest.spyOn(resourceUtil, 'getEntitlements').mockResolvedValue([]);
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('get-entitlements', { searchValue: 'test', selectedApplicationId: 'app-1' });
    await flushPromises();

    expect(getEntitlementsSpy).toHaveBeenCalledWith(false, 'test', 'app-1', expect.stringContaining('_assignment'), true);
  });

  it('calls getEntitlements on get-entitlements emit even when the account has no correlated user', async () => {
    const getEntitlementsSpy = jest.spyOn(resourceUtil, 'getEntitlements').mockResolvedValue([]);
    mountComponent('disconnected');
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('get-entitlements', { searchValue: '', selectedApplicationId: 'app-1' });
    await flushPromises();

    expect(getEntitlementsSpy).toHaveBeenCalledWith(false, '', 'app-1', expect.stringContaining('_assignment'), true);
  });

  it('does not fetch schema when application.id and parseable objectType are absent', async () => {
    mountComponent();
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).not.toHaveBeenCalled();
  });

  it('fetches schema using keys.accountId when present', async () => {
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: { properties: { __NAME__: { displayName: 'Username' } } },
    });

    const account = cloneDeep(testAccount);
    account.keys = { accountId: 'system/Target/User/102' };
    account.application.id = 'app1';
    AccountsApi.getAccountById = jest.fn().mockResolvedValue({ data: account });
    AccountsApi.getAccountEntitlements = jest.fn().mockResolvedValue({ data: { result: [] } });
    AccountsApi.getAccountGlossaryAttributesData = jest.fn().mockResolvedValue({});
    CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({});
    setupTestPinia();
    wrapper = mount(AccountsDetails, {
      global: { plugins: [Notifications], mocks: { $t: (t) => t } },
    });
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledWith('app1', 'User');
    expect(wrapper.vm.accountSchema).toEqual({ __NAME__: 'Username' });
  });

  it('leaves accountSchema empty on schema fetch failure', async () => {
    ApplicationsApi.getObjectTypeSchema.mockRejectedValue(new Error('fail'));

    const account = cloneDeep(testAccount);
    account.keys = { accountId: 'system/Target/User/102' };
    account.application.id = 'app1';
    AccountsApi.getAccountById = jest.fn().mockResolvedValue({ data: account });
    AccountsApi.getAccountEntitlements = jest.fn().mockResolvedValue({ data: { result: [] } });
    AccountsApi.getAccountGlossaryAttributesData = jest.fn().mockResolvedValue({});
    CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({});
    setupTestPinia();
    wrapper = mount(AccountsDetails, {
      global: { plugins: [Notifications], mocks: { $t: (t) => t } },
    });
    await flushPromises();

    expect(wrapper.vm.accountSchema).toEqual({});
  });
});
