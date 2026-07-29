/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { useBreadcrumbStore } from '@forgerock/platform-shared/src/stores/breadcrumb';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import AgentsDetails from './AgentsDetails';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({ bvModal: { value: { show: jest.fn(), hide: jest.fn() } } }),
}));

jest.spyOn(CommonsApi, 'getIgaAccessRequest').mockResolvedValue({ data: { requireRequestJustification: false } });

mockRouter({ params: { agentId: 'system/Target/User/102' } });

let wrapper;

const testAgent = {
  id: 'system/Target/User/102',
  application: {
    name: 'app name',
    templateName: 'aws.bedrock',
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
        accountType: 'agent',
      },
    },
  },
  account: {
    tools: ['tool-1', 'tool-2'],
    knowledgeBases: ['kb-1'],
    toolCredentialIds: ['cred-1', 'cred-2', 'cred-3'],
  },
  descriptor: {
    idx: {
      '/account': {
        displayName: 'agent name',
      },
    },
  },
};

function mountComponent(props = {}, agentOverrides = {}) {
  const agent = { ...cloneDeep(testAgent), ...cloneDeep(agentOverrides) };
  AgentApi.getAgentById = jest.fn().mockReturnValue(Promise.resolve({
    data: agent,
  }));
  AgentApi.getAgentConfig = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      templates: [{
        id: 'aws.bedrock',
        resources: [
          { type: 'tools', accountAttribute: 'tools' },
          { type: 'knowledge', accountAttribute: 'knowledgeBases' },
          { type: 'toolCredentials', accountAttribute: 'toolCredentialIds' },
        ],
      }],
      applicationProps: [],
    },
  }));
  AgentApi.getAgentGrants = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [],
      totalCount: 0,
    },
  }));
  AgentApi.getAgentGlossaryAttributesData = jest.fn().mockReturnValue(Promise.resolve({}));
  // DetailsTab always mounts CustodiansTab, whose loadPage fires on mount;
  // un-mocked it flaps console-error snapshots across adjacent tests.
  AgentApi.getAgentCustodians = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [], totalCount: 0 } }));
  // ResourceTab (Data & Tools / Security group tabs) calls getAgentResources on mount
  // for each of its resource types.
  AgentApi.getAgentResources = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [], totalCount: 0 } }));
  CommonsApi.getGlossarySchema = jest.fn().mockReturnValue(Promise.resolve({}));

  setupTestPinia();
  wrapper = mount(AgentsDetails, {
    global: {
      plugins: [Notifications],
      mocks: {
        $t: (t) => t,
        $bvModal: { show: jest.fn(), hide: jest.fn() },
      },
    },
    props,
  });
}

