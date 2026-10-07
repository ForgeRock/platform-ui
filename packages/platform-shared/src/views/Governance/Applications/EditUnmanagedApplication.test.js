/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as AgentConfigApi from '@forgerock/platform-shared/src/api/governance/AgentConfigApi';
import { clearAgentConfig } from '@forgerock/platform-shared/src/components/governance/Applications/ObjectType/DetailsForm';
import ObjectTypes from '@forgerock/platform-shared/src/components/governance/Applications/ObjectType/ObjectTypes';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { compareRealmSpecificResourceName } from '@forgerock/platform-shared/src/utils/realm';
import EditUnmanagedApplication from './EditUnmanagedApplication';

jest.mock('@/i18n', () => ({
  // DetailsForm calls global.te() before translating agent template names;
  // this mock exposes no agent template keys, so te() returns false and the
  // raw template id renders (matching real vue-i18n behavior for unknown keys).
  global: { t: (k) => k, te: () => false },
}));
jest.mock('@/store', () => ({
  // SharedStore.isAirGapped is read by applicationImageResolver.resolveImage
  // whenever the full component tree renders (logoSource), which only the
  // boundary tests exercise through a full mount.
  state: { isFraas: false, realm: 'alpha', SharedStore: { isAirGapped: false } },
}));
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AgentConfigApi');
jest.mock('@forgerock/platform-shared/src/api/ConfigApi');
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/utils/realm', () => ({
  compareRealmSpecificResourceName: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/composables/breadcrumb', () => ({
  __esModule: true,
  default: () => ({ setBreadcrumb: jest.fn() }),
}));
const mockRouterPush = jest.fn();
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const appData = {
  id: 'app-1',
  name: 'My App',
  description: 'Test app',
  icon: '',
  objectTypes: [],
  ownerIds: ['user-1'],
};

const objectTypeData = {
  id: 'User',
  type: 'account',
  name: 'User',
  properties: {},
};

const store = createStore({
  state: { SharedStore: { governanceDevEnabled: true } },
});

function setup(props = {}) {
  return shallowMount(EditUnmanagedApplication, {
    global: {
      mocks: { $t: (k) => k },
    },
    props: {
      applicationId: 'app-1',
      ...props,
    },
  });
}

function setupFull(props = {}) {
  return mount(EditUnmanagedApplication, {
    global: {
      plugins: [store],
      mocks: { $t: (k) => k },
    },
    props: {
      applicationId: 'app-1',
      ...props,
    },
  });
}

