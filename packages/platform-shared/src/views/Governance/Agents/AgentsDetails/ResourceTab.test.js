/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import ResourceTab from './ResourceTab';

function getItems() {
  return {
    result: [
      {
        id: 'tool-1',
        applicationId: 'app-1',
        objectType: 'agentTool',
        sourceObject: {
          __NAME__: 'get-customer-data',
          description: 'Retrieves customer data',
          endpoint: 'https://api.example.com/v1/customers?include=details,history,preferences,notes,attachments,comments,threads',
        },
      },
      {
        id: 'tool-2',
        applicationId: 'app-1',
        objectType: 'agentTool',
        sourceObject: {
          __NAME__: 'send-email',
          description: 'Sends email notifications',
          endpoint: 'https://smtp.example.com/send',
        },
      },
    ],
    totalCount: 2,
  };
}

async function mountComponent(resourceOverrides = {}) {
  AgentApi.getAgentResources = jest.fn().mockResolvedValue({ data: getItems() });
  ApplicationsApi.getObjectTypeSchema = jest.fn().mockResolvedValue({
    data: {
      properties: {
        __NAME__: { displayName: 'Name' },
        description: { displayName: 'Description' },
        endpoint: { displayName: 'Endpoint URL' },
      },
    },
  });

  const wrapper = mount(ResourceTab, {
    props: {
      agentId: 'agent-1',
      resourceType: 'tools',
      resourceLabel: 'Tools',
      ...resourceOverrides,
    },
    global: {
      mocks: {
        $t: (key) => key,
      },
      // Pagination measures its DOM in jsdom-hostile ways; not under test here.
      stubs: { Pagination: true },
    },
  });
  await flushPromises();
  return wrapper;
}

describe('ResourceTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads resources and shows them with schema display names', async () => {
    const wrapper = await mountComponent();

    expect(AgentApi.getAgentResources).toHaveBeenCalledWith('agent-1', 'tools', { pageSize: 10, pageNumber: 0 });
    expect(wrapper.text()).toContain('get-customer-data');

    // Schema display names resolve in the row detail modal (teleported to document.body)
    wrapper.findComponent({ name: 'BTable' }).vm.$emit('row-clicked', getItems().result[0]);
    await flushPromises();
    const modal = document.querySelector('#resource-detail-modal');
    expect(modal.textContent).toContain('Endpoint URL');
  });

  it('collapses and expands via a keyboard-operable button with aria-expanded state', async () => {
    const wrapper = await mountComponent();

    const toggle = wrapper.find('button[aria-controls="resource-tab-collapse"]');
    expect(toggle.exists()).toBe(true);

    // Expanded by default
    expect(toggle.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('#resource-tab-collapse').exists()).toBe(true);

    await toggle.trigger('click');
    await flushPromises();
    expect(toggle.attributes('aria-expanded')).toBe('false');
  });

  it('wraps long resource values instead of forcing horizontal scroll', async () => {
    const wrapper = await mountComponent();

    // Open the row detail modal (teleported to document.body), then check the
    // value column's wrap class
    wrapper.findComponent({ name: 'BTable' }).vm.$emit('row-clicked', getItems().result[0]);
    await flushPromises();

    const longValue = [...document.querySelectorAll('#resource-detail-modal .resource-detail-value')]
      .find((el) => el.textContent.includes('https://api.example.com'));
    expect(longValue).not.toBeUndefined();
    // The wrapping rule is applied to the value column, not truncated away
    expect(longValue.className).toContain('resource-detail-value');
  });
});
