/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as UseAgentConfig from '@forgerock/platform-shared/src/views/Governance/Agents/utils/useAgentConfig';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import AgentList from './AgentList';

const mockRouterPush = jest.fn();
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

const sampleAgent = (id, templateName = 'aws.bedrock') => ({
  id,
  application: {
    name: `application ${id}`,
    templateName,
    icon: 'test',
  },
  account: { description: 'agent description' },
  glossary: {
    idx: {
      '/account': { accountType: 'agent' },
    },
  },
  descriptor: {
    idx: {
      '/account': { displayName: `agent ${id}` },
    },
  },
});

// Tab order from buildTabItems: all, one template tab, custom, then the three
// chart-count queries appended on first load (recently discovered, no custodians, unreviewed).
function mockGetAgentsForInitialLoad(totalCount = 5) {
  AgentApi.getAgents = jest.fn()
    .mockResolvedValueOnce({ data: { result: [sampleAgent('id-0')], totalCount } })
    .mockResolvedValueOnce({ data: { result: [], totalCount: 0 } })
    .mockResolvedValueOnce({ data: { result: [], totalCount: 0 } })
    .mockResolvedValueOnce({ data: { result: [], totalCount: 1 } })
    .mockResolvedValueOnce({ data: { result: [], totalCount: 0 } })
    .mockResolvedValueOnce({ data: { result: [], totalCount: 2 } });
}

describe('AgentList Unit', () => {
  function mountComponent(storeOverrides = {}) {
    CommonsApi.getIgaUiConfig = jest.fn().mockImplementation(() => Promise.resolve({ data: { agents: { userProperty: 'custom_iga_identity_type' } } }));
    CommonsApi.getResource = jest.fn().mockImplementation(() => Promise.resolve({ data: { result: [], totalCount: 0 } }));
    ConfigApi.getConfig = jest.fn().mockImplementation(() => Promise.resolve({ data: { objects: [] } }));
    // Reject like the real axios mock does on un-mocked calls, so the component
    // keeps its static fallback templates without console-error snapshot noise.
    AgentApi.getAgentConfig = jest.fn().mockRejectedValue(new Error('config unavailable'));

    const wrapper = mount(AgentList, {
      global: {
        plugins: [createStore({
          state: { SharedStore: { governanceDevEnabled: true, ...storeOverrides.SharedStore } },
        })],
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

  beforeEach(() => {
    setupTestPinia({ user: { userId: 'testId' } });
    PermissionsApi.getPrivileges = jest.fn().mockResolvedValue({ data: { permissions: ['createAgent', 'deleteAgent'] } });
    UseAgentConfig.useAgentConfig = jest.fn().mockReturnValue({
      agentTemplates: ref(['aws.bedrock']),
      agentApplicationProps: ref({}),
      agentMappings: ref({}),
      agentTemplateSources: ref({}),
      agentTemplateIcons: ref({}),
      agentSources: ref(null),
      loadConfig: jest.fn().mockResolvedValue({
        agentTemplates: ['aws.bedrock'],
        agentTemplateSources: {},
        agentTemplateDisplayNames: {},
      }),
    });
  });

  it('loads tabs, chart counts and agents on mount', async () => {
    const wrapper = mountComponent();
    mockGetAgentsForInitialLoad();
    await flushPromises();

    expect(wrapper.vm.tabItems.map((tab) => tab.key)).toEqual(['all', 'aws.bedrock', 'custom']);
    expect(wrapper.vm.agents.length).toBe(1);
    expect(wrapper.vm.agents[0]).toEqual(expect.objectContaining({
      id: 'id-0',
      displayName: 'agent id-0',
      description: 'agent description',
    }));
    expect(wrapper.vm.counts).toEqual(expect.objectContaining({
      all: 5,
      'aws.bedrock': 0,
      custom: 0,
      recentlyDiscovered: 1,
      noCustodians: 0,
      unreviewed: 2,
    }));
  });

  it('template tab matches by templateName or aiAgentSource (dual identifier)', async () => {
    const wrapper = mountComponent();
    mockGetAgentsForInitialLoad();
    await flushPromises();

    wrapper.vm.tabActivated(1);
    await flushPromises();

    expect(AgentApi.getAgents).toHaveBeenCalledWith(expect.objectContaining({
      queryFilter: '(application.templateName sw "aws.bedrock" or application.aiAgentSource eq "aws.bedrock")',
    }));
  });

  it('gates Add and Delete buttons on getPrivileges permissions', async () => {
    const wrapper = mountComponent();
    mockGetAgentsForInitialLoad();
    await flushPromises();

    expect(wrapper.vm.allowCreate).toBe(true);
    expect(wrapper.vm.allowDelete).toBe(true);
  });

  it('hides the Add and Delete actions when governance dev is disabled', async () => {
    // Agent create/delete are dev-only until the LCM write flows ship in a
    // full release; viewing stays available
    const wrapper = mountComponent({ SharedStore: { governanceDevEnabled: false } });
    mockGetAgentsForInitialLoad();
    await flushPromises();

    expect(wrapper.vm.allowCreate).toBe(true); // privileges are held…
    expect(wrapper.vm.allowDelete).toBe(true); // …but the flag hides both actions
    expect(wrapper.vm.governanceDevEnabled).toBe(false);
    expect(wrapper.text()).not.toContain('governance.administer.agents.newAgent');
  });

  it('keeps the table read-only when getPrivileges fails', async () => {
    PermissionsApi.getPrivileges = jest.fn().mockRejectedValue(new Error('forbidden'));
    const wrapper = mountComponent();
    mockGetAgentsForInitialLoad();
    await flushPromises();

    expect(wrapper.vm.allowCreate).toBe(false);
    expect(wrapper.vm.allowDelete).toBe(false);
  });

  it('navigates to the LCM agent details route on row click', async () => {
    const wrapper = mountComponent();
    mockGetAgentsForInitialLoad();
    await flushPromises();

    wrapper.vm.navigateToAgentDetails({ id: 'id-0' });

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'AdministerAgentDetails',
      params: { agentId: 'id-0', tab: 'details' },
    });
  });

  it('derives the application icon from the agent template config when the application has none', async () => {
    const agentWithoutIcon = sampleAgent('id-0');
    delete agentWithoutIcon.application.icon;
    UseAgentConfig.useAgentConfig = jest.fn().mockReturnValue({
      agentTemplates: ref(['aws.bedrock']),
      agentApplicationProps: ref({}),
      agentMappings: ref({}),
      agentTemplateSources: ref({}),
      agentTemplateIcons: ref({ 'aws.bedrock': '/img/bedrock.svg' }),
      agentSources: ref(null),
      loadConfig: jest.fn().mockResolvedValue({
        agentTemplates: ['aws.bedrock'],
        agentTemplateSources: {},
        agentTemplateDisplayNames: {},
      }),
    });

    const wrapper = mountComponent();
    AgentApi.getAgents = jest.fn()
      .mockResolvedValue({ data: { result: [agentWithoutIcon], totalCount: 1 } });
    await flushPromises();

    expect(wrapper.vm.agents[0].application.icon).toBe('/img/bedrock.svg');
  });
});