describe('EditUnmanagedApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAgentConfig();
    ApplicationsApi.getApplication.mockResolvedValue({ data: appData });
    ApplicationsApi.updateApplication.mockResolvedValue({ data: appData });
    ApplicationsApi.deleteUnmanagedApplication.mockResolvedValue({});
    ApplicationsApi.getObjectType.mockResolvedValue({ data: objectTypeData });
    ApplicationsApi.updateObjectType.mockResolvedValue({ data: objectTypeData });
    GlossaryApi.saveGlossaryAttributesByAppId.mockResolvedValue({});
    GlossaryApi.updateGlossaryAttributesByAppId.mockResolvedValue({});
    ConfigApi.getConfig.mockResolvedValue({ data: { objects: [] } });
    ManagedResourceApi.getManagedResourceList.mockResolvedValue({ data: { result: [] } });
    AgentConfigApi.getAgentConfig.mockResolvedValue({ data: { templates: [{ id: 'aws.bedrock' }, { id: 'azure.openai' }] } });
    compareRealmSpecificResourceName.mockReturnValue(false);
  });

  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations after loading', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('shows spinner while loading', () => {
      ApplicationsApi.getApplication.mockReturnValue(new Promise(() => {}));
      const wrapper = setup();
      expect(wrapper.vm.isLoading).toBe(true);
    });

    it('shows app name after loading', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.applicationDetails.name).toBe('My App');
    });

    it('shows error state when load fails and no baseApplication', async () => {
      ApplicationsApi.getApplication.mockRejectedValue(new Error('not found'));
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.loadError).toBeTruthy();
    });

    it('uses baseApplication fallback when getApplication fails', async () => {
      ApplicationsApi.getApplication.mockRejectedValue(new Error('not found'));
      const wrapper = setup({ baseApplication: { ...appData, name: 'Fallback App' } });
      await flushPromises();
      expect(wrapper.vm.applicationDetails.name).toBe('Fallback App');
    });
  });

  describe('@actions', () => {
    it('initializes activeTabIndex to 0 for unknown tab prop', async () => {
      const wrapper = setup({ tab: 'nonexistent' });
      await flushPromises();
      expect(wrapper.vm.activeTabIndex).toBe(0);
    });

    it('initializes activeTabIndex correctly for known tab prop', async () => {
      const wrapper = setup({ tab: 'object-types' });
      await flushPromises();
      expect(wrapper.vm.activeTabIndex).toBe(1);
    });

    it('initializes activeTabIndex to the Objects tab for the objects slug', async () => {
      const wrapper = setup({ tab: 'objects' });
      await flushPromises();
      expect(wrapper.vm.activeTabIndex).toBe(2);
    });

    it('renders the third tab as the Objects explorer', async () => {
      const wrapper = setup({ tab: 'objects', objectTab: 'entitlements' });
      await flushPromises();

      expect(wrapper.vm.tabs).toEqual(['details', 'object-types', 'objects', 'import']);
      expect(wrapper.vm.activeTabIndex).toBe(2);
    });

    it('updateModel merges new value into applicationDetails', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.updateModel({ path: 'name', value: 'Updated Name' });
      expect(wrapper.vm.applicationDetails.name).toBe('Updated Name');
    });

    it('updateGlossaryModel sets glossaryData from event payload', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.updateGlossaryModel({ owner: 'alice' });
      expect(wrapper.vm.glossaryData).toEqual({ owner: 'alice' });
    });

    it('updateGlossaryModel sets glossaryData to {} when called with null', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.updateGlossaryModel(null);
      expect(wrapper.vm.glossaryData).toEqual({});
    });

    it('setGlossaryCreateFlag updates isGlossaryCreate', async () => {
      const wrapper = setup();
      await flushPromises();

      expect(wrapper.vm.isGlossaryCreate).toBe(false);
      wrapper.vm.setGlossaryCreateFlag(true);
      expect(wrapper.vm.isGlossaryCreate).toBe(true);
      wrapper.vm.setGlossaryCreateFlag(false);
      expect(wrapper.vm.isGlossaryCreate).toBe(false);
    });

    it('saveApp uses PUT when isGlossaryCreate is false', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.glossaryData = { department: 'Engineering' };
      await wrapper.vm.saveApp();
      await flushPromises();

      expect(GlossaryApi.saveGlossaryAttributesByAppId).not.toHaveBeenCalled();
      expect(GlossaryApi.updateGlossaryAttributesByAppId).toHaveBeenCalledWith('app-1', { department: 'Engineering' });
    });

    it('saveApp uses POST when isGlossaryCreate is true and resets flag after save', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.glossaryData = { department: 'Engineering' };
      wrapper.vm.isGlossaryCreate = true;
      await wrapper.vm.saveApp();
      await flushPromises();

      expect(GlossaryApi.saveGlossaryAttributesByAppId).toHaveBeenCalledWith('app-1', { department: 'Engineering' });
      expect(GlossaryApi.updateGlossaryAttributesByAppId).not.toHaveBeenCalled();
      expect(wrapper.vm.isGlossaryCreate).toBe(false);
    });

    it('saveApp skips glossary call when glossaryData is null', async () => {
      const wrapper = setup();
      await flushPromises();

      await wrapper.vm.saveApp();
      await flushPromises();

      expect(GlossaryApi.saveGlossaryAttributesByAppId).not.toHaveBeenCalled();
      expect(GlossaryApi.updateGlossaryAttributesByAppId).not.toHaveBeenCalled();
    });

    it('saveApp calls updateApplication with stripped metadata', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.applicationDetails = { ...appData, metadata: { createdDate: '2026-01-01' } };
      await wrapper.vm.saveApp();
      await flushPromises();

      const call = ApplicationsApi.updateApplication.mock.calls[0];
      expect(call[1].metadata).toBeUndefined();
    });

    it('saveApp calls showErrorMessage and resets isSaving on failure', async () => {
      ApplicationsApi.updateApplication.mockRejectedValue(new Error('server error'));
      const wrapper = setup();
      await flushPromises();

      await wrapper.vm.saveApp();
      await flushPromises();

      expect(showErrorMessage).toHaveBeenCalled();
      expect(wrapper.vm.isSaving).toBe(false);
    });

    it('deleteApp navigates away after successful delete', async () => {
      const wrapper = setup();
      await flushPromises();

      await wrapper.vm.deleteApp();
      await flushPromises();

      expect(ApplicationsApi.deleteUnmanagedApplication).toHaveBeenCalledWith('app-1');
      expect(mockRouterPush).toHaveBeenCalledWith('/applications');
    });

    it('deleteApp calls showErrorMessage and resets isDeleting on failure', async () => {
      ApplicationsApi.deleteUnmanagedApplication.mockRejectedValue(new Error('delete failed'));
      const wrapper = setup();
      await flushPromises();

      await wrapper.vm.deleteApp();
      await flushPromises();

      expect(showErrorMessage).toHaveBeenCalled();
      expect(wrapper.vm.isDeleting).toBe(false);
    });

    it('loadApplication refetches app data', async () => {
      const wrapper = setup();
      await flushPromises();

      ApplicationsApi.getApplication.mockResolvedValue({ data: { ...appData, name: 'Refreshed' } });
      await wrapper.vm.loadApplication();
      expect(wrapper.vm.applicationDetails.name).toBe('Refreshed');
    });

    it('populates relationshipProperty.value from ownerIds on load, including user display fields', async () => {
      ConfigApi.getConfig.mockResolvedValue({
        data: {
          objects: [
            { name: 'alpha_application', schema: { properties: { owners: {} } } },
            { name: 'alpha_user' },
          ],
        },
      });
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [{
            _id: 'user-1', userName: 'jdoe', givenName: 'Jane', sn: 'Doe',
          }],
        },
      });

      const wrapper = setup();
      await flushPromises();

      const [owner] = wrapper.vm.relationshipProperty.value;
      expect(owner._ref).toBe('managed/alpha_user/user-1');
      expect(owner._refResourceCollection).toBe('managed/alpha_user');
      expect(owner.userName).toBe('jdoe');
      expect(owner.givenName).toBe('Jane');
      expect(owner.sn).toBe('Doe');
    });

    it('updateModel with ownerIds updates ownerIds as plain IDs and syncs relationshipProperty', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.updateModel({
        path: 'ownerIds',
        value: [{
          _ref: 'managed/alpha_user/user-2',
          _refResourceCollection: 'managed/alpha_user',
          _refResourceId: 'user-2',
          _refProperties: {},
        }],
      });

      expect(wrapper.vm.applicationDetails.ownerIds).toEqual(['user-2']);
      expect(wrapper.vm.relationshipProperty.value[0]._ref).toBe('managed/alpha_user/user-2');
    });

    it('saveApp sends ownerIds as plain IDs in the payload', async () => {
      const wrapper = setup();
      await flushPromises();

      await wrapper.vm.saveApp();
      await flushPromises();

      const call = ApplicationsApi.updateApplication.mock.calls[0];
      expect(call[1].ownerIds).toEqual(['user-1']);
    });

    it('gracefully handles getConfig failure — relationshipProperty stays null', async () => {
      ConfigApi.getConfig.mockRejectedValue(new Error('network error'));
      const wrapper = setup();
      await flushPromises();

      expect(wrapper.vm.relationshipProperty).toBeNull();
      expect(wrapper.vm.applicationDetails.name).toBe('My App');
    });
  });

  describe('@object types boundary', () => {
    const boundaryAppData = {
      ...appData,
      objectTypes: [objectTypeData],
    };

    /**
     * Mounts the view with the real FrObjectTypes child (object-types tab
     * activated so the lazy application-details panel never renders) so the
     * application prop contract and the application-updated event boundary can
     * be exercised end to end at the parent-child boundary.
     *
     * @param {Object} application application data returned by getApplication
     * @returns {Object} mounted wrapper
     */
    function setupBoundary(application) {
      ApplicationsApi.getApplication.mockResolvedValue({ data: application });
      return setupFull({ tab: 'object-types' });
    }

    /**
     * Mirrors the DetailsForm save payload contract: metadata destructured out
     * (key omitted, not undefined), source included or omitted per selection.
     *
     * @param {Object} application the parent application state
     * @param {string|undefined} source selected source or undefined when cleared
     * @returns {Object} payload shape emitted by DetailsForm
     */
    function detailsPayload(application, source) {
      const { metadata, ...payload } = application;
      if (source) {
        payload.aiAgentSource = source;
      } else {
        delete payload.aiAgentSource;
      }
      return payload;
    }

    it('passes the full application including aiAgentSource to the object type editor', async () => {
      const application = { ...boundaryAppData, aiAgentSource: 'aws.bedrock' };
      const wrapper = setupBoundary(application);
      await flushPromises();

      const objectTypesComponent = wrapper.findComponent(ObjectTypes);
      expect(objectTypesComponent.exists()).toBe(true);
      expect(objectTypesComponent.props('application')).toEqual(application);
      expect(objectTypesComponent.props('applicationId')).toBe('app-1');
      expect(objectTypesComponent.props('objectTypes')).toEqual([objectTypeData]);
      expect(objectTypesComponent.props('logoSource')).toBeTruthy();
    });

    it('round-trips a Details source selection into applicationDetails and the next saveApp', async () => {
      const application = { ...boundaryAppData, metadata: { revision: 'r1' } };
      const wrapper = setupBoundary(application);
      await flushPromises();

      const detailsForm = wrapper.findComponent({ name: 'DetailsForm' });
      expect(detailsForm.exists()).toBe(true);
      detailsForm.vm.form.aiAgents = true;
      detailsForm.vm.form.agentSource = 'azure.openai';
      detailsForm.vm.saveHandler();
      await flushPromises();

      const objectPutPayload = ApplicationsApi.updateObjectType.mock.calls[0][2];
      expect(objectPutPayload).not.toHaveProperty('aiAgentSource');
      const [appPutId, appPutPayload] = ApplicationsApi.updateApplication.mock.calls[0];
      expect(appPutId).toBe('app-1');
      expect(appPutPayload.aiAgentSource).toBe('azure.openai');
      expect(appPutPayload.metadata).toBeUndefined();

      expect(wrapper.vm.applicationDetails.aiAgentSource).toBe('azure.openai');
      expect(wrapper.vm.applicationDetails.metadata).toEqual({ revision: 'r1' });

      await wrapper.vm.saveApp();
      await flushPromises();
      const [, nextPutPayload] = ApplicationsApi.updateApplication.mock.calls.pop();
      expect(nextPutPayload.aiAgentSource).toBe('azure.openai');
      expect(nextPutPayload.metadata).toBeUndefined();
    });

    it('round-trips a cleared Details source by removing it from applicationDetails', async () => {
      const application = { ...boundaryAppData, aiAgentSource: 'aws.bedrock' };
      const wrapper = setupBoundary(application);
      await flushPromises();

      const detailsForm = wrapper.findComponent({ name: 'DetailsForm' });
      expect(detailsForm.vm.form.aiAgents).toBe(true);
      expect(detailsForm.vm.form.agentSource).toBe('aws.bedrock');
      detailsForm.vm.form.aiAgents = false;
      detailsForm.vm.saveHandler();
      await flushPromises();

      // The Details form omits aiAgentSource entirely when cleared; the parent
      // must not retain the previous value or re-send it on the next save.
      expect(wrapper.vm.applicationDetails).not.toHaveProperty('aiAgentSource');

      await wrapper.vm.saveApp();
      await flushPromises();
      const [, nextPutPayload] = ApplicationsApi.updateApplication.mock.calls.pop();
      expect(nextPutPayload).not.toHaveProperty('aiAgentSource');
    });

    it('retains the prior application state when the Details application PUT fails', async () => {
      const application = { ...boundaryAppData, aiAgentSource: 'aws.bedrock' };
      ApplicationsApi.updateApplication.mockRejectedValueOnce(new Error('failed'));
      const wrapper = setupBoundary(application);
      await flushPromises();

      const detailsForm = wrapper.findComponent({ name: 'DetailsForm' });
      detailsForm.vm.form.aiAgents = true;
      detailsForm.vm.form.agentSource = 'azure.openai';
      detailsForm.vm.saveHandler();
      await flushPromises();

      expect(ApplicationsApi.updateApplication).toHaveBeenCalledWith('app-1', expect.objectContaining({ aiAgentSource: 'azure.openai' }));
      expect(showErrorMessage).toHaveBeenCalled();
      expect(wrapper.findComponent(ObjectTypes).vm.isSavingDetails).toBe(false);
      expect(wrapper.vm.applicationDetails.aiAgentSource).toBe('aws.bedrock');
    });

    it('does not leak an in-progress, unsaved Application Details edit into the object-type editor or its Details save', async () => {
      const application = { ...boundaryAppData, description: 'Original description' };
      const wrapper = setupBoundary(application);
      await flushPromises();

      // Live-edit the Application Details tab's model without saving it.
      wrapper.vm.updateModel({ path: 'description', value: 'Unsaved draft edit' });
      await flushPromises();
      expect(wrapper.vm.applicationDetails.description).toBe('Unsaved draft edit');

      // The object-type editor's application prop — and any Details save
      // built from it — must still reflect the last *saved* application
      // state, not the unconfirmed draft.
      const objectTypesComponent = wrapper.findComponent(ObjectTypes);
      expect(objectTypesComponent.props('application').description).toBe('Original description');

      const detailsForm = wrapper.findComponent({ name: 'DetailsForm' });
      detailsForm.vm.form.aiAgents = true;
      detailsForm.vm.form.agentSource = 'azure.openai';
      detailsForm.vm.saveHandler();
      await flushPromises();

      const [, appPutPayload] = ApplicationsApi.updateApplication.mock.calls[0];
      expect(appPutPayload.description).toBe('Original description');
      // The unsaved draft must survive the Details save untouched, ready for
      // the Application Details tab's own Save action.
      expect(wrapper.vm.applicationDetails.description).toBe('Unsaved draft edit');
    });

    it('adopts a Details payload while retaining metadata held outside the payload', async () => {
      const application = { ...boundaryAppData, metadata: { revision: 'r1' } };
      const wrapper = setupBoundary(application);
      await flushPromises();

      wrapper.vm.updateApplicationDetails(detailsPayload(application, 'azure.openai'));
      await flushPromises();

      expect(wrapper.vm.applicationDetails.aiAgentSource).toBe('azure.openai');
      expect(wrapper.vm.applicationDetails.metadata).toEqual({ revision: 'r1' });
    });
  });

  describe('@managed object name resolution', () => {
    it('assigns resource names from the first object matched by compareRealmSpecificResourceName', async () => {
      ConfigApi.getConfig.mockResolvedValue({
        data: {
          objects: [
            { name: 'alpha_user' },
            { name: 'alpha_role' },
            { name: 'alpha_organization' },
          ],
        },
      });
      compareRealmSpecificResourceName.mockImplementation((name, type) => name.endsWith(type));

      const wrapper = setup();
      await flushPromises();

      expect(wrapper.vm.userResourceName).toBe('alpha_user');
      expect(wrapper.vm.roleResourceName).toBe('alpha_role');
      expect(wrapper.vm.orgResourceName).toBe('alpha_organization');
    });

    it('falls back to defaults when no objects match', async () => {
      ConfigApi.getConfig.mockResolvedValue({ data: { objects: [{ name: 'something' }] } });
      compareRealmSpecificResourceName.mockReturnValue(false);

      const wrapper = setup();
      await flushPromises();

      expect(wrapper.vm.userResourceName).toBe('user');
      expect(wrapper.vm.roleResourceName).toBe('role');
      expect(wrapper.vm.orgResourceName).toBe('organization');
    });

    it('falls back to defaults and shows error when getConfig rejects', async () => {
      ConfigApi.getConfig.mockRejectedValue(new Error('config fetch failed'));

      const wrapper = setup();
      await flushPromises();

      expect(wrapper.vm.userResourceName).toBe('user');
      expect(wrapper.vm.roleResourceName).toBe('role');
      expect(wrapper.vm.orgResourceName).toBe('organization');
      expect(showErrorMessage).toHaveBeenCalled();
    });
  });
});