describe('AgentsDetails', () => {
  afterEach(() => {
    jest.spyOn(CommonsApi, 'getIgaAccessRequest').mockResolvedValue({ data: { requireRequestJustification: false } });
  });

  describe('breadcrumb return route', () => {
    function mountWithQuery(query = {}) {
      mockRouter({ params: { agentId: 'system/Target/User/102' }, query });
      mountComponent({ isEndUser: false });
      return flushPromises();
    }

    it('returns the breadcrumb to the unmanaged application when entered from its Objects tab', async () => {
      await mountWithQuery({ originAppId: 'app-1', originAppName: 'My App' });

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects');
      expect(breadcrumbStore.returnRouteText).toBe('My App');
    });

    it('returns the breadcrumb to the originating side tab when one was set', async () => {
      await mountWithQuery({ originAppId: 'app-1', originAppName: 'My App', originObjectTab: 'agents' });

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects/agents');
      expect(breadcrumbStore.returnRouteText).toBe('My App');
    });

    it('falls back to the application label when no origin name is passed', async () => {
      await mountWithQuery({ originAppId: 'app-1' });

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects');
      expect(breadcrumbStore.returnRouteText).toBe('Application');
    });

    it('keeps the global agents breadcrumb when there is no origin query', async () => {
      await mountWithQuery({});

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/agents');
      expect(breadcrumbStore.returnRouteText).toBe('Agents');
    });
  });

  it('should retrieve the agent on load', async () => {
    mountComponent();
    await flushPromises();

    const title = wrapper.find('h1');
    const subtitle = wrapper.find('p');

    expect(title.text()).toBe(wrapper.vm.agent.descriptor.idx['/account'].displayName);
    expect(subtitle.text()).toBe(wrapper.vm.agent.application.name);
  });

  it('should display all tabs', async () => {
    mountComponent({ isEndUser: false });
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    // Details, Access, Data & Tools, Security, Activity
    expect(tabs.length).toBe(5);
  });

  it('should not display the activity tab for end users', async () => {
    mountComponent({ isEndUser: true });
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    // Details, Access, Data & Tools, Security
    expect(tabs.length).toBe(4);
  });

  it('should display the group tab count badge from account attribute lengths', async () => {
    mountComponent({ isEndUser: false });
    await flushPromises();

    const tabs = wrapper.find('.tabs').findAll('li');

    // Data & Tools: tools (2) + knowledge (1) = 3; Security: toolCredentials (3).
    // Group labels resolve via the real shared i18n instance, not the template's $t mock.
    expect(tabs[2].text()).toContain('Data & Tools');
    expect(tabs[2].text()).toContain('3');
    expect(tabs[3].text()).toContain('Security');
    expect(tabs[3].text()).toContain('3');
  });

  it('should show a group tab without a count badge when its resource attributes are absent from the account', async () => {
    // Account carries no Security resources: toolCredentials, identity bindings,
    // service accounts and connections. The tab set still comes from the template.
    mountComponent(
      { isEndUser: false },
      { account: { tools: ['tool-1'], knowledgeBases: ['kb-1'] } },
    );
    await flushPromises();

    const tabs = wrapper.find('.tabs').findAll('li');

    // Details, Access, Data & Tools, Security, Activity
    expect(tabs.length).toBe(5);
    // Data & Tools keeps its badge (tools 1 + knowledge 1); Security shows none.
    expect(tabs[2].text()).toContain('Data & Tools');
    expect(tabs[2].text()).toContain('2');
    expect(tabs[3].text()).toContain('Security');
    expect(tabs[3].text()).not.toMatch(/\d/);
  });

  it('should derive tabs from the default template for a custom agent with no template match', async () => {
    // A custom agent falls back to the default template — its groups must
    // still render regardless of the account's attributes.
    mountComponent(
      { isEndUser: false },
      {
        application: { name: 'app name', templateName: 'custom.thing', icon: 'test' },
        account: {},
      },
    );
    await flushPromises();

    const tabs = wrapper.find('.tabs').findAll('li');

    // Details, Access, Data & Tools, Security, Activity
    expect(tabs.length).toBe(5);
    expect(tabs[2].text()).toContain('Data & Tools');
    expect(tabs[3].text()).toContain('Security');
  });

  it('should activate the group tab matching a legacy resource-type deep link', async () => {
    // query must be provided: the breadcrumb logic reads route.query whenever isEndUser is false
    mockRouter({ params: { agentId: 'system/Target/User/102', tab: 'toolCredentials' }, query: {} });
    mountComponent({ isEndUser: false });
    await flushPromises();

    // Legacy toolCredentials link maps to the Security group tab (index 3)
    expect(wrapper.vm.tabIndex).toBe(3);
  });

  async function activateAccessTab() {
    // Access tab is index 1 (Details=0, Access=1)
    const tabLink = wrapper.find('.tabs').findAll('li')[1].find('a');
    await tabLink.trigger('click');
    await flushPromises();
    // AccessTab renders vertical sub-tabs (Accounts, Entitlements, Roles) that are lazy,
    // so exactly one table is mounted at a time. Activate Entitlements (index 1).
    const accessTab = wrapper.findComponent({ name: 'AccessTab' });
    await accessTab.findAll('a.nav-link')[1].trigger('click');
    await flushPromises();
    return wrapper.findComponent(FrGovResourceTable);
  }

  it('calls submitCustomRequest with entitlementRemove on revoke-items emit', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ status: 'success' });
    mountComponent();
    await flushPromises();

    const itemsToRevoke = [{
      assignmentId: 'assignment-1',
      user: {
        id: testAgent.user.id,
      },
      keys: {
        accountId: testAgent.keys.accountId,
      },
    }];
    const govResourceTable = await activateAccessTab();
    govResourceTable.vm.$emit('revoke-items', { itemsToRevoke });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementRemove', {
      common: expect.objectContaining({
        entitlementId: 'assignment-1',
        userId: testAgent.user.id,
        accountId: testAgent.keys.accountId,
      }),
    });
  });

  it('calls submitCustomRequest with entitlementGrant on assign-resources emit', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent();
    await flushPromises();

    // Payload shape matches GovAssignResourceModal's submitAssignment emit
    const govResourceTable = await activateAccessTab();
    govResourceTable.vm.$emit('assign-resources', {
      entitlements: [
        { entitlementId: 'managed/alpha_assignment/entitlement-1' },
        { entitlementId: 'managed/alpha_assignment/entitlement-2' },
      ],
      accountId: null,
      justification: '',
    });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.objectContaining({
        entitlementId: 'entitlement-1',
        userId: testAgent.user.id,
        accountId: testAgent.keys.accountId,
      }),
    });
  });

  it('calls submitCustomRequest with roleGrant when roles are saved from the add roles modal', async () => {
    // Regression: the save handler read the agent's user id from keys.userId, a field
    // absent from the agent record, so the guard silently returned and no request fired.
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
    mountComponent();
    await flushPromises();

    // activateAccessTab lands on the Entitlements sub-tab; Roles is the next sub-tab (index 2)
    const govResourceTable = await activateAccessTab();
    const accessTab = wrapper.findComponent({ name: 'AccessTab' });
    await accessTab.findAll('a.nav-link')[2].trigger('click');
    await flushPromises();

    govResourceTable.vm.$emit('open-add-role');
    await flushPromises();

    // Select roles as the multiselect would, then invoke the save handler bound to the modal's save button
    accessTab.vm.selectedRoles = ['role-1', 'role-2'];
    await flushPromises();
    accessTab.vm.assignRoles();
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('roleGrant', {
      common: {
        userId: testAgent.user.id,
        roleId: 'role-1',
      },
    });
    expect(submitCustomRequestSpy).toHaveBeenCalledWith('roleGrant', {
      common: {
        userId: testAgent.user.id,
        roleId: 'role-2',
      },
    });
  });

  describe('add modal → success modal focus chain', () => {
    // GovResourceTable's add button emits its click event (added so AccessTab can
    // re-arm the success modal's return-focus target); these tests pin the chain.
    async function openRolesModalAndAssign() {
      mountComponent();
      await flushPromises();

      // Access tab is index 1 (Details=0, Access=1); Roles is sub-tab index 2
      const tabLink = wrapper.find('.tabs').findAll('li')[1].find('a');
      await tabLink.trigger('click');
      await flushPromises();

      const accessTab = wrapper.findComponent({ name: 'AccessTab' });
      await accessTab.findAll('a.nav-link')[2].trigger('click');
      await flushPromises();

      const govResourceTable = wrapper.findComponent(FrGovResourceTable);
      const triggerButton = document.createElement('button');
      govResourceTable.vm.$emit('open-add-role', { currentTarget: triggerButton });
      await flushPromises();

      const { bvModal } = useBvModal.mock.results[0].value;
      return { accessTab, triggerButton, bvModal };
    }

    it('opens the add-roles modal and re-arms the success modal return-focus to the page trigger', async () => {
      const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
      const { accessTab, triggerButton, bvModal } = await openRolesModalAndAssign();

      expect(bvModal.value.show).toHaveBeenCalledWith('addRolesModal');

      accessTab.vm.selectedRoles = ['role-1'];
      await flushPromises();
      accessTab.vm.assignRoles();
      await flushPromises();

      // The trigger element captured from the add button must be handed to the
      // success modal so focus returns to it, not into the closed add-roles modal.
      expect(submitCustomRequestSpy).toHaveBeenCalled();
      expect(bvModal.value.show).toHaveBeenLastCalledWith('successful-submit', triggerButton);
    });

    it('clears the stashed trigger after the chain so a later success modal has no stale target', async () => {
      jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ data: { id: 'request-1' } });
      const { accessTab, triggerButton, bvModal } = await openRolesModalAndAssign();

      accessTab.vm.selectedRoles = ['role-1'];
      await flushPromises();
      accessTab.vm.assignRoles();
      await flushPromises();

      // A subsequent non-chained success-modal show must not carry the old trigger.
      wrapper.findComponent({ name: 'AccessTab' }).vm.submittedRequestId = 'request-2';
      const { show } = bvModal.value;
      show.mockClear();
      wrapper.findComponent({ name: 'AccessTab' }).vm.revokeRole({ itemsToRevoke: [{ user: { id: testAgent.user.id }, role: { id: 'role-1' } }] });
      await flushPromises();

      expect(show).toHaveBeenCalledWith('successful-submit');
      expect(show.mock.calls[0]).toHaveLength(1);
      expect(triggerButton).toBeDefined();
    });
  });
});
