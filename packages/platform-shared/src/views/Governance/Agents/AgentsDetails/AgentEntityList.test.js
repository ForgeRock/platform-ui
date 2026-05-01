/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import AgentEntityList from './AgentEntityList';

const toolAgentProperty = {
  accountAttribute: 'toolIds',
  objectType: 'agentTool',
  nameProperty: '__NAME__',
  descriptionProperty: 'description',
};

const toolEntities = [
  {
    __NAME__: 'get-customer-data', description: 'Retrieves customer data', toolType: 'HTTP', platform: 'Salesforce',
  },
  {
    __NAME__: 'send-email', description: 'Sends email notifications', toolType: 'SMTP', platform: 'SendGrid',
  },
  {
    __NAME__: 'query-inventory', description: 'Queries inventory levels', toolType: 'REST', platform: 'SAP',
  },
];

const guardrailAgentProperty = {
  accountAttribute: 'guardrailId',
  objectType: 'agentGuardrail',
  nameProperty: 'guardrailName',
  descriptionProperty: 'guardrailDescription',
};

function mountComponent(props = {}) {
  return mount(AgentEntityList, {
    props: {
      agentProperty: toolAgentProperty,
      type: 'tools',
      icon: { icon: 'construction', color: 'purple' },
      entities: [],
      totalEntities: 0,
      isLoading: false,
      ...props,
    },
    global: {
      mocks: {
        $t: (text) => text,
      },
      stubs: {
        BModal: { template: '<div class="modal-stub"><slot /></div>' },
      },
    },
  });
}

describe('AgentEntityList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('empty state', () => {
    it('shows no associated entities message when entities is empty', () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('governance.agents.details.noAssociatedEntities');
    });

    it('shows spinner when loading', () => {
      const wrapper = mountComponent({ isLoading: true });
      expect(wrapper.find('.py-3').exists()).toBe(false);
      expect(wrapper.find('.entity-row').exists()).toBe(false);
    });
  });

  describe('entity display', () => {
    it('renders the correct number of entity rows', () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      const rows = wrapper.findAll('.entity-row');
      expect(rows.length).toBe(3);
    });

    it('displays entity name from nameProperty', () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      const rows = wrapper.findAll('.entity-row');
      expect(rows[0].text()).toContain('get-customer-data');
      expect(rows[1].text()).toContain('send-email');
    });

    it('displays entity description from descriptionProperty', () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      const rows = wrapper.findAll('.entity-row');
      expect(rows[0].text()).toContain('Retrieves customer data');
    });

    it('uses custom nameProperty when provided', () => {
      const guardrailEntities = [
        { guardrailName: 'Guardrail 1', guardrailDescription: 'Blocks harmful content' },
      ];
      const wrapper = mountComponent({
        entities: guardrailEntities,
        totalEntities: 1,
        agentProperty: guardrailAgentProperty,
        type: 'guardrails',
      });
      expect(wrapper.text()).toContain('Guardrail 1');
      expect(wrapper.text()).toContain('Blocks harmful content');
    });

    it('falls back to __NAME__ when nameProperty value is missing', () => {
      const entity = { __NAME__: 'fallback-name', description: 'desc' };
      const wrapper = mountComponent({ entities: [entity], totalEntities: 1 });
      expect(wrapper.text()).toContain('fallback-name');
    });
  });

  describe('entity modal', () => {
    it('does not show modal initially', () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      expect(wrapper.vm.selectedEntity).toBeNull();
    });

    it('opens modal when entity row is clicked', async () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      await wrapper.findAll('.entity-row')[0].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.selectedEntity).toEqual(toolEntities[0]);
    });

    it('modal displays all key value pairs from the entity', async () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      await wrapper.findAll('.entity-row')[0].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('__NAME__');
      expect(wrapper.text()).toContain('get-customer-data');
      expect(wrapper.text()).toContain('toolType');
      expect(wrapper.text()).toContain('HTTP');
    });

    it('closes modal when selectedEntity is set to null', async () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      await wrapper.findAll('.entity-row')[0].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.selectedEntity).toEqual(toolEntities[0]);

      wrapper.vm.selectedEntity = null;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.selectedEntity).toBeNull();
    });
  });

  describe('pagination', () => {
    it('does not show pagination when totalEntities is 10 or less', () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      expect(wrapper.find('.pagination').exists()).toBe(false);
    });

    it('shows pagination when totalEntities exceeds 10', () => {
      const entities = Array.from({ length: 10 }, (_, i) => ({ __NAME__: `tool-${i}`, description: `desc ${i}` }));
      const wrapper = mountComponent({ entities, totalEntities: 25 });
      expect(wrapper.find('.pagination').exists()).toBe(true);
    });

    it('emits pagination-change on page size change', async () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      wrapper.vm.pageSizeChange(20);
      await flushPromises();
      expect(wrapper.emitted('pagination-change')).toBeTruthy();
      expect(wrapper.emitted('pagination-change')[0][0]).toEqual({
        resource: 'tools',
        pageNumber: 0,
        pageSize: 20,
      });
    });

    it('emits pagination-change on page number change', async () => {
      const wrapper = mountComponent({ entities: toolEntities, totalEntities: 3 });
      wrapper.vm.pageNumberChange(2);
      await flushPromises();
      expect(wrapper.emitted('pagination-change')).toBeTruthy();
      expect(wrapper.emitted('pagination-change')[0][0]).toEqual({
        resource: 'tools',
        pageNumber: 1,
        pageSize: 10,
      });
    });
  });
});
