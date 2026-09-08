/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import store from '@/store';
import ApplicationObjectExplorer from './ApplicationObjectExplorer';

const mockRouterPush = jest.fn();
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('@/store', () => ({
  // Reactive so flag changes re-evaluate the explorer's visibleTabs computed
  state: jest.requireActual('vue').reactive({
    SharedStore: {
      governanceAgentsEnabled: true,
      governanceDevEnabled: false,
    },
  }),
}));

jest.mock('@forgerock/platform-shared/src/views/Governance/Accounts/Accounts', () => ({
  name: 'FrAccounts',
  render: () => null,
  props: ['isEmbedded', 'applicationIds', 'applicationName', 'objectTab', 'accountType'],
}));
jest.mock('@forgerock/platform-shared/src/views/Governance/Agents/AgentTable', () => ({
  name: 'FrAgentTable',
  render: () => null,
  props: ['isEmbedded', 'applicationIds', 'applicationName', 'objectTab'],
}));
jest.mock('@forgerock/platform-shared/src/components/governance/LCM/Entitlements/EntitlementList', () => ({
  name: 'FrEntitlementList',
  render: () => null,
  props: ['isEmbedded', 'applicationIds', 'applicationName', 'objectTab'],
}));
jest.mock('@forgerock/platform-shared/src/components/governance/LCM/Resources/ResourceList', () => ({
  name: 'FrResourceList',
  render: () => null,
  props: ['isEmbedded', 'applicationIds', 'applicationName', 'objectTab'],
}));

function setup(props = {}, storeState = {}) {
  store.state.SharedStore = { governanceAgentsEnabled: true, governanceDevEnabled: false, ...storeState };

  return mount(ApplicationObjectExplorer, {
    global: {
      mocks: { $t: (k) => k },
    },
    props: {
      applicationId: 'app-1',
      applicationName: 'My App',
      ...props,
    },
  });
}

