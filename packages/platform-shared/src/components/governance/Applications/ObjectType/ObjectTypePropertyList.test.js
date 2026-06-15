/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import ObjectTypePropertyList from './ObjectTypePropertyList';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));

const baseObjectType = {
  id: 'User',
  type: 'account',
  properties: {
    id: { type: 'string', displayName: 'ID', order: 0 },
    displayName: { type: 'string', displayName: 'Display Name', order: 1 },
    email: { type: 'string', displayName: 'Email', order: 2 },
  },
};

function setup(props = {}) {
  return mount(ObjectTypePropertyList, {
    global: {
      mocks: { $t: (k) => k },
      stubs: {
        FrObjectTypePropertyModal: true,
        FrImportModal: true,
        FrActionsCell: true,
        FrIcon: { template: '<span><slot /></span>' },
        NoData: { name: 'FrNoData', template: '<div />' },
        FrSpinner: true,
        Draggable: {
          template: '<tbody><template v-for="(element, index) in modelValue" :key="element.name"><slot name="item" :element="element" :index="index" /></template></tbody>',
          props: ['modelValue', 'itemKey'],
          emits: ['update:modelValue', 'end'],
        },
      },
    },
    props: {
      applicationId: 'app-1',
      objectTypeId: 'User',
      objectType: baseObjectType,
      ...props,
    },
  });
}

describe('ObjectTypePropertyList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.updateObjectType.mockResolvedValue({ data: {} });
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
    it('renders table rows for each property sorted by order', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.rows).toHaveLength(3);
      expect(wrapper.vm.rows[0].name).toBe('id');
      expect(wrapper.vm.rows[1].name).toBe('displayName');
      expect(wrapper.vm.rows[2].name).toBe('email');
    });

    it('renders no-data when properties are empty', async () => {
      const wrapper = setup({ objectType: { ...baseObjectType, properties: {} } });
      await flushPromises();
      expect(wrapper.findComponent({ name: 'FrNoData' }).exists()).toBe(true);
    });

    it('does not render actions cell for system properties (id, displayName)', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.isSystemProperty('id')).toBe(true);
      expect(wrapper.vm.isSystemProperty('displayName')).toBe(true);
      expect(wrapper.vm.isSystemProperty('email')).toBe(false);
    });
  });

  describe('@actions', () => {
    it('adds a new property and emits update:objectType', async () => {
      const wrapper = setup();
      await flushPromises();

      await wrapper.vm.onAddProperty({
        name: 'phone',
        displayName: 'Phone',
        type: 'string',
        multiValued: false,
        required: false,
        creatable: true,
        updatable: true,
        enumeratedValues: [],
        applicationObjectType: '',
        isEntitlement: false,
      });
      await flushPromises();

      expect(ApplicationsApi.updateObjectType).toHaveBeenCalledWith('app-1', 'User', expect.objectContaining({
        properties: expect.objectContaining({ phone: expect.any(Object) }),
      }));
      expect(wrapper.emitted('update:objectType')).toBeTruthy();
    });

    it('deletes a property and emits update:objectType', async () => {
      const wrapper = setup();
      await flushPromises();

      const event = { stopPropagation: jest.fn() };
      await wrapper.vm.onDeleteProperty(event, { name: 'email' });
      await flushPromises();

      const emitted = wrapper.emitted('update:objectType')[0][0];
      expect(emitted.properties.email).toBeUndefined();
    });

    it('sets isSaving during add and resets after', async () => {
      let resolveFn;
      ApplicationsApi.updateObjectType.mockReturnValue(new Promise((r) => { resolveFn = r; }));
      const wrapper = setup();

      const addPromise = wrapper.vm.onAddProperty({
        name: 'phone',
        displayName: 'Phone',
        type: 'string',
        multiValued: false,
        required: false,
        creatable: true,
        updatable: true,
        enumeratedValues: [],
        applicationObjectType: '',
        isEntitlement: false,
      });
      expect(wrapper.vm.isSaving).toBe(true);
      resolveFn({ data: {} });
      await addPromise;
      expect(wrapper.vm.isSaving).toBe(false);
    });

    it('sets isSaving during importSchema and resets after', async () => {
      const wrapper = setup();
      await flushPromises();
      const promise = wrapper.vm.importSchema({ newProp: { type: 'string' } });
      expect(wrapper.vm.isSaving).toBe(true);
      await promise;
      expect(wrapper.vm.isSaving).toBe(false);
    });

    it('builds correct payload for multiValued property', () => {
      const wrapper = setup();
      const payload = wrapper.vm.buildPropertyPayload({
        type: 'string',
        multiValued: true,
        required: false,
        creatable: true,
        updatable: true,
        enumeratedValues: [],
        applicationObjectType: '',
        isEntitlement: false,
      });
      expect(payload.type).toBe('array');
      expect(payload.items).toEqual({ type: 'string' });
    });

    it('builds NOT_CREATABLE / NOT_UPDATEABLE flags correctly', () => {
      const wrapper = setup();
      const payload = wrapper.vm.buildPropertyPayload({
        type: 'string',
        multiValued: false,
        required: false,
        creatable: false,
        updatable: false,
        enumeratedValues: [],
        applicationObjectType: '',
        isEntitlement: false,
      });
      expect(payload.flags).toContain('NOT_CREATABLE');
      expect(payload.flags).toContain('NOT_UPDATEABLE');
    });
  });
});
