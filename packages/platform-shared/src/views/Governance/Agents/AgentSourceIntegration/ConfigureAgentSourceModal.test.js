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
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import * as UseAgentConfig from '../utils/useAgentConfig';
import { AGENT_CLASSIFICATION_TASK, IS_AGENT_SECRET_REQUIRED } from '../utils/agentUtility';
import ConfigureAgentSourceModal from './ConfigureAgentSourceModal';

// One stable useBvModal() instance for all calls, referenced lazily inside the
// factory (jest.mock hoisting requirement).
const mockBvModal = { show: jest.fn(), hide: jest.fn() };

jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({ bvModal: { value: mockBvModal } }),
}));

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  displayNotification: jest.fn(),
  showErrorMessage: jest.fn(),
}));

const mockAgentSources = {
  privilege: {
    bedrock: { objectClasses: [] },
    vertex: { objectClasses: [] },
  },
};

const mockOwnersProperty = {
  type: 'array',
  title: 'Owners',
  description: 'Owners',
  items: {
    type: 'relationship',
    resourceCollection: [{ path: 'managed/alpha_user' }],
  },
};

const mockManagedConfig = {
  objects: [
    {
      name: 'alpha_application',
      schema: { properties: { owners: mockOwnersProperty } },
    },
  ],
};

function mountComponent({ sources = mockAgentSources } = {}) {
  setupTestPinia();
  UseAgentConfig.useAgentConfig = jest.fn().mockReturnValue({
    agentApplicationProps: ref({}),
    agentSources: ref(sources),
    agentTemplateSourceArrays: ref({}),
    loadConfig: jest.fn().mockResolvedValue({}),
  });
  return mount(ConfigureAgentSourceModal, {
    props: { source: 'privilege' },
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
        RelationshipEdit: true,
      },
    },
  });
}

/** A full application record — the update is a full-record replace. */
function makeFullRecord(id, listEntry) {
  return {
    id,
    name: listEntry?.name || `App ${id}`,
    description: listEntry?.name || `App ${id}`,
    ownerIds: ['owner-1'],
    isDisconnected: true,
    authoritative: false,
    icon: '',
    datasourceId: 'disconnected',
    aiAgentSource: listEntry?.ingestion?.connector?.subtype,
    objectTypes: [],
    ingestion: listEntry?.ingestion,
  };
}

/** Mounts, fires @shown, and enables Save (secret + owners). */
async function mountReadyToConfigure({ applicationsResult = [] } = {}) {
  ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: applicationsResult } });
  const wrapper = mountComponent();
  await wrapper.vm.onShown();
  await flushPromises();
  wrapper.vm.connectionValues.apiSecret = 'super-secret';
  wrapper.vm.applicationOwners = [{ _ref: 'managed/alpha_user/user-1' }];
  return wrapper;
}

