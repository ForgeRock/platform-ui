/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import UnmanagedApplicationImport from './UnmanagedApplicationImport';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({ bvModal: { value: { hide: jest.fn(), show: jest.fn() } } }),
}));

const application = {
  id: 'app-1',
  objectTypes: [{ name: 'User' }, { name: 'Roles' }],
};

const historyResponse = {
  data: { result: [{ id: 'upload-1', name: 'users.csv', uploadDate: '2026-01-01T00:00:00Z' }], totalCount: 1 },
};

function setup(props = {}) {
  return mount(UnmanagedApplicationImport, {
    global: {
      mocks: { $t: (k) => k },
      stubs: {
        ImportHistory: { name: 'ImportHistory', template: '<div />', props: ['items', 'isLoading', 'currentPage', 'perPage', 'totalRows', 'applicationId'] },
        FrField: true,
        FrButtonWithSpinner: true,
        FrAlert: true,
        FrSpinner: true,
        BCard: { template: '<div><slot /></div>' },
        BModal: { template: '<div />', props: ['id'] },
        BCollapse: { template: '<div><slot /></div>' },
        BFormFile: { template: '<div />', props: ['modelValue', 'accept'] },
        BButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
      },
    },
    props: {
      application,
      ...props,
    },
  });
}

describe('UnmanagedApplicationImport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.getApplicationFiles.mockResolvedValue(historyResponse);
    ApplicationsApi.uploadApplicationData.mockResolvedValue({});
    ApplicationsApi.detectApplicationDeletes.mockResolvedValue({ data: { counts: { 'app-1/User': 5 } } });
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
    it('loads history on mount', async () => {
      setup();
      await flushPromises();
      expect(ApplicationsApi.getApplicationFiles).toHaveBeenCalledWith('app-1', expect.any(Object));
    });

    it('passes history items to FrImportHistory', async () => {
      const wrapper = setup();
      await flushPromises();
      const history = wrapper.findComponent({ name: 'ImportHistory' });
      expect(history.props('items')).toHaveLength(1);
    });

    it('generates objectType options from application.objectTypes', async () => {
      const wrapper = setup();
      await flushPromises();
      const options = wrapper.vm.objectTypeOptions;
      expect(options).toEqual([
        { value: 'User', text: 'User' },
        { value: 'Roles', text: 'Roles' },
      ]);
    });
  });

  describe('@actions', () => {
    it('canUpload is false when selectedObjectType or csvFile is missing', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.canUpload).toBe(false);
      wrapper.vm.selectedObjectType = 'User';
      expect(wrapper.vm.canUpload).toBe(false);
      wrapper.vm.csvFile = new File(['data'], 'test.csv');
      expect(wrapper.vm.canUpload).toBe(true);
    });

    it('uploads data and reloads history on successful upload', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.selectedObjectType = 'User';
      wrapper.vm.csvFile = new File(['data'], 'test.csv');

      await wrapper.vm.upload();
      await flushPromises();

      expect(ApplicationsApi.uploadApplicationData).toHaveBeenCalledWith('app-1', expect.any(File), 'User', false, false);
      expect(wrapper.vm.csvFile).toBeNull();
      expect(wrapper.vm.selectedObjectType).toBe('');
      expect(ApplicationsApi.getApplicationFiles).toHaveBeenCalledTimes(2);
    });

    it('formats delete counts correctly', () => {
      const wrapper = setup();
      const result = wrapper.vm.formatDeleteCounts({ 'app/User': 3, 'app/Role': 1 });
      expect(result).toContain('3 Users');
      expect(result).toContain('1 Role');
    });

    it('reloads history on page-size-change', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.onPageSizeChange(20);
      await flushPromises();
      expect(wrapper.vm.perPage).toBe(20);
      expect(ApplicationsApi.getApplicationFiles).toHaveBeenCalledTimes(2);
    });

    it('resets delete detection state on modal hidden', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.deleteDetectionItem = { id: 'upload-1' };
      wrapper.vm.deleteCounts = { 'app/User': 2 };
      wrapper.vm.onDeleteDetectionModalHidden();
      expect(wrapper.vm.deleteDetectionItem).toBeNull();
      expect(wrapper.vm.deleteCounts).toBeNull();
    });
  });
});
