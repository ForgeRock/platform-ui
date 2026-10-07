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
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import ObjectTypes from './ObjectTypes';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AgentConfigApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({ bvModal: { value: { hide: jest.fn(), show: jest.fn() } } }),
}));

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
  return shallowMount(ObjectTypes, {
    global: {
      plugins: [store],
      mocks: { $t: (k) => k },
    },
    props: {
      applicationId: 'app-1',
      objectTypes: [],
      ...props,
    },
  });
}

function setupFull(props = {}) {
  return mount(ObjectTypes, {
    global: {
      plugins: [store],
      mocks: { $t: (k) => k },
    },
    props: {
      applicationId: 'app-1',
      objectTypes: [],
      ...props,
    },
  });
}

function setupFlagged(flagEnabled) {
  return shallowMount(ObjectTypes, {
    global: {
      plugins: [createStore({ state: { SharedStore: { governanceDevEnabled: flagEnabled } } })],
      mocks: { $t: (k) => k },
    },
    props: {
      applicationId: 'app-1',
      objectTypes: [objectTypeData],
    },
  });
}

describe('ObjectTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.getObjectType.mockResolvedValue({ data: objectTypeData });
    ApplicationsApi.createObjectType.mockResolvedValue({ data: objectTypeData });
    ApplicationsApi.deleteObjectType.mockResolvedValue({});
    ApplicationsApi.updateObjectType.mockResolvedValue({ data: objectTypeData });
    ApplicationsApi.updateApplication.mockResolvedValue({ data: {} });
    AgentConfigApi.getAgentConfig.mockResolvedValue({ data: { templates: [] } });
  });

  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('shows no-data when objectTypes list is empty', async () => {
      const wrapper = setup({ objectTypes: [] });
      await flushPromises();
      expect(wrapper.html()).toContain('no-data-stub');
    });

    it('shows card with dropdown when objectTypes are present', async () => {
      const wrapper = setup({ objectTypes: [objectTypeData] });
      await flushPromises();
      expect(wrapper.html()).toContain('b-card-stub');
    });

    it('detects hasAccountType correctly', async () => {
      const wrapper = setup({ objectTypes: [{ id: 'User', type: 'account', name: 'User' }] });
      await flushPromises();
      expect(wrapper.vm.hasAccountType).toBe(true);
    });

    it('loads object type on mount when objectTypes are present', async () => {
      setup({ objectTypes: [objectTypeData] });
      await flushPromises();
      expect(ApplicationsApi.getObjectType).toHaveBeenCalledWith('app-1', 'User');
    });
  });

  describe('@actions', () => {
    it('adds a new object type and emits object-type-added', async () => {
      const wrapper = setup({ objectTypes: [] });
      await flushPromises();

      wrapper.vm.addForm.id = 'Resource';
      wrapper.vm.addForm.type = 'resource';
      await wrapper.vm.addObjectType();
      await flushPromises();

      expect(ApplicationsApi.createObjectType).toHaveBeenCalledWith('app-1', expect.objectContaining({
        id: 'Resource',
        type: 'resource',
      }));
      expect(wrapper.emitted('object-type-added')).toBeTruthy();
    });

    it('deletes an object type and emits object-type-deleted', async () => {
      const wrapper = setup({ objectTypes: [objectTypeData] });
      await flushPromises();

      await wrapper.vm.removeObjectType();
      await flushPromises();

      expect(ApplicationsApi.deleteObjectType).toHaveBeenCalledWith('app-1', 'User');
      expect(wrapper.emitted('object-type-deleted')).toBeTruthy();
    });

    it('resets addForm on resetAddForm', async () => {
      const wrapper = setup();
      wrapper.vm.addForm.id = 'Filled';
      wrapper.vm.resetAddForm();
      expect(wrapper.vm.addForm.id).toBe('');
    });

    it('initializes add form to resource type when hasAccountType', async () => {
      const wrapper = setup({ objectTypes: [{ id: 'User', type: 'account', name: 'User' }] });
      await flushPromises();
      wrapper.vm.initAddForm();
      expect(wrapper.vm.addForm.type).toBe('resource');
    });

    it('shows error and sets loadedObjectType to null on getObjectType failure', async () => {
      ApplicationsApi.getObjectType.mockRejectedValue(new Error('not found'));
      const wrapper = setup({ objectTypes: [objectTypeData] });
      await flushPromises();
      expect(wrapper.vm.loadedObjectType).toBeNull();
    });
  });

  describe('@details', () => {
    it('omits the Details tab when governanceDevEnabled is off, leaving Properties first', async () => {
      const wrapper = setupFlagged(false);
      await flushPromises();

      expect(wrapper.vm.navItems.map((item) => item.displayName)).toEqual([
        'governance.applications.edit.objectTypesTab.propertiesTab',
        'governance.applications.edit.objectTypesTab.dataTab',
        'governance.unmanagedApplications.correlationTab.navLabel',
      ]);
      expect(wrapper.vm.selectedInnerTab).toBe(0);
    });

    it('shows the Details tab when governanceDevEnabled is on', async () => {
      const wrapper = setupFlagged(true);
      await flushPromises();

      expect(wrapper.vm.navItems[0].displayName).toBe('governance.applications.edit.objectTypesTab.details.navLabel');
    });

    it('places Details before Properties, Data, and account-only Correlation in nav order', async () => {
      const wrapper = setup({ objectTypes: [objectTypeData] });
      await flushPromises();

      expect(wrapper.vm.navItems.map((item) => item.displayName)).toEqual([
        'governance.applications.edit.objectTypesTab.details.navLabel',
        'governance.applications.edit.objectTypesTab.propertiesTab',
        'governance.applications.edit.objectTypesTab.dataTab',
        'governance.unmanagedApplications.correlationTab.navLabel',
        'governance.applications.edit.objectTypesTab.agentClassification.title',
      ]);
    });

    it('places Details before Properties and Data for resource object types with no Correlation tab', async () => {
      const resourceType = {
        id: 'Device', type: 'resource', name: 'Device', properties: {},
      };
      ApplicationsApi.getObjectType.mockResolvedValueOnce({ data: resourceType });
      const wrapper = setup({ objectTypes: [resourceType] });
      await flushPromises();

      expect(wrapper.vm.navItems.map((item) => item.displayName)).toEqual([
        'governance.applications.edit.objectTypesTab.details.navLabel',
        'governance.applications.edit.objectTypesTab.propertiesTab',
        'governance.applications.edit.objectTypesTab.dataTab',
      ]);
    });

    it('passes the loaded object type and application to the Details form', async () => {
      const application = { id: 'app-1', name: 'App', aiAgentSource: 'aws.bedrock' };
      const wrapper = setupFull({ objectTypes: [objectTypeData], application });
      await flushPromises();

      const detailsForm = wrapper.findComponent({ name: 'DetailsForm' });
      expect(detailsForm.exists()).toBe(true);
      expect(detailsForm.props('objectType')).toEqual(objectTypeData);
      expect(detailsForm.props('application')).toEqual(application);
    });

    it('resets the inner tab when switching object types', async () => {
      const secondType = {
        id: 'Device', type: 'resource', name: 'Device', properties: {},
      };
      const wrapper = setup({ objectTypes: [objectTypeData, secondType] });
      await flushPromises();

      wrapper.vm.selectedInnerTab = 2;
      wrapper.vm.selectedObjectTypeTab = 1;
      await flushPromises();

      expect(wrapper.vm.selectedInnerTab).toBe(0);
    });

    it('issues both object-type and application PUTs and emits the updated application on Details save', async () => {
      const application = { id: 'app-1', name: 'App' };
      const wrapper = setup({ objectTypes: [objectTypeData], application });
      await flushPromises();

      const objectTypePayload = { ...objectTypeData, isNHI: false };
      const applicationPayload = { id: 'app-1', name: 'App', aiAgentSource: 'aws.bedrock' };
      await wrapper.vm.saveDetails({ objectType: objectTypePayload, application: applicationPayload });

      expect(ApplicationsApi.updateObjectType).toHaveBeenCalledWith('app-1', 'User', objectTypePayload);
      expect(ApplicationsApi.updateApplication).toHaveBeenCalledWith('app-1', applicationPayload);
      expect(wrapper.vm.loadedObjectType).toEqual(objectTypePayload);
      expect(wrapper.emitted('applicationUpdated')[0][0]).toEqual(applicationPayload);
      expect(wrapper.vm.isSavingDetails).toBe(false);
    });

    it('skips the application PUT and update event when the parent provides no application', async () => {
      const wrapper = setup({ objectTypes: [objectTypeData] });
      await flushPromises();

      const objectTypePayload = { ...objectTypeData, isNHI: false };
      await wrapper.vm.saveDetails({ objectType: objectTypePayload, application: {} });

      expect(ApplicationsApi.updateObjectType).toHaveBeenCalledWith('app-1', 'User', objectTypePayload);
      expect(ApplicationsApi.updateApplication).not.toHaveBeenCalled();
      expect(wrapper.emitted('applicationUpdated')).toBeFalsy();
      expect(wrapper.vm.loadedObjectType).toEqual(objectTypePayload);
      expect(wrapper.vm.isSavingDetails).toBe(false);
      expect(showErrorMessage).not.toHaveBeenCalled();
    });

    it('clears the saving indicator and retains the prior object type when the object-type PUT fails, but still adopts a successful application update', async () => {
      ApplicationsApi.updateObjectType.mockRejectedValueOnce(new Error('failed'));
      const wrapper = setup({ objectTypes: [objectTypeData], application: { id: 'app-1' } });
      await flushPromises();

      const objectTypePayload = { ...objectTypeData, isNHI: true };
      const applicationPayload = { id: 'app-1', aiAgentSource: 'aws.bedrock' };
      await wrapper.vm.saveDetails({ objectType: objectTypePayload, application: applicationPayload });

      expect(wrapper.vm.isSavingDetails).toBe(false);
      expect(wrapper.vm.loadedObjectType).toEqual(objectTypeData);
      expect(wrapper.emitted('applicationUpdated')[0][0]).toEqual(applicationPayload);
      expect(showErrorMessage).toHaveBeenCalled();
    });

    it('clears the saving indicator and adopts the new object type even when the application PUT fails', async () => {
      ApplicationsApi.updateApplication.mockRejectedValueOnce(new Error('failed'));
      const wrapper = setup({ objectTypes: [objectTypeData], application: { id: 'app-1' } });
      await flushPromises();

      const objectTypePayload = { ...objectTypeData, isNHI: true };
      await wrapper.vm.saveDetails({ objectType: objectTypePayload, application: { id: 'app-1' } });

      expect(wrapper.vm.isSavingDetails).toBe(false);
      // The object-type PUT succeeded independently, so local state advances
      // to match the backend — retrying re-sends the same, already-applied
      // object-type payload harmlessly rather than diverging from it.
      expect(wrapper.vm.loadedObjectType).toEqual(objectTypePayload);
      expect(wrapper.emitted('applicationUpdated')).toBeFalsy();
      expect(showErrorMessage).toHaveBeenCalled();
    });

    it('does not clobber a mid-save object-type switch with the saved type', async () => {
      const secondType = {
        id: 'Device', type: 'resource', name: 'Device', properties: {},
      };
      const wrapper = setup({
        objectTypes: [objectTypeData, secondType],
        application: { id: 'app-1' },
      });
      await flushPromises();

      // Save type A with a deferred request, then switch to type B before it resolves.
      let resolveObjectSave;
      ApplicationsApi.updateObjectType.mockReturnValueOnce(new Promise((resolve) => {
        resolveObjectSave = resolve;
      }));
      const objectTypePayload = { ...objectTypeData, isNHI: true };
      const savePromise = wrapper.vm.saveDetails({ objectType: objectTypePayload, application: { id: 'app-1' } });

      ApplicationsApi.getObjectType.mockResolvedValueOnce({ data: secondType });
      wrapper.vm.selectedObjectTypeTab = 1;
      await flushPromises();
      expect(wrapper.vm.loadedObjectType).toEqual(secondType);

      // A's resolution must not reassign loadedObjectType back to A under a B header.
      resolveObjectSave({ data: {} });
      await savePromise;
      await flushPromises();

      expect(wrapper.vm.loadedObjectType).toEqual(secondType);
      expect(wrapper.vm.isSavingDetails).toBe(false);
      expect(showErrorMessage).not.toHaveBeenCalled();
    });
  });
});
