/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import DetailsTab from './DetailsTab';

mockRouter({ params: { accountId: 'system/Target/User/102' } });

const testSchema = [
  {
    id: '25124190-a499-47f6-9737-6c8529bd9acd',
    displayName: 'Account Type',
    name: 'accountType',
    description: 'The type of account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: false,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
  {
    id: '09c470af-abc5-4733-beaf-3d169b62a234',
    displayName: 'Actors',
    name: 'actors',
    description: 'Actors for the account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: true,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
];

const agentValues = {
  actors: ['managed/user/abc'],
  accountType: 'agent',
};

function getAgent() {
  return {
    id: 'system/Target/User/102',
    application: {
      id: 'app1',
      name: 'app name',
      templateName: 'aws.bedrock',
      icon: 'test',
    },
    user: {
      id: '123',
      userName: 'jDoe',
      givenName: 'John',
      sn: 'Doe',
    },
    account: {
      __NAME__: 'my-agent',
      guardrailId: ['123'],
    },
    glossary: {
      idx: {
        '/account': {
          accountType: 'agent',
          actors: ['managed/user/123'],
        },
      },
    },
    keys: {
      accountId: 'system/Target/User/102',
    },
    descriptor: {
      idx: {
        '/account': {
          displayName: 'account name',
        },
      },
    },
  };
}

describe('DetailsTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  async function mountComponent(readOnly = true, additionalProps = {}) {
    jest.spyOn(AgentApi, 'getAgentGlossaryAttributesData')
      .mockResolvedValue({ data: agentValues });

    jest.spyOn(CommonsApi, 'getGlossarySchema')
      .mockResolvedValue({ data: { '/iga/governance/account': testSchema } });

    const wrapper = mount(DetailsTab, {
      props: {
        agent: getAgent(),
        readOnly,
        isEndUser: false,
        ...additionalProps,
      },
      global: {
        mocks: {
          $t: (text) => text,
          $store: {
            state: {
              isFraas: true,
            },
          },
        },
      },
    });
    wrapper.vm.bvModal = { show: jest.fn(), hide: jest.fn() };

    await flushPromises();
    return wrapper;
  }

  describe('agent details display', () => {
    function findEditButton(wrapper) {
      return wrapper.findAll('button').filter((button) => button.text().includes('governance.agents.editAgent'));
    }

    it('shows edit button when not read-only', async () => {
      const wrapper = await mountComponent(false);

      expect(findEditButton(wrapper).length).toBe(1);
    });

    it('hides edit button in read-only mode', async () => {
      const wrapper = await mountComponent(true);

      expect(findEditButton(wrapper).length).toBe(0);
    });

    it('renders the account object properties card', async () => {
      const wrapper = await mountComponent(false);

      const card = wrapper.find('.card');
      expect(card.exists()).toBe(true);
    });

    it('falls back to the static schema when the config fetch errors', async () => {
      jest.spyOn(AgentApi, 'getAgentConfig').mockRejectedValue(new Error('fail'));
      const wrapper = await mountComponent(false);
      await flushPromises();

      // The static backup schema always drives the properties card labels.
      expect(wrapper.vm.accountSchema).toEqual({
        agentName: 'Agent Name',
        agentId: 'Agent ID',
        createdAt: 'Created On',
        updatedAt: 'Updated On',
        'provider.platform': 'Platform',
        status: 'Status',
        description: 'Description',
        'model.id': 'Foundation Model',
        locators: 'Locators',
        'provider.tenant': 'Tenant',
        disabled: 'Disabled',
      });
    });

    it('fetches glossary values on mount', async () => {
      await mountComponent(false);

      expect(AgentApi.getAgentGlossaryAttributesData).toHaveBeenCalledWith('system/Target/User/102');
      expect(CommonsApi.getGlossarySchema).toHaveBeenCalled();
    });

    it('renders the linked agent identity card when the agent has a user', async () => {
      const wrapper = await mountComponent(false);

      const card = wrapper.find('[data-testid="linked-agent-identity-card"]');
      expect(card.exists()).toBe(true);
      expect(card.text()).toContain('governance.agents.details.detailsTab.linkedAgentIdentity');
      expect(card.text()).toContain('common.userFullName');
      expect(card.text()).toContain('jDoe');
    });

    it('hides the linked agent identity card when the agent has no user', async () => {
      const agent = getAgent();
      delete agent.user;
      const wrapper = await mountComponent(true, { agent });

      const card = wrapper.find('[data-testid="linked-agent-identity-card"]');
      expect(card.exists()).toBe(false);
    });
  });

  describe('technical details disclosure', () => {
    it('toggles via a keyboard-operable button with aria-expanded state', async () => {
      const wrapper = await mountComponent(false);

      const toggle = wrapper.find('button[aria-controls="agent-technical-details"]');
      expect(toggle.exists()).toBe(true);

      // Collapsed by default; the controlled region is absent from the DOM.
      expect(toggle.attributes('aria-expanded')).toBe('false');

      await toggle.trigger('click');
      await flushPromises();
      expect(toggle.attributes('aria-expanded')).toBe('true');
      expect(wrapper.find('#agent-technical-details').exists()).toBe(true);

      await toggle.trigger('click');
      await flushPromises();
      expect(toggle.attributes('aria-expanded')).toBe('false');
    });
  });
});
