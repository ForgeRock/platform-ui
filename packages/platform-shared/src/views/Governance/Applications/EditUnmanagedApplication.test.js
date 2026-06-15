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
import EditUnmanagedApplication from './EditUnmanagedApplication';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/composables/breadcrumb', () => ({
  __esModule: true,
  default: () => ({ setBreadcrumb: jest.fn() }),
}));
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

    it('saveApp calls updateApplication with stripped metadata', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.applicationDetails = { ...appData, metadata: { createdDate: '2026-01-01' } };
      await wrapper.vm.saveApp();
      await flushPromises();

      const call = ApplicationsApi.updateApplication.mock.calls[0];
      expect(call[1].metadata).toBeUndefined();
    });

    it('saveApp also saves glossary when glossaryData is set', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.glossaryData = { department: 'Engineering' };
      wrapper.vm.isGlossaryCreate = true;
      await wrapper.vm.saveApp();
      await flushPromises();

      expect(GlossaryApi.saveGlossaryAttributesByAppId).toHaveBeenCalledWith('app-1', { department: 'Engineering' });
    });

    it('saveApp uses updateGlossaryAttributesByAppId when not a create', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.glossaryData = { department: 'Engineering' };
      wrapper.vm.isGlossaryCreate = false;
      await wrapper.vm.saveApp();
      await flushPromises();

      expect(GlossaryApi.updateGlossaryAttributesByAppId).toHaveBeenCalledWith('app-1', { department: 'Engineering' });
    });

    it('loadApplication refetches app data', async () => {
      const wrapper = setup();
      await flushPromises();

      ApplicationsApi.getApplication.mockResolvedValue({ data: { ...appData, name: 'Refreshed' } });
      await wrapper.vm.loadApplication();
      expect(wrapper.vm.applicationDetails.name).toBe('Refreshed');
    });
  });
});
