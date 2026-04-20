/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
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
  const testAccount = {
    id: 'system/Target/User/102',
    application: {
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
      guardrailId: ['123'],
      agentPrincipals: ['456', '789'],
      knowledgeBases: [],
      tools: [],
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
  return testAccount;
}

describe('DetailsTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  async function mountComponent(accountType, readOnly, additionalProps) {
    jest.spyOn(AccountApi, 'getAccountGlossaryAttributesData')
      .mockResolvedValue({ data: agentValues });

    jest.spyOn(CommonsApi, 'getGlossarySchema')
      .mockResolvedValue({ data: { '/iga/governance/account': testSchema } });

    jest.spyOn(ManagedResourceApi, 'getManagedResourceList')
      .mockResolvedValue({
        data: {
          result: [{
            id: '123', userName: 'jDoe', givenName: 'John', sn: 'Doe',
          }],
        },
      });

    const wrapper = mount(DetailsTab, {
      props: {
        agent: getAgent(),
        readOnly,
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
    it('should display an agent correctly', async () => {
      const wrapper = await mountComponent('default', false);
      await flushPromises();

      const cards = wrapper.findAll('.card');
      expect(cards.length).toBe(6);

      const ownerTitle = cards[1].find('.h5');
      expect(ownerTitle.text()).toBe('governance.agents.custodians');

      const ownerText = cards[1].find('h3');
      expect(ownerText.text()).toBe('common.userFullName');

      const button = cards[0].find('.btn-link');
      expect(button.exists()).toBe(false);
    });

    it('should not display actions on agent mode', async () => {
      const wrapper = await mountComponent('machine', true);
      await wrapper.vm.$nextTick();

      const cards = wrapper.findAll('.card');
      expect(cards.length).toBe(6);

      const button = cards[0].find('.btn-link');
      expect(button.exists()).toBe(false);
    });

    it('collapse works on cards', async () => {
      const wrapper = await mountComponent('default', false, {});
      const cards = wrapper.findAll('.card-body');
      const visibleCollapse = cards[2].find('.collapse.show');
      expect(visibleCollapse.exists()).toBe(true);

      const h1 = cards[2].find('h1');
      h1.trigger('click');
      await wrapper.vm.$nextTick();

      const visibleAfterCollapse = cards[2].find('.collapse.show');
      expect(visibleAfterCollapse.exists()).toBe(false);
    });

    it('agent entity details are populated correctly', async () => {
      const wrapper = await mountComponent('default', false, {});
      const cards = wrapper.findAll('.card-body');
      const visibleCollapse = cards[2].find('.collapse.show');
      expect(visibleCollapse.exists()).toBe(true);

      const identityProfilesCard = cards[5];
      const entityRows = identityProfilesCard.findAll('.entity-row');
      expect(entityRows.length).toBe(2);

      const knowledgeBasesCard = cards[4];
      expect(knowledgeBasesCard.text()).toContain('governance.agents.details.noAssociatedEntities');
    });
  });
});
