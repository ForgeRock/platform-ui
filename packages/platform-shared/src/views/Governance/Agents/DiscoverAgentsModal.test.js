/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import * as UseAgentConfig from './utils/useAgentConfig';
import DiscoverAgentsModal from './DiscoverAgentsModal';

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  displayNotification: jest.fn(),
  showErrorMessage: jest.fn(),
}));

const mockAgentApplicationProps = {
  'aws.bedrock': {
    tools: {
      objectType: 'agentTool',
      accountAttribute: 'tools',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    guardrails: {
      objectType: 'agentGuardrail',
      accountAttribute: 'guardrailId',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    toolCredentials: {
      objectType: 'agentToolCredentials',
      accountAttribute: 'toolCredentialIds',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
  },
  default: {
    tools: {
      objectType: 'agentTool',
      accountAttribute: 'toolIds',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
  },
};

const mockMappings = [
  {
    id: 'systemMkbedrockAgenttool_managedAlpha_assignment',
    state: 'complete',
    reconId: 'recon-001',
    order: 1,
    results: {
      started: '2026-07-24T21:06:28.980Z',
      ended: '2026-07-24T21:06:28.997Z',
      progress: {
        target: {
          created: 3,
          updated: 1,
        },
      },
    },
  },
  {
    id: 'systemMkbedrockAgenttool_managedAlpha_user',
    state: 'pending',
    reconId: null,
    order: 2,
    results: null,
  },
];

const mockApplications = [
  { id: 'app-001', name: 'AWS Bedrock', templateName: 'aws.bedrock' },
];

const mockSources = {
  privilege: {
    bedrock: { objectClasses: [] },
    vertex: { objectClasses: [] },
  },
};

const mockSourceApplication = {
  id: 'app-bedrock',
  name: 'Bedrock App',
  ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } },
};

function mountComponent({ sources = null } = {}) {
  setupTestPinia();
  UseAgentConfig.useAgentConfig = jest.fn().mockReturnValue({
    agentApplicationProps: ref(mockAgentApplicationProps),
    agentSources: ref(sources),
    loadConfig: jest.fn().mockResolvedValue({}),
  });
  return mount(DiscoverAgentsModal, {
    global: {
      plugins: [Notifications],
      mocks: {
        $t: (t) => t,
        $bvModal: { show: jest.fn(), hide: jest.fn() },
      },
      stubs: {
        BModal: {
          template: '<div><slot /><slot name="modal-footer" /></div>',
        },
        BTable: true,
        RelationshipEdit: true,
      },
    },
  });
}

/** Mounts and waits for mount-time initialization to settle. */
async function mountInitialized({ sources, applicationsResult = [] } = {}) {
  ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: applicationsResult } });
  const wrapper = mountComponent({ sources });
  await flushPromises();
  return wrapper;
}

