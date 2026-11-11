/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises, DOMWrapper } from '@vue/test-utils';
import { BDropdownItem } from 'bootstrap-vue';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import Accounts from './Accounts';

const mockRouterPush = jest.fn();
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

CommonsApi.getIgaAccessRequest = jest.fn().mockResolvedValue({ data: {} });

const createData = (params = {}, totalCount = 100) => {
  const { pageNumber = 0, pageSize = 10 } = params;
  const searchQuery = '';
  const sampleData = [];
  for (let i = pageNumber * pageSize; i < (pageNumber * pageSize) + pageSize; i += 1) {
    sampleData.push(
      {
        id: `id-${i}`,
        keys: {
          accountId: `account-id-${i}`,
        },
        application: {
          id: `application-id-${i}`,
          name: `${searchQuery} application name ${i}`,
          templateName: 'templateName',
          icon: 'test',
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
              displayName: `${searchQuery} name ${i}`,
            },
          },
        },
      },
    );
  }
  return { data: { result: pageSize === 0 ? [] : sampleData, totalCount } };
};

describe('Accounts Unit', () => {
  function mountComponent({ admin = true } = {}) {
    mockModal();
    setupTestPinia({
      user: admin
        ? { idmRoles: ['adminUser'], idmUIAdminRoles: ['adminUser'] }
        : { idmRoles: [], idmUIAdminRoles: [] },
    });
    // #app is the teleport target of the row actions menu (ActionsMenu)
    const container = createAppContainer();
    const wrapper = mount(Accounts, {
      attachTo: container,
      global: {
        // Accounts.vue relies on the app's global BootstrapVue plugin for
        // BDropdownItem; register it so the custom row actions resolve
        components: { BDropdownItem },
        stubs: {
          ApplicationSearch: true,
        },
        mocks: {
          $t: (string, obj) => {
            switch (string) {
              case 'common.userFullName':
                return `${obj.givenName} ${obj.sn}`;
              default:
                return string;
            }
          },
        },
      },
    });
    return wrapper;
  }

  const standardAccountMocks = () => {
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
  };

  it('Accounts load on search call', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(AccountApi.getAccounts).toHaveBeenCalledTimes(4);

    expect(wrapper.vm.accounts.length).toBe(10);
    expect(wrapper.vm.accounts[0]).toEqual(expect.objectContaining(
      {
        application: {
          icon: 'test',
          id: 'application-id-0',
          name: ' application name 0',
          templateName: 'templateName',
        },
        id: 'id-0',
        displayName: ' name 0',
        type: 'Default',
        user: {
          id: '123',
          userName: 'jDoe',
          givenName: 'John',
          sn: 'Doe',
          fullName: 'John Doe',
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
              displayName: ' name 0',
            },
          },
        },
      },
    ));

    expect(wrapper.vm.counts).toEqual({
      all: 100,
      correlated: 10,
      uncorrelated: 5,
      machine: 3,
    });
    await flushPromises();
  });

  it('Accounts reload on page size change', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.pageSizeChange(20);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(5, {
      pagedResultsOffset: 0,
      pageSize: 20,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: '!(glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Accounts reload on tab change and results come back for expected tabs', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.tabActivated(1);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(5, {
      pagedResultsOffset: 0,
      pageSize: 10,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: 'user.id sw "" and !(glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Accounts reload on application change', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.updateApplications(['271fbe6672-780c-4226-af35-01a2546723c1']);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(5, {
      pagedResultsOffset: 0,
      pageSize: 10,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: '(application.id eq \'271fbe6672-780c-4226-af35-01a2546723c1\') and !(glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Click on row loads details page', async () => {
    const wrapper = mountComponent();
    standardAccountMocks();
    wrapper.vm.navigateToEdit = jest.fn();

    await flushPromises();

    const rows = wrapper.findAll('tr');
    const rowToClick = rows[4];
    rowToClick.trigger('click');

    expect(wrapper.vm.navigateToEdit).toHaveBeenCalledWith('id-3');
  });

  it('opens the New Account modal from the toolbar button', async () => {
    const wrapper = mountComponent();
    standardAccountMocks();
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
    const newAccountButton = wrapper.findAll('button').find((button) => button.text().includes('governance.accounts.newAccount.button'));
    await newAccountButton.trigger('click');

    expect(showSpy).toHaveBeenCalledWith('newAccountModal');
  });

  describe('Edit action', () => {
    it('opens the edit modal with the selected account', async () => {
      const wrapper = mountComponent();
      standardAccountMocks();
      await flushPromises();

      const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
      wrapper.vm.showEditAccountModal(wrapper.vm.accounts[0]);

      expect(wrapper.vm.itemToEdit).toEqual(expect.objectContaining({ id: 'id-0' }));
      expect(showSpy).toHaveBeenCalledWith('editAccountModal');
    });

    it('offers the edit action to admin users', async () => {
      const wrapper = mountComponent();
      standardAccountMocks();
      await flushPromises();

      // the row menu renders its items only once opened (they teleport into #app)
      await wrapper.find('[data-testid="actions-"] button').trigger('click');
      await flushPromises();

      // the edit item renders its icon ligature ("edit") before the label
      const bodyWrapper = new DOMWrapper(document.body);
      const editItems = bodyWrapper.findAll('[role="menuitem"]').filter((item) => item.text().includes('Edit'));
      expect(editItems).toHaveLength(1);
      // drop the teleported menu before the next test queries document.body
      wrapper.unmount();
    });

    it('does not offer the edit action to non-admin users, matching the delete option', async () => {
      const wrapper = mountComponent({ admin: false });
      standardAccountMocks();
      await flushPromises();

      await wrapper.find('[data-testid="actions-"] button').trigger('click');
      await flushPromises();

      const bodyWrapper = new DOMWrapper(document.body);
      const editItems = bodyWrapper.findAll('[role="menuitem"]').filter((item) => item.text().includes('Edit'));
      expect(editItems).toHaveLength(0);
      const actionsCell = wrapper.findComponent({ name: 'ActionsCell' });
      expect(actionsCell.props('deleteOption')).toBe(false);
      wrapper.unmount();
    });
  });

  describe('Delete action', () => {
    it('offers the delete action to admin users', async () => {
      const wrapper = mountComponent();
      standardAccountMocks();
      await flushPromises();

      const actionsCell = wrapper.findComponent({ name: 'ActionsCell' });
      expect(actionsCell.props('deleteOption')).toBe(true);
    });

    it('does not offer the delete action to non-admin users', async () => {
      // the detail page and New Account button are admin-gated; the row menu must match
      const wrapper = mountComponent({ admin: false });
      standardAccountMocks();
      await flushPromises();

      const actionsCell = wrapper.findComponent({ name: 'ActionsCell' });
      expect(actionsCell.props('deleteOption')).toBe(false);
    });

    it('opens confirmation modal with selected account', async () => {
      const wrapper = mountComponent();
      standardAccountMocks();
      await flushPromises();

      const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
      wrapper.vm.showDeleteConfirmModal(wrapper.vm.accounts[0]);

      expect(wrapper.vm.itemToDelete).toEqual(expect.objectContaining({ id: 'id-0' }));
      expect(showSpy).toHaveBeenCalledWith('deleteAccountModal');
    });

    it('hidden event clears selection without submitting request', async () => {
      const wrapper = mountComponent();
      standardAccountMocks();
      const submitSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest');
      await flushPromises();

      const hideSpy = jest.spyOn(wrapper.vm.bvModal.value, 'hide');
      wrapper.vm.showDeleteConfirmModal(wrapper.vm.accounts[0]);
      await wrapper.vm.$nextTick();

      wrapper.vm.hideDeleteConfirmModal();
      await wrapper.vm.$nextTick();

      expect(submitSpy).not.toHaveBeenCalled();
      expect(wrapper.vm.itemToDelete).toBeNull();
      expect(hideSpy).toHaveBeenCalledWith('deleteAccountModal');
    });

    it('delete confirmation submits deleteAccount request with account id', async () => {
      const wrapper = mountComponent();
      standardAccountMocks();
      const submitSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
      await flushPromises();

      const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
      const hideSpy = jest.spyOn(wrapper.vm.bvModal.value, 'hide');
      wrapper.vm.showDeleteConfirmModal(wrapper.vm.accounts[0]);
      await wrapper.vm.$nextTick();

      wrapper.vm.deleteAccountItem();
      await flushPromises();

      expect(submitSpy).toHaveBeenCalledWith('deleteAccount', {
        common: {
          context: { type: 'admin' },
        },
        account: {
          accountId: 'account-id-0',
          applicationId: 'application-id-0',
        },
      });
      expect(wrapper.vm.isDeleting).toBe(false);
      expect(wrapper.vm.itemToDelete).toBeNull();
      expect(wrapper.vm.deleteRequestId).toBe('request-1');
      expect(hideSpy).toHaveBeenCalledWith('deleteAccountModal');
      expect(showSpy).toHaveBeenCalledWith('delete-account-success');
    });

    it('delete confirmation omits the admin context for non-admin users', async () => {
      const wrapper = mountComponent({ admin: false });
      standardAccountMocks();
      const submitSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
      await flushPromises();

      wrapper.vm.showDeleteConfirmModal(wrapper.vm.accounts[0]);
      await wrapper.vm.$nextTick();

      wrapper.vm.deleteAccountItem();
      await flushPromises();

      expect(submitSpy).toHaveBeenCalledWith('deleteAccount', {
        account: {
          accountId: 'account-id-0',
          applicationId: 'application-id-0',
        },
      });
    });

    it('failed delete shows error and resets state', async () => {
      const wrapper = mountComponent();
      standardAccountMocks();
      const submitSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockRejectedValue(new Error('delete failed'));
      await flushPromises();

      wrapper.vm.showDeleteConfirmModal(wrapper.vm.accounts[0]);
      await wrapper.vm.$nextTick();

      await wrapper.vm.deleteAccountItem();
      await flushPromises();

      expect(submitSpy).toHaveBeenCalledWith('deleteAccount', {
        common: {
          context: { type: 'admin' },
        },
        account: {
          accountId: 'account-id-0',
          applicationId: 'application-id-0',
        },
      });
      expect(wrapper.vm.isDeleting).toBe(false);
      expect(wrapper.vm.itemToDelete).toBeNull();
    });
  });

  it('renders the account LCM modals for admins', () => {
    const wrapper = mountComponent();
    expect(wrapper.findComponent({ name: 'AddAccountModal' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'EditAccountModal' }).exists()).toBe(true);
  });
});
