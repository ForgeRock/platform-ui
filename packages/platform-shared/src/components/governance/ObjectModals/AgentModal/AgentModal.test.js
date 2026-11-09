/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import AgentModal from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
  getAgentConfig: jest.fn().mockResolvedValue({
    data: {
      templates: [
        {
          id: 'aws.bedrock',
          sourceName: 'aws-bedrock',
          resources: [
            {
              type: 'tools',
              accountAttribute: 'tools',
              objectType: 'agentTool',
              nameProperty: '__NAME__',
              descriptionProperty: 'description',
            },
          ],
          mapping: [
            { iga: 'agentName', icf: 'agentName', privilege: 'agentName' },
            { iga: 'model.id', icf: 'model', privilege: 'foundationModel' },
            { iga: 'status', icf: 'status', privilege: 'state' },
          ],
        },
      ],
      schema: [
        { key: 'agentName', displayName: 'Agent Name', type: 'string' },
        { key: 'model.id', displayName: 'Foundation Model', type: 'string' },
        { key: 'status', displayName: 'Status', type: 'string' },
      ],
      sources: {},
    },
  }),
  getAgentResources: jest.fn(),
  getAgentCustodians: jest.fn(),
}));

function makeGrant(overrides = {}) {
  return {
    id: 'test-item',
    descriptor: {
      idx: {
        '/account': { displayName: 'Test Agent' },
      },
    },
    account: {
      agentName: 'Test Agent',
      model: 'claude-3',
      status: 'active',
      description: 'A helpful agent',
    },
    application: { id: 'app1', name: 'AWS Bedrock', templateName: 'aws.bedrock' },
    keys: { accountId: 'test-agent-account' },
    // glossary-less grant: the modal only fetches custodians through the
    // endpoint when the grant carries no stamped glossary (request records
    // always carry one, and render from it)
    ...overrides,
  };
}

function shallowMountAgentModal(propsData = {}, storeOverrides = {}) {
  return shallowMount(AgentModal, {
    global: {
      plugins: [
        createStore({
          state: { SharedStore: { governanceDevEnabled: true, ...storeOverrides } },
        }),
      ],
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      grant: makeGrant(),
      ...propsData,
    },
  });
}

