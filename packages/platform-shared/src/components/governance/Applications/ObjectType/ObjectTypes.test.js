/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import ObjectTypes from './ObjectTypes';

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

const objectTypeData = {
  id: 'User',
  type: 'account',
  name: 'User',
  properties: {},
};

function setup(props = {}) {
  return shallowMount(ObjectTypes, {
    global: {
      mocks: { $t: (k) => k },
    },
    props: {
      applicationId: 'app-1',
      objectTypes: [],
      ...props,
    },
  });
}

describe('ObjectTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.getObjectType.mockResolvedValue({ data: objectTypeData });
    ApplicationsApi.createObjectType.mockResolvedValue({ data: objectTypeData });
    ApplicationsApi.deleteObjectType.mockResolvedValue({});
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
});
