/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { loadAgentViewConfig } from '@forgerock/platform-shared/src/utils/governance/agentView';
import RequestedItemCard from './RequestedItemCard';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils');
jest.mock('@forgerock/platform-shared/src/utils/applicationImageResolver', () => ({
  onImageError: jest.fn(),
  resolveImage: jest.fn((image) => `https://cdn.forgerock.com/platform/app-templates/images/${image}`),
}));
// buildAgentView resolves the platform label/icon through the agent config the
// card loads on mount; tests override the resolved config per-case
jest.mock('@forgerock/platform-shared/src/utils/governance/agentView', () => ({
  ...jest.requireActual('@forgerock/platform-shared/src/utils/governance/agentView'),
  loadAgentViewConfig: jest.fn().mockResolvedValue({
    agentMappings: {},
    agentTemplateSources: {},
    agentTemplateIcons: {},
    agentTemplateDisplayNames: {},
  }),
}));
// The card renders agent requests purely from stamped request content, but the
// mounted AgentModal destructures getAgentConfig at import time — a mock that
// strips AgentApi exports breaks it. getAgentConfig is rejected like the real
// axios mock does on un-mocked calls, keeping the modal on its static fallback
// config without console-error snapshot noise.
jest.mock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
  ...jest.requireActual('@forgerock/platform-shared/src/api/governance/AgentApi'),
  getAgentConfig: jest.fn().mockRejectedValue(new Error('config unavailable')),
  // the mounted modal resolves custodians when the grant lacks _displayData
  getAgentCustodians: jest.fn().mockResolvedValue({ data: { result: [], totalCount: 0 } }),
}));

// Mirrors the shape the backend stamps on agent requests (see a real
// modifyAgent record): agent fields top-level, display name under
// descriptor.idx./account.displayName, bare glossary
const agentAccountRecord = {
  id: 'M1QX7GSZWW',
  agentId: 'M1QX7GSZWW',
  agentName: 'ProcyonFixtureCollaborator',
  description: '',
  foundationModel: 'amazon.nova-lite-v1:0',
  state: 'ACTIVE',
  platform: 'awsbedrock',
};

const agentRequest = {
  requestType: 'modifyAgent',
  request: {
    agent: { agentId: 'app-1/Agent/M1QX7GSZWW', applicationId: 'app-1' },
  },
  account: agentAccountRecord,
  application: {
    id: 'app-1',
    name: 'AWS Bedrock Agents',
    templateName: 'aws.bedrock',
  },
  descriptor: {
    idx: {
      '/account': { displayName: 'ProcyonFixtureCollaborator' },
    },
  },
  glossary: {
    idx: {
      '/account': { accountType: 'agent' },
    },
  },
};

const entitlementRequest = {
  requestType: 'entitlementGrant',
  descriptor: {
    idx: {
      '/entitlement': { displayName: 'Customer Support - QA' },
      '/account': { displayName: 'jdoe@example.com' },
    },
  },
  application: {
    name: 'Salesforce',
    description: 'CRM platform',
  },
};

const roleRequest = {
  requestType: 'roleGrant',
  role: { name: 'Admin Role' },
  glossary: {},
  roleOwner: [],
  applications: [],
};

let modalShow;

const setup = (propsData = {}) => mount(RequestedItemCard, {
  global: {
    plugins: [i18n],
    stubs: {
      FrAccountModal: true,
      FrEntitlementModal: true,
      FrRoleModal: true,
      FrAgentModal: true,
    },
  },
  props: { ...propsData },
});