describe('DiscoverAgentsModal', () => {
  beforeEach(() => {
    CommonsApi.getResource = jest.fn().mockResolvedValue({
      data: { result: mockApplications },
    });
    AgentApi.getAgentDiscovery = jest.fn().mockResolvedValue({
      data: { mappings: mockMappings, status: 'complete' },
    });
    AgentApi.createAgentDiscovery = jest.fn().mockResolvedValue({});
    AgentApi.triggerAgentDiscovery = jest.fn().mockResolvedValue({});
    ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: [] } });
    ApplicationsApi.syncApplication = jest.fn().mockResolvedValue({ data: {} });
    displayNotification.mockClear();
    showErrorMessage.mockClear();
  });

  it('renders the modal with an application selector when no sources are configured', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('[name="discoveryApplication"]').exists()).toBe(true);
    expect(wrapper.find('[name="discoverySource"]').exists()).toBe(false);
  });

  it('auto-selects Ping AIC and skips the source-selection step when no dynamic source is configured', async () => {
    const wrapper = await mountInitialized({ sources: mockSources });

    expect(wrapper.vm.selectedSource).toBe('pingAic');
    expect(wrapper.vm.activeStep).toBe(1);
    expect(wrapper.vm.isPingAicSource).toBe(true);
    expect(wrapper.find('[name="discoverySource"]').exists()).toBe(false);
  });

  it('auto-selects Ping AIC when the config defines no sources at all', async () => {
    const wrapper = await mountInitialized({ sources: null });

    expect(wrapper.vm.selectedSource).toBe('pingAic');
    expect(wrapper.vm.activeStep).toBe(1);
  });

  it('shows a spinner while initialization runs, then no longer after it settles', async () => {
    let resolveConfig;
    UseAgentConfig.useAgentConfig = jest.fn().mockReturnValue({
      agentApplicationProps: ref(mockAgentApplicationProps),
      agentSources: ref(mockSources),
      loadConfig: jest.fn().mockReturnValue(new Promise((resolve) => { resolveConfig = resolve; })),
    });
    ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: [] } });

    const wrapper = mountComponent({ sources: mockSources });
    await wrapper.vm.$nextTick();

    // While the config load is pending the body shows the initializing spinner.
    expect(wrapper.vm.isInitializing).toBe(true);
    expect(wrapper.find('.spinner-border').exists()).toBe(true);
    expect(wrapper.find('input[type="radio"]').exists()).toBe(false);

    resolveConfig({});
    await flushPromises();

    expect(wrapper.vm.isInitializing).toBe(false);
    expect(wrapper.find('.spinner-border').exists()).toBe(false);
  });

  it('goes straight to the application selection when no dynamic source is configured, without flashing the radio list', async () => {
    const wrapper = await mountInitialized({ sources: mockSources });

    expect(wrapper.vm.activeStep).toBe(1);
    expect(wrapper.vm.isPingAicSource).toBe(true);
    expect(wrapper.find('[name="discoveryApplication"]').exists()).toBe(true);
    expect(wrapper.find('input[type="radio"]').exists()).toBe(false);
  });

  it('prefetches applications for every dynamic source on initialization', async () => {
    await mountInitialized({ sources: mockSources });

    expect(ApplicationsApi.getApplications).toHaveBeenCalledWith(null, {
      queryFilter: 'ingestion.connector.type eq "privilege"',
      pageSize: 100,
      fields: 'name,id,aiAgentSource,ingestion',
      disconnected: true,
    });
  });

  it('lists an unconfigured dynamic source as a disabled radio option with a hint suffix', async () => {
    const wrapper = await mountInitialized({ sources: mockSources });

    expect(wrapper.vm.sourceOptions).toEqual([
      {
        value: 'privilege',
        text: 'PingOne Agent Privilege — Not set up',
        disabled: true,
        recommended: false,
      },
      { value: 'pingAic', text: 'Select specific application' },
    ]);
  });

  it('lists a configured dynamic source as an enabled, recommended option without the hint', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });

    expect(wrapper.vm.sourceOptions).toEqual([
      {
        value: 'privilege',
        text: 'PingOne Agent Privilege',
        disabled: false,
        recommended: true,
      },
      { value: 'pingAic', text: 'Select specific application' },
    ]);
  });

  it('renders the source step as radio buttons with the configured source pre-selected', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });

    // Stays on the selection step; the configured dynamic source is pre-checked.
    expect(wrapper.vm.selectedSource).toBe('privilege');
    expect(wrapper.vm.activeStep).toBe(0);

    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(2);
    expect(radios[0].element.checked).toBe(true);
    expect(radios[1].element.checked).toBe(false);
    expect(radios[0].element.disabled).toBe(false);

    expect(wrapper.text()).toContain('(common.recommended)');
  });

  it('renders the recommended label only for the recommended option', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });

    // The recommended suffix appears exactly once (Ping AIC carries none).
    expect(wrapper.text().match(/\(common\.recommended\)/g)).toHaveLength(1);
  });

  it('does not auto-advance on radio selection; the Next button advances to the configuration step', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });

    // Selection alone does not advance (still on step 0 after the pre-selection).
    expect(wrapper.vm.activeStep).toBe(0);

    wrapper.vm.goToNextStep();
    await flushPromises();

    expect(wrapper.vm.activeStep).toBe(1);
    expect(wrapper.find('[name="discoveryApplication"]').exists()).toBe(false);
  });

  it('keeps the selection on Previous so Next re-enters the same source', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });

    wrapper.vm.goToNextStep();
    await flushPromises();
    wrapper.vm.goToPreviousStep();
    await flushPromises();

    expect(wrapper.vm.selectedSource).toBe('privilege');
    expect(wrapper.vm.activeStep).toBe(0);
  });

  it('falls back to the raw key for a source with no display label mapping', async () => {
    const wrapper = await mountInitialized({ sources: { unknownSource: {} } });

    expect(wrapper.vm.sourceOptions[0]).toEqual({
      value: 'unknownSource',
      text: 'unknownSource — Not set up',
      disabled: true,
      recommended: false,
    });
  });

  it('shows the application flow when Ping AIC is selected', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });
    wrapper.vm.selectedSource = 'pingAic';
    wrapper.vm.goToNextStep();
    await flushPromises();

    expect(wrapper.vm.isPingAicSource).toBe(true);
    expect(wrapper.find('[name="discoveryApplication"]').exists()).toBe(true);
  });

  it('fetches applications for a selected non-Ping AIC source with the expected query params', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });
    ApplicationsApi.getApplications.mockClear();
    wrapper.vm.selectedSource = 'privilege';
    wrapper.vm.goToNextStep();
    await flushPromises();

    expect(ApplicationsApi.getApplications).toHaveBeenCalledWith(null, {
      queryFilter: 'ingestion.connector.type eq "privilege"',
      pageSize: 100,
      fields: 'name,id,aiAgentSource,ingestion',
      disconnected: true,
    });
  });

  it('shows a spinner while source applications are loading', async () => {
    let resolveFetch;
    ApplicationsApi.getApplications = jest.fn().mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));

    const wrapper = mountComponent({ sources: mockSources });
    await flushPromises();
    wrapper.vm.selectedSource = 'privilege';
    wrapper.vm.goToNextStep();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoadingApplications).toBe(true);

    resolveFetch({ data: { result: [] } });
    await flushPromises();

    expect(wrapper.vm.isLoadingApplications).toBe(false);
  });

  it('builds one subtype row per key with a green-check match against fetched applications', async () => {
    const wrapper = await mountInitialized({
      sources: mockSources,
      applicationsResult: [mockSourceApplication],
    });
    wrapper.vm.selectedSource = 'privilege';
    wrapper.vm.goToNextStep();
    await flushPromises();

    expect(wrapper.vm.sourceSubtypeRows).toEqual([
      { key: 'bedrock', displayName: 'bedrock', configured: true },
      { key: 'vertex', displayName: 'vertex', configured: false },
    ]);
  });

  it('uses the account objectClass\'s nativeName when present instead of falling back to the subtype key', async () => {
    const sourcesWithNativeName = {
      privilege: {
        bedrock: {
          objectClasses: [
            { name: '__ACCOUNT__', nativeName: 'AWS Bedrock Agents' },
          ],
        },
      },
    };
    const wrapper = await mountInitialized({ sources: sourcesWithNativeName });
    wrapper.vm.selectedSource = 'privilege';
    wrapper.vm.goToNextStep();
    await flushPromises();

    expect(wrapper.vm.sourceSubtypeRows).toEqual([
      { key: 'bedrock', displayName: 'AWS Bedrock Agents', configured: false },
    ]);
  });

  it('fetches discovery status when an application is selected', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await flushPromises();

    wrapper.vm.selectedApplication = 'app-001';
    await flushPromises();

    expect(AgentApi.getAgentDiscovery).toHaveBeenCalledWith('app-001');
    expect(wrapper.vm.mappings).toEqual(mockMappings);
  });

  it('sets isTaskMissing when getAgentDiscovery returns 404', async () => {
    AgentApi.getAgentDiscovery = jest.fn().mockRejectedValue({
      response: { status: 404 },
    });

    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.selectedApplication = 'app-001';
    await flushPromises();

    expect(wrapper.vm.isTaskMissing).toBe(true);
    expect(wrapper.vm.mappings).toHaveLength(0);
  });

  it('calls createAgentDiscovery when task is missing and Run Discovery is clicked', async () => {
    AgentApi.getAgentDiscovery = jest.fn().mockRejectedValue({
      response: { status: 404 },
    });

    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.selectedApplication = 'app-001';
    await flushPromises();

    AgentApi.getAgentDiscovery = jest.fn().mockResolvedValue({ data: { mappings: [], status: null } });
    await wrapper.vm.runDiscovery();
    await flushPromises();

    expect(AgentApi.createAgentDiscovery).toHaveBeenCalledWith('app-001');
  });

  it('calls triggerAgentDiscovery when an existing task is present and Run Discovery is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.selectedApplication = 'app-001';
    await flushPromises();

    await wrapper.vm.runDiscovery();
    await flushPromises();

    expect(AgentApi.triggerAgentDiscovery).toHaveBeenCalledWith('app-001', { preserveDate: false });
  });

  it('disables Run Discovery when any mapping is active', async () => {
    AgentApi.getAgentDiscovery = jest.fn().mockResolvedValue({
      data: { mappings: [{ ...mockMappings[0], state: 'active' }], status: 'active' },
    });

    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.selectedApplication = 'app-001';
    await flushPromises();

    expect(wrapper.vm.isAnyMappingActive).toBe(true);
  });

  it('extracts a human-readable object type label from a mapping id using template config', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.selectedTemplateName = 'aws.bedrock';
    await flushPromises();

    // "systemMkbedrockAgenttool_..." → connector segment contains "agenttool" → "Tools"
    expect(wrapper.vm.extractObjectType('systemMkbedrockAgenttool_managedAlpha_assignment')).toBe('Tools');
    // longer match wins: "agenttoolcredentials" beats "agenttool" → "Tool Credentials"
    expect(wrapper.vm.extractObjectType('systemMkbedrockAgenttoolcredentials_managedAlpha_bar')).toBe('Tool Credentials');
  });

  it('returns "Agent" for mappings that target the managed user object', () => {
    const wrapper = mountComponent();
    wrapper.vm.selectedTemplateName = 'aws.bedrock';
    expect(wrapper.vm.extractObjectType('systemMkbedrockAgent_managedAlpha_user')).toBe('Agents');
  });

  it('falls back to the raw mapping id when no objectType match is found', () => {
    const wrapper = mountComponent();
    wrapper.vm.selectedTemplateName = 'aws.bedrock';
    const unknownId = 'systemUnknownFoo_managedAlpha_bar';
    expect(wrapper.vm.extractObjectType(unknownId)).toBe(unknownId);
  });

  it('resets state when modal is hidden', async () => {
    const wrapper = await mountInitialized({ sources: mockSources, applicationsResult: [mockSourceApplication] });
    wrapper.vm.selectedSource = 'pingAic';
    await flushPromises();
    wrapper.vm.selectedApplication = 'app-001';
    wrapper.vm.selectedTemplateName = 'aws.bedrock';
    await flushPromises();

    wrapper.vm.reset();

    expect(wrapper.vm.selectedApplication).toBeNull();
    expect(wrapper.vm.selectedTemplateName).toBeNull();
    expect(wrapper.vm.mappings).toHaveLength(0);
    expect(wrapper.vm.isTaskMissing).toBe(false);
    expect(wrapper.vm.applicationsBySource).toEqual({});
  });

  describe('syncSource', () => {
    async function mountWithConfiguredSubtype() {
      const wrapper = await mountInitialized({
        sources: mockSources,
        applicationsResult: [mockSourceApplication],
      });
      // Advance to the configuration step the way the user would (Next button);
      // the Run Discovery button and source applications only exist there.
      wrapper.vm.selectedSource = 'privilege';
      wrapper.vm.goToNextStep();
      await flushPromises();
      return wrapper;
    }

    it('syncs each configured subtype\'s application', async () => {
      const wrapper = await mountWithConfiguredSubtype();

      await wrapper.vm.syncSource();
      await flushPromises();

      expect(ApplicationsApi.syncApplication).toHaveBeenCalledTimes(1);
      expect(ApplicationsApi.syncApplication).toHaveBeenCalledWith('app-bedrock');
      expect(displayNotification).toHaveBeenCalledWith('success', 'Discovery started successfully');
    });

    it('shows a spinner on the Run Discovery button while syncing', async () => {
      let resolveSync;
      ApplicationsApi.syncApplication = jest.fn().mockReturnValue(new Promise((resolve) => { resolveSync = resolve; }));

      const wrapper = await mountWithConfiguredSubtype();

      const syncPromise = wrapper.vm.syncSource();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isSyncing).toBe(true);
      expect(wrapper.findComponent(FrButtonWithSpinner).props('showSpinner')).toBe(true);

      resolveSync({ data: {} });
      await syncPromise;
      await flushPromises();

      expect(wrapper.vm.isSyncing).toBe(false);
      expect(wrapper.findComponent(FrButtonWithSpinner).props('showSpinner')).toBe(false);
    });

    it('shows an error and skips the success notification when a sync call fails', async () => {
      ApplicationsApi.syncApplication = jest.fn().mockRejectedValue(new Error('sync failed'));

      const wrapper = await mountWithConfiguredSubtype();

      await wrapper.vm.syncSource();
      await flushPromises();

      expect(showErrorMessage).toHaveBeenCalledWith(expect.any(Error), 'Failed to start discovery');
      expect(displayNotification).not.toHaveBeenCalledWith('success', expect.anything());
    });

    it('does nothing when no subtype is configured', async () => {
      const wrapper = await mountInitialized({ sources: mockSources });
      wrapper.vm.selectedSource = 'privilege';
      wrapper.vm.goToNextStep();
      await flushPromises();

      await wrapper.vm.syncSource();
      await flushPromises();

      expect(ApplicationsApi.syncApplication).not.toHaveBeenCalled();
    });
  });
});