describe('AgentModal', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    // The custodians endpoint returns resolved user objects (the backend
    // resolves the glossary's bare managed/user refs)
    AgentApi.getAgentCustodians.mockResolvedValue({
      data: {
        result: [
          {
            id: 'user-1', givenName: 'Ally', sn: 'Agent', userName: 'ally',
          },
        ],
        totalCount: 1,
      },
    });
  });

  it('component mounts with the grant prop', () => {
    wrapper = shallowMountAgentModal();
    expect(wrapper.vm.grant.id).toBe('test-item');
  });

  it('derives the display name from descriptor.idx./account.displayName', () => {
    wrapper = shallowMountAgentModal();
    expect(wrapper.vm.agentDisplayName).toBe('Test Agent');
  });

  it('matches the template mapping by application templateName', async () => {
    wrapper = shallowMountAgentModal();
    await flushPromises();
    expect(wrapper.vm.agentMapping).toEqual([
      { iga: 'agentName', icf: 'agentName', privilege: 'agentName' },
      { iga: 'model.id', icf: 'model', privilege: 'foundationModel' },
      { iga: 'status', icf: 'status', privilege: 'state' },
    ]);
    // templateName present: ICF agent, so values resolve via the entries' icf keys,
    // rendered under the schema keys (same display as the agent details page)
    expect(wrapper.vm.mappedProperties).toEqual({
      agentName: 'Test Agent',
      'model.id': 'claude-3',
      status: 'active',
    });
  });

  it('resolves the template by aiAgentSource when the discovered line item has no templateName', async () => {
    // Discovered agent line items stamp application.aiAgentSource (the connector
    // subtype) and may lack the template's own templateName
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ application: { id: 'app1', name: 'AWS Bedrock', aiAgentSource: 'aws-bedrock' } }),
    });
    await flushPromises();

    expect(wrapper.vm.agentMapping).toEqual([
      { iga: 'agentName', icf: 'agentName', privilege: 'agentName' },
      { iga: 'model.id', icf: 'model', privilege: 'foundationModel' },
      { iga: 'status', icf: 'status', privilege: 'state' },
    ]);
    expect(wrapper.vm.agentResourceProps.map((r) => r.type)).toEqual(['tools']);
  });

  it('resolves values via the privilege keys when the application has no templateName', async () => {
    wrapper = shallowMountAgentModal({
      grant: makeGrant({
        application: { id: 'app1', name: 'AWS Bedrock', aiAgentSource: 'aws-bedrock' },
        account: {
          agentName: 'Test Agent',
          foundationModel: 'claude-3',
          state: 'ACTIVE',
          description: 'A helpful agent',
        },
      }),
    });
    await flushPromises();

    // No templateName: privilege agent, so values resolve via the entries' privilege keys
    expect(wrapper.vm.mappedProperties).toEqual({
      agentName: 'Test Agent',
      'model.id': 'claude-3',
      status: 'ACTIVE',
    });
  });

  it('shows no resource cards when neither templateName nor aiAgentSource matches', async () => {
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ application: { id: 'app1', name: 'Unknown Platform', aiAgentSource: 'mystery' } }),
    });
    await flushPromises();

    // No mapping rows for the unknown template; no resource cards either — guessing
    // the default set would query types the agent's template doesn't support
    expect(wrapper.vm.agentMapping).toEqual([]);
    expect(wrapper.vm.agentResourceProps).toEqual([]);
  });

  it('maps schema keys missing from the account to the blank indicator', async () => {
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ account: { agentName: 'Only Name' } }),
    });
    await flushPromises();
    // schema-driven display: absent values render as the blank indicator string
    expect(wrapper.vm.mappedProperties).toEqual({
      agentName: 'Only Name',
      'model.id': '',
      status: '',
    });
  });

  it('renders the linked agent identity from the line item user object', () => {
    // the cert snapshot stamps the agent's fields (user included) on the item, so
    // the identity renders from the grant alone — no agent fetch
    wrapper = shallowMountAgentModal({
      grant: makeGrant({
        user: {
          id: '123',
          userName: 'jDoe',
          givenName: 'John',
          sn: 'Doe',
        },
        keys: { accountId: 'account-123' },
      }),
    });

    expect(wrapper.vm.linkedIdentity).toEqual({
      id: '123',
      userName: 'jDoe',
      givenName: 'John',
      sn: 'Doe',
    });
  });

  it('hides the linked agent identity when the line item has no user', async () => {
    wrapper = shallowMountAgentModal();
    await flushPromises();

    expect(wrapper.vm.linkedIdentity).toBeNull();
  });

  it('resolves header badge values through the template mapping', async () => {
    wrapper = shallowMountAgentModal();
    await flushPromises();

    expect(wrapper.vm.agentModel).toBe('claude-3');
    expect(wrapper.vm.agentStatus).toBe('active');
  });

  it('fetches custodians through the agent custodians endpoint', async () => {
    wrapper = shallowMountAgentModal();
    await flushPromises();

    expect(AgentApi.getAgentCustodians).toHaveBeenCalledWith('test-agent-account', { pageSize: 100, pageNumber: 0 });
    expect(wrapper.vm.custodianActors).toHaveLength(1);
    expect(wrapper.vm.custodianActors[0].givenName).toBe('Ally');
    expect(wrapper.vm.custodianActors[0].fullName).toBe('Ally Agent');
  });

  it('resolves custodians from the grant _displayData without calling the custodians endpoint', async () => {
    // Request records fetched with expandPaths=glossary.idx carry the resolved
    // actor display data — the request viewer may not have agent API permission
    const grant = makeGrant({
      _displayData: {
        'managed/user/user-1': {
          id: 'user-1', givenName: 'Stella', sn: 'Stamped', userName: 'stella',
        },
      },
      glossary: {
        idx: {
          '/account': { accountType: 'agent', actors: ['managed/user/user-1'] },
        },
      },
    });
    wrapper = shallowMountAgentModal({ grant });
    await flushPromises();

    expect(AgentApi.getAgentCustodians).not.toHaveBeenCalled();
    expect(wrapper.vm.custodianActors).toHaveLength(1);
    expect(wrapper.vm.custodianActors[0].id).toBe('user-1');
    expect(wrapper.vm.custodianActors[0].fullName).toBe('Stella Stamped');
  });

  it('renders no custodians for a stamped glossary without actors (no endpoint call)', async () => {
    // the real modifyAgent record shape — no custodians stamped, and the
    // composite agent id would not resolve against the endpoint anyway
    const grant = makeGrant({
      glossary: {
        idx: {
          '/account': { accountType: 'agent' },
        },
      },
    });
    wrapper = shallowMountAgentModal({ grant });
    await flushPromises();

    expect(AgentApi.getAgentCustodians).not.toHaveBeenCalled();
    expect(wrapper.vm.custodianActors).toHaveLength(0);
  });

  it('falls back to the custodians endpoint for a stamped glossary with unresolved actor refs', async () => {
    // cert line items carry a glossary with actor refs but no _displayData;
    // TaskList fetches it by id on open, but a failed fetch must degrade to the
    // endpoint rather than rendering bare managed/user refs
    const grant = makeGrant({
      glossary: {
        idx: {
          '/account': { accountType: 'agent', actors: ['managed/user/user-9'] },
        },
      },
    });
    wrapper = shallowMountAgentModal({ grant });
    await flushPromises();

    expect(AgentApi.getAgentCustodians).toHaveBeenCalledWith('test-agent-account', { pageSize: 100, pageNumber: 0 });
    expect(wrapper.vm.custodianActors).toHaveLength(1);
    expect(wrapper.vm.custodianActors[0].givenName).toBe('Ally');
  });

  it('falls back to the custodians endpoint when _displayData is present but empty', async () => {
    // the exact shape RequestedItemCard passes: enrichment ran but resolved
    // nothing — an empty _displayData object must not count as resolved content
    const grant = makeGrant({
      _displayData: {},
      glossary: {
        idx: {
          '/account': { accountType: 'agent', actors: ['managed/user/user-7'] },
        },
      },
    });
    wrapper = shallowMountAgentModal({ grant });
    await flushPromises();

    expect(AgentApi.getAgentCustodians).toHaveBeenCalledWith('test-agent-account', { pageSize: 100, pageNumber: 0 });
    expect(wrapper.vm.custodianActors).toHaveLength(1);
  });

  it('renders content-resolved custodians only when every actor ref is resolved', async () => {
    // partial enrichment (one of two refs resolved) is not enough — bare refs
    // must degrade to the endpoint rather than render as raw names
    const grant = makeGrant({
      _displayData: {
        'managed/user/user-1': {
          id: 'user-1', givenName: 'Stella', sn: 'Stamped', userName: 'stella',
        },
      },
      glossary: {
        idx: {
          '/account': { accountType: 'agent', actors: ['managed/user/user-1', 'managed/user/user-2'] },
        },
      },
    });
    wrapper = shallowMountAgentModal({ grant });
    await flushPromises();

    expect(AgentApi.getAgentCustodians).toHaveBeenCalledWith('test-agent-account', { pageSize: 100, pageNumber: 0 });
  });

  it('shows no custodians when the custodians fetch fails', async () => {
    AgentApi.getAgentCustodians.mockRejectedValue(new Error('fail'));
    wrapper = shallowMountAgentModal();
    await flushPromises();

    expect(wrapper.vm.custodianActors).toHaveLength(0);
  });

  it('skips the custodians fetch when the item carries no agent account id', async () => {
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ keys: { accountId: '' } }),
    });
    await flushPromises();

    expect(AgentApi.getAgentCustodians).not.toHaveBeenCalled();
    expect(wrapper.vm.custodianActors).toHaveLength(0);
  });

  it('starts with the content sections expanded, resources and technical attributes collapsed, and toggles work', async () => {
    wrapper = shallowMountAgentModal();
    await flushPromises();

    expect(wrapper.vm.isVisible.about).toBe(true);
    expect(wrapper.vm.isVisible.custodians).toBe(true);
    expect(wrapper.vm.isVisible.attributes).toBe(true);
    expect(wrapper.vm.isVisible.technical).toBe(false);
    // resource cards start collapsed; the header badge tells the user whether to expand
    expect(wrapper.vm.resourceIsExpanded('tools')).toBe(false);

    wrapper.vm.isVisible.technical = true;
    wrapper.vm.isVisible.about = false;
    expect(wrapper.vm.isVisible.technical).toBe(true);
    expect(wrapper.vm.isVisible.about).toBe(false);
  });

  it('builds resource cards from the template config and fetches each resource type', async () => {
    AgentApi.getAgentResources.mockResolvedValue({
      data: {
        result: [
          { id: 'tool-1', sourceObject: { __NAME__: 'Calculator', description: 'Does math' } },
        ],
        totalCount: 1,
      },
    });
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ keys: { accountId: 'account-123' } }),
    });
    await flushPromises();

    // one card per template-configured resource type, fetched with the account id
    expect(wrapper.vm.agentResourceProps.map((r) => r.type)).toEqual(['tools']);
    expect(AgentApi.getAgentResources).toHaveBeenCalledWith('account-123', 'tools', { pageSize: 10, pageNumber: 0 });
    expect(wrapper.vm.resourceItems('tools')).toHaveLength(1);
    expect(wrapper.vm.resourceItems('tools')[0].name).toBe('Calculator');
  });

  it('tracks the fetched total per resource type for the header badge', async () => {
    AgentApi.getAgentResources.mockResolvedValue({
      data: {
        result: [
          { id: 'tool-1', sourceObject: { __NAME__: 'Calculator', description: 'Does math' } },
        ],
        totalCount: 7,
      },
    });
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ keys: { accountId: 'account-123' } }),
    });
    await flushPromises();

    // the badge shows the server-side total, not the single fetched page
    expect(wrapper.vm.resourceTotal('tools')).toBe(7);
    expect(wrapper.vm.resourceItems('tools')).toHaveLength(1);
  });

  it('toggles a resource card open and closed independently of the others', async () => {
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ keys: { accountId: 'account-123' } }),
    });
    await flushPromises();

    expect(wrapper.vm.resourceIsExpanded('tools')).toBe(false);
    wrapper.vm.toggleResource('tools');
    expect(wrapper.vm.resourceIsExpanded('tools')).toBe(true);
    wrapper.vm.toggleResource('tools');
    expect(wrapper.vm.resourceIsExpanded('tools')).toBe(false);
  });

  it('produces no resource cards when the line item has no account id', async () => {
    const grant = makeGrant();
    delete grant.keys;
    wrapper = shallowMountAgentModal({ grant });
    await flushPromises();

    expect(wrapper.vm.agentResourceProps).toHaveLength(1); // config still matches
    expect(AgentApi.getAgentResources).not.toHaveBeenCalled();
    expect(wrapper.vm.resourceItems('tools')).toHaveLength(0);
  });

  it('shows the empty state for a resource type whose fetch fails', async () => {
    AgentApi.getAgentResources.mockRejectedValue(new Error('fail'));
    wrapper = shallowMountAgentModal({
      grant: makeGrant({ keys: { accountId: 'account-123' } }),
    });
    await flushPromises();

    expect(wrapper.vm.resourceItems('tools')).toHaveLength(0);
  });

  it('hides resource cards and skips their fetches when governance dev is disabled', async () => {
    wrapper = shallowMountAgentModal(
      { grant: makeGrant({ keys: { accountId: 'account-123' } }) },
      { governanceDevEnabled: false },
    );
    await flushPromises();

    // The template config still matches — the cards are gated, not the config
    expect(wrapper.vm.agentResourceProps).toHaveLength(1);
    expect(wrapper.vm.resourcesDevEnabled).toBe(false);
    expect(AgentApi.getAgentResources).not.toHaveBeenCalled();
    expect(wrapper.vm.resourceItems('tools')).toHaveLength(0);
  });
});