describe('ConfigureAgentSourceModal', () => {
  beforeEach(() => {
    ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: [] } });
    // The update path fetches each app's full record before PUTting; resolve it from
    // the list mock's current result so per-test fixtures flow through.
    ApplicationsApi.getApplication = jest.fn(async (id) => {
      const { results } = ApplicationsApi.getApplications.mock;
      // Await the latest list mock result if one exists; onBeforeMount ordering can
      // mean getApplication is called before the list resolves, so fall back to {}.
      const latest = results.length ? results[results.length - 1] : null;
      const listValue = latest && latest.type === 'return' ? await Promise.resolve(latest.value) : null;
      const entry = (listValue?.data?.result || []).find((app) => app.id === id);
      return { data: makeFullRecord(id, entry) };
    });
    ApplicationsApi.createUnmanagedApplication = jest.fn().mockResolvedValue({ data: { id: 'created-app-id' } });
    ApplicationsApi.saveApplicationTask = jest.fn().mockResolvedValue({ data: {} });
    ApplicationsApi.updateApplication = jest.fn().mockResolvedValue({ data: {} });
    ConfigApi.getConfig = jest.fn().mockResolvedValue({ data: mockManagedConfig });
    displayNotification.mockClear();
    showErrorMessage.mockClear();
    mockBvModal.show.mockClear();
    mockBvModal.hide.mockClear();
  });

  it('builds subtype rows from the source config and fetched applications (drives the save logic)', async () => {
    ApplicationsApi.getApplications = jest.fn().mockResolvedValue({
      data: {
        result: [
          { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
        ],
      },
    });

    const wrapper = mountComponent();
    await wrapper.vm.onShown();
    await flushPromises();

    expect(ApplicationsApi.getApplications).toHaveBeenCalledWith(null, {
      queryFilter: 'ingestion.connector.type eq "privilege"',
      pageSize: 100,
      fields: 'name,id,aiAgentSource,ingestion',
      disconnected: true,
    });
    expect(wrapper.vm.subtypeRows).toEqual([
      { key: 'bedrock', displayName: 'bedrock', configured: true },
      { key: 'vertex', displayName: 'vertex', configured: false },
    ]);
  });

  it('renders all six connection fields plus a password-type API secret input', async () => {
    const wrapper = await mountReadyToConfigure();

    ['controllerUrl', 'envId', 'userId', 'apiKey', 'namespace'].forEach((field) => {
      const input = wrapper.find(`[name="agentSourceConnection-${field}"]`);
      expect(input.exists()).toBe(true);
    });
    const secretField = wrapper.find('[name="agentSourceConnection-apiSecret"]');
    expect(secretField.exists()).toBe(true);
    expect(secretField.attributes('type')).toBe('password');
  });

  it('shows a masked placeholder on the empty secret field when a stored secret exists, and none otherwise', async () => {
    // Stored secret: field stays empty (the value does not exist unless typed), the
    // placeholder indicates presence, and Save is already enabled without typing.
    const withSecret = await mountReadyToConfigure({
      applicationsResult: [
        { id: 'app-1', name: 'Bedrock', ingestion: { connector: { type: 'privilege', subtype: 'bedrock', connection: { apiSecretRef: 'secret:iga/apps/app-1/apiSecret' } } } },
      ],
    });
    withSecret.vm.connectionValues.apiSecret = '';
    await flushPromises();

    const secretInput = withSecret.find('input[name="agentSourceConnection-apiSecret"]');
    expect(secretInput.attributes('placeholder')).toBe('••••••••');
    expect(secretInput.element.value).toBe('');
    expect(withSecret.vm.isConfigureEnabled).toBe(true);

    const withoutSecret = await mountReadyToConfigure();
    withoutSecret.vm.connectionValues.apiSecret = '';
    await flushPromises();
    const emptyInput = withoutSecret.find('input[name="agentSourceConnection-apiSecret"]');
    expect(emptyInput.attributes('placeholder') || '').toBe('');
    if (IS_AGENT_SECRET_REQUIRED) {
      expect(withoutSecret.vm.isConfigureEnabled).toBe(false);
    }
  });

  it('captures each configured application\'s derived secret ref for the update echo', async () => {
    const wrapper = await mountReadyToConfigure({
      applicationsResult: [
        { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock', connection: { apiSecretRef: 'secret:iga/apps/app-1/apiSecret' } } } },
        { id: 'app-2', ingestion: { connector: { type: 'privilege', subtype: 'vertex', connection: { apiSecretRef: 'secret:iga/apps/app-2/apiSecret' } } } },
      ],
    });

    expect(wrapper.vm.storedSecretRefs).toEqual({
      'app-1': 'secret:iga/apps/app-1/apiSecret',
      'app-2': 'secret:iga/apps/app-2/apiSecret',
    });
  });

  it('updates existing applications with the form values, echoing their own secret refs, and clears the typed secret from the echo when a new one is stored', async () => {
    ApplicationsApi.updateApplication = jest.fn().mockResolvedValue({ data: {} });
    const wrapper = await mountReadyToConfigure({
      applicationsResult: [
        {
          id: 'app-1',
          name: 'Bedrock',
          ingestion: { connector: { type: 'privilege', subtype: 'bedrock', connection: { controllerUrl: 'https://old.example.com', apiSecretRef: 'secret:iga/apps/app-1/apiSecret' } } },
        },
      ],
    });
    wrapper.vm.connectionValues.controllerUrl = 'https://new.example.com';
    wrapper.vm.connectionValues.apiSecret = 'rotated-secret';
    await flushPromises();

    await wrapper.vm.configureSource();
    await flushPromises();

    expect(ApplicationsApi.updateApplication).toHaveBeenCalledTimes(1);
    const [appId, payload] = ApplicationsApi.updateApplication.mock.calls[0];
    expect(appId).toBe('app-1');
    // Full-record replace: untouched top-level fields survive
    expect(payload.name).toBe('Bedrock');
    expect(payload.ingestion.connector.type).toBe('privilege');
    expect(payload.ingestion.connector.subtype).toBe('bedrock');
    // Connection replaced with form values; typed secret rotates, so the ref is NOT echoed
    expect(payload.ingestion.connector.connection.controllerUrl).toBe('https://new.example.com');
    expect(payload.ingestion.connector.connection.apiSecret).toBe('rotated-secret');
    expect(payload.ingestion.connector.connection.apiSecretRef).toBeUndefined();
  });

  it('keeps the stored credential on update when no new secret is typed (ref echoed, no apiSecret sent)', async () => {
    ApplicationsApi.updateApplication = jest.fn().mockResolvedValue({ data: {} });
    const wrapper = await mountReadyToConfigure({
      applicationsResult: [
        {
          id: 'app-1',
          name: 'Bedrock',
          ingestion: { connector: { type: 'privilege', subtype: 'bedrock', connection: { controllerUrl: 'https://old.example.com', apiSecretRef: 'secret:iga/apps/app-1/apiSecret' } } },
        },
      ],
    });
    wrapper.vm.connectionValues.controllerUrl = 'https://new.example.com';
    // No rotation: the user leaves the (placeholder-indicated) secret field empty.
    wrapper.vm.connectionValues.apiSecret = '';
    await flushPromises();

    await wrapper.vm.configureSource();
    await flushPromises();

    const [, payload] = ApplicationsApi.updateApplication.mock.calls[0];
    expect(payload.ingestion.connector.connection.apiSecretRef).toBe('secret:iga/apps/app-1/apiSecret');
    expect(payload.ingestion.connector.connection.apiSecret).toBeUndefined();
  });

  it('shows an error and skips the success notification when an update fails', async () => {
    ApplicationsApi.updateApplication = jest.fn().mockRejectedValue(new Error('update failed'));
    const wrapper = await mountReadyToConfigure({
      applicationsResult: [
        { id: 'app-1', name: 'Bedrock', ingestion: { connector: { type: 'privilege', subtype: 'bedrock', connection: { apiSecretRef: 'secret:iga/apps/app-1/apiSecret' } } } },
      ],
    });
    await wrapper.vm.configureSource();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledWith(expect.any(Error), 'Failed to update the application Bedrock');
    expect(displayNotification).not.toHaveBeenCalledWith('success', expect.anything());
  });

  it('includes only the non-empty connection values in the created application payload', async () => {
    const wrapper = await mountReadyToConfigure();
    wrapper.vm.connectionValues.controllerUrl = 'https://privilege.pingone.com';
    wrapper.vm.connectionValues.envId = 'env-123';
    wrapper.vm.connectionValues.namespace = '   ';
    await flushPromises();

    await wrapper.vm.configureSource();
    await flushPromises();

    const payload = ApplicationsApi.createUnmanagedApplication.mock.calls[0][0];
    expect(payload.ingestion.connector.connection).toEqual({
      controllerUrl: 'https://privilege.pingone.com',
      envId: 'env-123',
      apiSecret: 'super-secret',
    });
  });

  it('loads the managed/application owners relationship property on show', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.onShown();
    await flushPromises();

    expect(ConfigApi.getConfig).toHaveBeenCalledWith('managed');
    expect(wrapper.vm.relationshipProperty).toEqual({
      ...mockOwnersProperty,
      description: 'The selected owner(s) are the default users responsible for standard IGA operations like approvals',
      value: [],
      key: 'owners',
      options: [],
      validation: 'required',
    });
  });

  it('renders an owners selector labeled "Owners" and updates applicationOwners on selection', async () => {
    const wrapper = await mountReadyToConfigure();

    const ownersField = wrapper.findComponent(FrRelationshipEdit);
    expect(ownersField.exists()).toBe(true);
    expect(ownersField.props('label')).toBe('governance.agents.integration.ownersLabel');
    expect(ownersField.props('relationshipProperty').description).toBe('The selected owner(s) are the default users responsible for standard IGA operations like approvals');

    ownersField.vm.$emit('setValue', [{ _ref: 'managed/alpha_user/user-1' }]);
    await flushPromises();
    expect(wrapper.vm.applicationOwners).toEqual([{ _ref: 'managed/alpha_user/user-1' }]);
  });

  it('hides the owners selector once every subtype is configured (secret alone suffices)', async () => {
    const wrapper = await mountReadyToConfigure({
      applicationsResult: [
        { id: 'app-bedrock', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
        { id: 'app-vertex', ingestion: { connector: { type: 'privilege', subtype: 'vertex' } } },
      ],
    });

    expect(wrapper.vm.areAllSubtypesConfigured).toBe(true);
    expect(wrapper.vm.showOwnerInput).toBe(false);
    expect(wrapper.findComponent(FrRelationshipEdit).exists()).toBe(false);
    expect(wrapper.vm.isConfigureEnabled).toBe(true);
  });

  // Skipped while IS_AGENT_SECRET_REQUIRED is false (temporary testing bypass in
  // agentUtility.js); re-enable when the secret requirement is reinstated.
  (IS_AGENT_SECRET_REQUIRED ? it : it.skip)('keeps Save disabled without a secret even when owners are selected', async () => {
    const wrapper = await mountReadyToConfigure();
    wrapper.vm.connectionValues.apiSecret = '';
    await flushPromises();
    expect(wrapper.vm.isConfigureEnabled).toBe(false);
  });

  it('keeps Save disabled with a secret but no owners while subtypes remain unconfigured', async () => {
    const wrapper = await mountReadyToConfigure();
    wrapper.vm.applicationOwners = [];
    await flushPromises();
    expect(wrapper.vm.isConfigureEnabled).toBe(false);
  });

  it('clears the connection values and owners when the modal is shown again', async () => {
    const wrapper = await mountReadyToConfigure();
    wrapper.vm.connectionValues.apiSecret = 'super-secret';
    wrapper.vm.connectionValues.apiKey = 'key-1';
    wrapper.vm.applicationOwners = [{ _ref: 'managed/alpha_user/user-1' }];

    wrapper.vm.onShown();
    await flushPromises();

    expect(wrapper.vm.connectionValues.apiSecret).toBe('');
    expect(wrapper.vm.connectionValues.apiKey).toBe('');
    expect(wrapper.vm.applicationOwners).toEqual([]);
  });

  it('leaves Controller URL blank by default, and a stored record value wins over the blank', async () => {
    // Fresh open: no tenant URL is hardcoded in the form.
    const fresh = await mountReadyToConfigure();
    expect(fresh.vm.connectionValues.controllerUrl).toBe('');
    expect(fresh.vm.connectionValues.namespace).toBe('default');

    // Reopen over a configured app whose stored values differ: the record wins.
    ApplicationsApi.getApplications = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            id: 'app-1',
            ingestion: { connector: { type: 'privilege', subtype: 'bedrock', connection: { controllerUrl: 'https://custom.example.com', namespace: 'custom' } } },
          },
        ],
      },
    });
    const hydrated = mountComponent();
    await hydrated.vm.onShown();
    await flushPromises();
    expect(hydrated.vm.connectionValues.controllerUrl).toBe('https://custom.example.com');
    expect(hydrated.vm.connectionValues.namespace).toBe('custom');
  });

  describe('configureSource', () => {
    it('creates an application then its static classification task for each unconfigured subtype and emits configured', async () => {
      ApplicationsApi.createUnmanagedApplication = jest.fn()
        .mockResolvedValueOnce({ data: { id: 'app-bedrock' } })
        .mockResolvedValueOnce({ data: { id: 'app-vertex' } });

      const wrapper = await mountReadyToConfigure();
      await wrapper.vm.configureSource();
      await flushPromises();

      expect(ApplicationsApi.createUnmanagedApplication).toHaveBeenCalledTimes(2);
      expect(ApplicationsApi.saveApplicationTask).toHaveBeenCalledTimes(2);
      expect(ApplicationsApi.saveApplicationTask).toHaveBeenNthCalledWith(1, 'app-bedrock', AGENT_CLASSIFICATION_TASK, { autoRun: false });
      expect(ApplicationsApi.saveApplicationTask).toHaveBeenNthCalledWith(2, 'app-vertex', AGENT_CLASSIFICATION_TASK, { autoRun: false });
      expect(displayNotification).toHaveBeenCalledWith('success', 'Applications created successfully');
      expect(wrapper.emitted('configured')).toHaveLength(1);
      expect(mockBvModal.hide).toHaveBeenCalledWith('ConfigureAgentSourceModal');
    });

    it('skips already-configured subtypes entirely, calling neither API for them', async () => {
      const wrapper = await mountReadyToConfigure({
        applicationsResult: [
          { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
        ],
      });
      await wrapper.vm.configureSource();
      await flushPromises();

      // Only 'vertex' is unconfigured; 'bedrock' already has a matching application.
      expect(ApplicationsApi.createUnmanagedApplication).toHaveBeenCalledTimes(1);
      expect(ApplicationsApi.saveApplicationTask).toHaveBeenCalledTimes(1);
    });

    it('does not create a task and shows an error when application creation fails', async () => {
      ApplicationsApi.createUnmanagedApplication = jest.fn().mockRejectedValue(new Error('create failed'));

      const wrapper = await mountReadyToConfigure();
      await wrapper.vm.configureSource();
      await flushPromises();

      expect(ApplicationsApi.saveApplicationTask).not.toHaveBeenCalled();
      expect(showErrorMessage).toHaveBeenCalledWith(expect.any(Error), 'Failed to create the application for bedrock');
      expect(displayNotification).not.toHaveBeenCalledWith('success', expect.anything());
      expect(wrapper.emitted('configured')).toBeUndefined();
    });

    it('shows an error and skips the success notification when task creation fails', async () => {
      ApplicationsApi.saveApplicationTask = jest.fn().mockRejectedValue(new Error('task failed'));

      const wrapper = await mountReadyToConfigure();
      await wrapper.vm.configureSource();
      await flushPromises();

      expect(ApplicationsApi.createUnmanagedApplication).toHaveBeenCalledTimes(2);
      expect(showErrorMessage).toHaveBeenCalledWith(expect.any(Error), 'Failed to configure classification for bedrock');
      expect(displayNotification).not.toHaveBeenCalledWith('success', expect.anything());
      expect(wrapper.emitted('configured')).toBeUndefined();
    });
  });
});