describe('ApplicationObjectExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('@renders', () => {
    it('renders a side-nav entry per object type with nested account-type options', async () => {
      const wrapper = setup();
      await flushPromises();

      // Nested account-type options under the Accounts group
      const subItems = wrapper.findAll('.fr-menu-item-submenuitems .nav-link');
      expect(subItems.length).toBe(4);
      expect(subItems.map((s) => s.text())).toEqual([
        'governance.accounts.tabs.all',
        'governance.accounts.tabs.correlated',
        'governance.accounts.tabs.uncorrelated',
        'governance.accounts.tabs.machine',
      ]);
    });

    it('hides the Agents side tab when governanceAgentsEnabled is false', async () => {
      const wrapper = setup({}, { governanceAgentsEnabled: false });
      await flushPromises();

      const navText = wrapper.find('.object-explorer-nav').text();
      expect(navText).not.toContain('governance.agents.title');
      expect(navText).toContain('common.entitlements');
      expect(wrapper.find('.fr-menu-item-submenuitems .nav-link').exists()).toBe(true);
    });

    it('renders the active selection view with embedded application-scoped props', async () => {
      const wrapper = setup({ objectTab: 'entitlements' });
      await flushPromises();

      const entitlementList = wrapper.findComponent({ name: 'FrEntitlementList' });
      expect(entitlementList.exists()).toBe(true);
      expect(entitlementList.props('isEmbedded')).toBe(true);
      expect(entitlementList.props('applicationIds')).toEqual(['app-1']);
      expect(entitlementList.props('applicationName')).toBe('My App');
      // The hosted side-tab key rides along so detail views can return the breadcrumb here
      expect(entitlementList.props('objectTab')).toBe('entitlements');
    });

    it('passes the selected account type down to Accounts', async () => {
      const wrapper = setup({ objectTab: 'accounts', objectSubTab: 'machine' });
      await flushPromises();

      const accounts = wrapper.findComponent({ name: 'FrAccounts' });
      expect(accounts.exists()).toBe(true);
      expect(accounts.props('accountType')).toBe('machine');
    });

    it('defaults to the all account type when no sub tab is set', async () => {
      const wrapper = setup({ objectTab: 'accounts' });
      await flushPromises();

      const accounts = wrapper.findComponent({ name: 'FrAccounts' });
      expect(accounts.props('accountType')).toBe('all');
    });

    it('seeds the selected entry from the objectTab/objectSubTab props', async () => {
      const wrapper = setup({ objectTab: 'accounts', objectSubTab: 'uncorrelated' });
      await flushPromises();

      expect(wrapper.vm.selectedFlatIndex).toBe(2);
      expect(wrapper.findComponent({ name: 'FrAccounts' }).exists()).toBe(true);
    });

    it('ignores an unknown objectTab slug and defaults to the first entry', async () => {
      const wrapper = setup({ objectTab: 'nonexistent' });
      await flushPromises();

      expect(wrapper.vm.selectedFlatIndex).toBe(0);
      expect(wrapper.findComponent({ name: 'FrAccounts' }).exists()).toBe(true);
    });

    it('shows the dev-flagged Resources tab when governanceDevEnabled is true', async () => {
      const wrapper = setup({}, { governanceDevEnabled: true });
      await flushPromises();

      const navText = wrapper.find('.object-explorer-nav').text();
      expect(navText).toContain('governance.administer.resources.title');
      // 4 account types + Entitlements + Agents table + Resources
      expect(wrapper.vm.selections.length).toBe(7);
    });

    it('hides the dev-flagged Resources tab when governanceDevEnabled is false', async () => {
      const wrapper = setup({}, { governanceDevEnabled: false });
      await flushPromises();

      expect(wrapper.vm.selections.length).toBe(6);
      expect(wrapper.find('.object-explorer-nav').text()).not.toContain('governance.administer.resources.title');
    });

    it('renders the Agents side tab as the flat application-scoped agent table', async () => {
      const wrapper = setup({ objectTab: 'agents' });
      await flushPromises();

      expect(wrapper.findComponent({ name: 'FrAgentTable' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'FrAgents' }).exists()).toBe(false);
    });

    it('deep-links to a dev-flagged tab by slug', async () => {
      const wrapper = setup({ objectTab: 'resources' }, { governanceDevEnabled: true });
      await flushPromises();

      // 4 account types + Entitlements + Agents table = index 6 is Resources
      expect(wrapper.vm.selectedFlatIndex).toBe(6);
      expect(wrapper.findComponent({ name: 'FrResourceList' }).exists()).toBe(true);
    });
  });

  describe('@actions', () => {
    beforeEach(() => {
      mockRouterPush.mockClear();
    });

    it('pushes a router navigation when a nested account-type option is clicked', async () => {
      const wrapper = setup();
      await flushPromises();

      // Flat index 3 = Accounts > machine
      await wrapper.findAll('.fr-menu-item-submenuitems .nav-link')[3].trigger('click');
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'EditUnmanagedApplication',
        params: {
          applicationId: 'app-1',
          tab: 'objects',
          objectTab: 'accounts',
          objectSubTab: 'machine',
        },
      });
    });

    it('pushes a router navigation when a top-level side tab is clicked', async () => {
      const wrapper = setup();
      await flushPromises();

      // Flat index 4 = Entitlements (after the four account-type entries)
      await wrapper.findAll('.object-explorer-nav .nav-link')[4].trigger('click');
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'EditUnmanagedApplication',
        params: {
          applicationId: 'app-1',
          tab: 'objects',
          objectTab: 'entitlements',
        },
      });
    });

    it('re-syncs the selection when objectTab/objectSubTab change externally (browser Back/Forward)', async () => {
      const wrapper = setup({ objectTab: 'accounts', objectSubTab: 'uncorrelated' });
      await flushPromises();
      expect(wrapper.vm.selectedFlatIndex).toBe(2);

      // Simulates the router updating these props after a Back/Forward navigation
      await wrapper.setProps({ objectTab: 'entitlements', objectSubTab: '' });
      await flushPromises();
      expect(wrapper.vm.selectedFlatIndex).toBe(4);
      expect(wrapper.findComponent({ name: 'FrEntitlementList' }).exists()).toBe(true);
    });

    it('updates the rendered view when a side tab is clicked', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'FrAccounts' }).exists()).toBe(true);

      // Entitlements sits at flat index 4, after the four account-type entries
      await wrapper.findAll('.object-explorer-nav .nav-link')[4].trigger('click');
      await flushPromises();
      expect(wrapper.vm.selectedFlatIndex).toBe(4);
      expect(wrapper.findComponent({ name: 'FrEntitlementList' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'FrAccounts' }).exists()).toBe(false);
    });

    it('clamps the selection when visible tabs shrink below the current index', async () => {
      const wrapper = setup({ objectTab: 'agents' });
      await flushPromises();
      // Flat index 5 = Agents (4 account types + Entitlements)
      expect(wrapper.vm.selectedFlatIndex).toBe(5);

      // Simulate the agents flag turning off mid-session
      store.state.SharedStore.governanceAgentsEnabled = false;
      await nextTick();
      await flushPromises();
      expect(wrapper.vm.selectedFlatIndex).toBe(4);
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
