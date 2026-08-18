/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { compareRealmSpecificResourceName } from '@forgerock/platform-shared/src/utils/realm';
import EditUnmanagedApplication from './EditUnmanagedApplication';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/ConfigApi');
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
};

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

describe('EditUnmanagedApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.getApplication.mockResolvedValue({ data: appData });
    ApplicationsApi.updateApplication.mockResolvedValue({ data: appData });
    ApplicationsApi.deleteUnmanagedApplication.mockResolvedValue({});
    GlossaryApi.saveGlossaryAttributesByAppId.mockResolvedValue({});
    GlossaryApi.updateGlossaryAttributesByAppId.mockResolvedValue({});
    ConfigApi.getConfig.mockResolvedValue({ data: { objects: [] } });
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
