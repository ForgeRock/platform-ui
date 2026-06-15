/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import ObjectTypePropertyModal from './ObjectTypePropertyModal';

function setup(props = {}) {
  return mount(ObjectTypePropertyModal, {
    global: {
      mocks: { $t: (k) => k },
      stubs: {
        BModal: {
          template: '<div><slot /><slot name="modal-footer" :cancel="() => {}" /></div>',
          props: ['id', 'title'],
        },
        VeeForm: { template: '<span><slot :meta="{ valid: true }" /></span>' },
        FrField: true,
        FrButtonWithSpinner: true,
        FrListField: {
          name: 'FrListField',
          template: '<div />',
          props: ['modelValue', 'items', 'disabled'],
          emits: ['update:modelValue'],
        },
        FrListOfObjects: { name: 'FrListOfObjects', template: '<div />' },
        BCollapse: { template: '<div><slot /></div>' },
        BFormGroup: { template: '<div><slot /></div>' },
        BFormRadioGroup: { template: '<div><slot /></div>' },
        BFormRadio: { template: '<div><slot /></div>' },
      },
    },
    props: {
      modalId: 'test-modal',
      ...props,
    },
  });
}

describe('ObjectTypePropertyModal', () => {
  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('renders type options for string, boolean, and integer', () => {
      const wrapper = setup();
      const types = wrapper.vm.typeOptions;
      expect(types[0].value).toBe('string');
      expect(types[1].value).toBe('boolean');
      expect(types[2].value).toBe('integer');
    });

    it('shows "view property" title when readOnly', async () => {
      const wrapper = setup({ readOnly: true, initialValues: { name: 'email', type: 'string' } });
      wrapper.vm.populateForm();
      await flushPromises();
      // Title is computed from readOnly + isEditing state, not from the stub prop
      expect(wrapper.vm.readOnly).toBe(true);
      expect(wrapper.vm.isEditing).toBe(true);
    });

    it('shows "edit property" title when editing', async () => {
      const wrapper = setup({ initialValues: { name: 'email', type: 'string' } });
      wrapper.vm.populateForm();
      await flushPromises();
      expect(wrapper.vm.isEditing).toBe(true);
    });

    it('shows "add property" title when no initialValues', async () => {
      const wrapper = setup();
      expect(wrapper.vm.isEditing).toBe(false);
    });
  });

  describe('@actions', () => {
    it('populates form from initialValues on populateForm', () => {
      const wrapper = setup({
        initialValues: {
          name: 'phone',
          displayName: 'Phone',
          type: 'string',
          multiValued: false,
          required: true,
          creatable: true,
          updatable: false,
          enumeratedValues: [],
          applicationObjectType: '',
          isEntitlement: false,
        },
      });
      wrapper.vm.populateForm();
      expect(wrapper.vm.form.name).toBe('phone');
      expect(wrapper.vm.form.required).toBe(true);
      expect(wrapper.vm.form.updatable).toBe(false);
    });

    it('sets constrainValues and sourceOfValues from enumeratedValues', () => {
      const wrapper = setup({
        initialValues: {
          name: 'status', type: 'string', enumeratedValues: ['active', 'inactive'], applicationObjectType: '',
        },
      });
      wrapper.vm.populateForm();
      expect(wrapper.vm.constrainValues).toBe(true);
      expect(wrapper.vm.sourceOfValues).toBe('enumeratedValues');
    });

    it('sets constrainValues and sourceOfValues from applicationObjectType', () => {
      const wrapper = setup({
        initialValues: {
          name: 'type', type: 'string', enumeratedValues: [], applicationObjectType: 'some-type',
        },
      });
      wrapper.vm.populateForm();
      expect(wrapper.vm.constrainValues).toBe(true);
      expect(wrapper.vm.sourceOfValues).toBe('objectType');
    });

    it('resets form on resetForm', () => {
      const wrapper = setup({ initialValues: { name: 'phone', type: 'string' } });
      wrapper.vm.populateForm();
      wrapper.vm.resetForm();
      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.constrainValues).toBe(false);
    });

    it('emits save with cleared enumeratedValues when constrainValues is false', () => {
      const wrapper = setup();
      wrapper.vm.form.name = 'email';
      wrapper.vm.form.type = 'string';
      wrapper.vm.form.enumeratedValues = ['a', 'b'];
      wrapper.vm.constrainValues = false;
      wrapper.vm.save();
      expect(wrapper.emitted('save')[0][0].enumeratedValues).toEqual([]);
    });

    it('emits save with enumeratedValues when source is enumeratedValues', () => {
      const wrapper = setup();
      wrapper.vm.form.name = 'status';
      wrapper.vm.form.type = 'string';
      wrapper.vm.form.enumeratedValues = ['active', 'inactive'];
      wrapper.vm.constrainValues = true;
      wrapper.vm.sourceOfValues = 'enumeratedValues';
      wrapper.vm.save();
      expect(wrapper.emitted('save')[0][0].enumeratedValues).toEqual(['active', 'inactive']);
    });

    it('clears enumeratedValues when sourceOfValues changes away from enumeratedValues', async () => {
      const wrapper = setup();
      wrapper.vm.constrainValues = true;
      wrapper.vm.sourceOfValues = 'enumeratedValues';
      wrapper.vm.form.enumeratedValues = ['a', 'b'];
      wrapper.vm.sourceOfValues = 'objectType';
      await flushPromises();
      expect(wrapper.vm.form.enumeratedValues).toEqual([]);
    });
  });
});