describe('RequestedItemCard', () => {
  beforeEach(() => {
    ({ modalShow } = mockModal());
    jest.clearAllMocks();
    AgentApi.getAgentConfig.mockRejectedValue(new Error('config unavailable'));
    AgentApi.getAgentCustodians.mockResolvedValue({ data: { result: [], totalCount: 0 } });
    loadAgentViewConfig.mockResolvedValue({
      agentMappings: {},
      agentTemplateSources: {},
      agentTemplateIcons: {},
      agentTemplateDisplayNames: {},
    });
  });

  describe('entitlement request type', () => {
    it('renders the entitlement information header', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('Entitlement Information');
    });

    it('displays the entitlement name', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('Customer Support - QA');
    });

    it('displays the application name', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('Salesforce');
    });

    it('shows blank indicator when entitlement name is missing', () => {
      const wrapper = setup({ request: { application: { name: 'App' } }, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('--');
    });

    it('opens entitlement modal when entitlement name is clicked', async () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      const buttons = wrapper.findAll('button');
      const entitlementBtn = buttons.find((b) => b.text().includes('Customer Support - QA'));
      await entitlementBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsEntitlementModal');
    });

    it('opens application modal when application name is clicked', async () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      const buttons = wrapper.findAll('button');
      const appBtn = buttons.find((b) => b.text().includes('Salesforce'));
      await appBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsApplicationModal');
    });

    it('displays the account name when present', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('jdoe@example.com');
    });

    it('opens account modal when account name is clicked', async () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      const buttons = wrapper.findAll('button');
      const accountBtn = buttons.find((b) => b.text().includes('jdoe@example.com'));
      await accountBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsAccountModal');
    });

    it('does not render account field when account name is absent', () => {
      const wrapper = setup({
        request: { application: { name: 'App' } },
        requestType: 'entitlementGrant',
      });
      expect(wrapper.text()).not.toContain('Account');
    });

    it('does not render the role modal stub', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.find('fr-role-modal-stub').exists()).toBe(false);
    });
  });

  describe('role request type', () => {
    it('renders the role information header', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      expect(wrapper.text()).toContain('Role Information');
    });

    it('displays the role name', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      expect(wrapper.text()).toContain('Admin Role');
    });

    it('opens role modal when role name is clicked', async () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      const roleBtn = wrapper.findAll('button').find((b) => b.text().includes('Admin Role'));
      await roleBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsRoleModal');
    });

    it('does not render entitlement or application content', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      expect(wrapper.text()).not.toContain('Entitlement');
      expect(wrapper.text()).not.toContain('Application');
    });

    it('shows blank indicator when role name is missing', () => {
      const wrapper = setup({ request: { role: {} }, requestType: 'roleGrant' });
      expect(wrapper.text()).toContain('--');
    });

    it('also works for roleRemove request type', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleRemove' });
      expect(wrapper.text()).toContain('Role Information');
      expect(wrapper.text()).toContain('Admin Role');
    });
  });

  describe('agent request type', () => {
    it('renders the agent information header', () => {
      const wrapper = setup({ request: agentRequest, requestType: 'modifyAgent' });
      expect(wrapper.text()).toContain('Agent Information');
    });

    it('displays the agent name from the stamped request content', () => {
      const wrapper = setup({ request: agentRequest, requestType: 'modifyAgent' });
      expect(wrapper.text()).toContain('ProcyonFixtureCollaborator');
    });

    it('makes no agent API calls on mount', () => {
      // request viewers may lack agent read permissions — everything renders
      // from the request record
      setup({ request: agentRequest, requestType: 'modifyAgent' });
      expect(AgentApi.getAgentCustodians).not.toHaveBeenCalled();
    });

    it('shows the blank indicator when the request carries no agent name at all', () => {
      const wrapper = setup({
        request: {
          ...agentRequest,
          account: {},
          descriptor: {},
          application: {},
        },
        requestType: 'deleteAgent',
      });
      expect(wrapper.text()).toContain('--');
    });

    it('renders the platform entry derived like the cert platform column', () => {
      const wrapper = setup({ request: agentRequest, requestType: 'modifyAgent' });
      const text = wrapper.text();
      // buildAgentView: templateName (aws.bedrock) wins over aiAgentSource; the
      // test env loads no agent config, so the label falls back to the raw id
      expect(text).toContain('aws.bedrock');
      expect(wrapper.find('img.size-24').exists()).toBe(false);
      // no template icon resolved — the generic agent icon renders instead
      expect(wrapper.find('.fr-icon').exists() || wrapper.text()).toContain('smart_toy');
    });

    it('renders the platform entry with the template icon when the config carries one', async () => {
      loadAgentViewConfig.mockResolvedValue({
        agentMappings: {},
        agentTemplateSources: {},
        agentTemplateIcons: { 'aws.bedrock': 'bedrock-icon.svg' },
        agentTemplateDisplayNames: { 'aws.bedrock': 'AWS Bedrock' },
      });
      const wrapper = setup({ request: agentRequest, requestType: 'modifyAgent' });
      await flushPromises();

      expect(wrapper.text()).toContain('AWS Bedrock');
      const icon = wrapper.find('img.size-24');
      expect(icon.exists()).toBe(true);
      expect(icon.attributes('alt')).toBe('AWS Bedrock');
    });

    it('opens the agent modal when the agent name is clicked', async () => {
      const wrapper = setup({ request: agentRequest, requestType: 'modifyAgent' });
      const agentBtn = wrapper.findAll('button').find((b) => b.text().includes('ProcyonFixtureCollaborator'));
      await agentBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsAgentModal');
    });

    it('renders the agent modal with the stamped fields adapted into the line-item grant shape', () => {
      const wrapper = setup({ request: agentRequest, requestType: 'createAgent' });
      const agentModal = wrapper.findComponent({ name: 'AgentModal' });
      expect(agentModal.exists()).toBe(true);
      // the modal reads account fields, display name, template and the agent id
      // through the grant — mirror of the cert line-item shape
      expect(agentModal.props('grant')).toEqual({
        account: agentAccountRecord,
        application: agentRequest.application,
        descriptor: agentRequest.descriptor,
        glossary: agentRequest.glossary,
        _displayData: {},
        keys: { accountId: 'app-1/Agent/M1QX7GSZWW' },
      });
      expect(agentModal.props('modalId')).toBe('requestDetailsAgentModal');
    });

    it('does not render the agent modal when the request carries no stamped account', () => {
      const wrapper = setup({
        request: { ...agentRequest, account: undefined },
        requestType: 'modifyAgent',
      });
      expect(wrapper.findComponent({ name: 'AgentModal' }).exists()).toBe(false);
    });

    it('does not render agent content for entitlement request types', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).not.toContain('Agent Information');
    });
  });
});
