/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import StringDisplay from './StringDisplay';

mockValidation(['required', 'email']);

describe('StringDisplay', () => {
  let wrapper;

  const defaultProps = {
    uiSchema: {
      label: 'Test Field',
      id: 'testField',
      value: '',
    },
    path: 'testField',
  };

  function mountComponent(props = {}) {
    return mount(StringDisplay, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('fieldName computed property', () => {
    it('uses nameProp value when provided', () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Label',
          id: 'testId',
          title: 'Test Title',
        },
        nameProp: 'title',
        path: 'testField',
      });
      expect(wrapper.vm.fieldName).toBe('Test Title');
    });

    it('uses label when nameProp is not provided', () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Label',
          id: 'testId',
        },
        path: 'testField',
      });
      expect(wrapper.vm.fieldName).toBe('Test Label');
    });

    it('uses id when nameProp and label are not provided', () => {
      wrapper = mountComponent({
        uiSchema: {
          id: 'testId',
        },
        path: 'testField',
      });
      expect(wrapper.vm.fieldName).toBe('testId');
    });
  });

  describe('valueChange method', () => {
    it('emits update:model event with path and value when field is not disabled', async () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: '',
          disabled: false,
        },
        path: 'testField',
      });

      await wrapper.vm.valueChange('new value');
      await flushPromises();

      expect(wrapper.emitted('update:model')).toBeTruthy();
      expect(wrapper.emitted('update:model')[0][0]).toEqual({
        path: 'testField',
        value: 'new value',
      });
    });

    it('does not emit update:model event when field is disabled', async () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: '',
          disabled: true,
        },
        path: 'testField',
      });

      await wrapper.vm.valueChange('new value');
      await flushPromises();

      expect(wrapper.emitted('update:model')).toBeFalsy();
    });

    it('calls handleChange to update vee-validate state when not disabled', async () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: '',
          disabled: false,
        },
        path: 'testField',
      });

      const handleChangeSpy = jest.spyOn(wrapper.vm, 'handleChange');
      await wrapper.vm.valueChange('new value');
      await flushPromises();

      expect(handleChangeSpy).toHaveBeenCalledWith('new value');
    });

    it('does not call handleChange when field is disabled', async () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: '',
          disabled: true,
        },
        path: 'testField',
      });

      const handleChangeSpy = jest.spyOn(wrapper.vm, 'handleChange');
      await wrapper.vm.valueChange('new value');
      await flushPromises();

      expect(handleChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('vee-validate integration', () => {
    it('uses path prop as the unique field identifier for vee-validate', () => {
      const path = 'unique.field.path';
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: '',
        },
        path,
      });

      // Verify the component mounts successfully with the path
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.props('path')).toBe(path);
    });
  });

  describe('edge cases', () => {
    it('handles empty uiSchema gracefully', () => {
      wrapper = mountComponent({
        uiSchema: {},
        path: 'testField',
      });

      expect(wrapper.vm.fieldName).toBeFalsy();
      const frField = wrapper.findComponent({ name: 'FrField' });
      expect(frField.exists()).toBe(true);
    });

    it('handles missing path prop', () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: 'test',
        },
        path: '',
      });

      expect(() => wrapper.vm.valueChange('new value')).not.toThrow();
    });

    it('handles undefined value in valueChange', async () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: 'initial',
          disabled: false,
        },
        path: 'testField',
      });

      await wrapper.vm.valueChange(undefined);
      await flushPromises();

      expect(wrapper.emitted('update:model')).toBeTruthy();
      expect(wrapper.emitted('update:model')[0][0]).toEqual({
        path: 'testField',
        value: undefined,
      });
    });

    it('handles null value in valueChange', async () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Test Field',
          value: 'initial',
          disabled: false,
        },
        path: 'testField',
      });

      await wrapper.vm.valueChange(null);
      await flushPromises();

      expect(wrapper.emitted('update:model')).toBeTruthy();
      expect(wrapper.emitted('update:model')[0][0]).toEqual({
        path: 'testField',
        value: null,
      });
    });
  });

  describe('readonly state', () => {
    it('allows value changes even when readonly is true (handled by FrField)', async () => {
      wrapper = mountComponent({
        uiSchema: {
          label: 'Readonly Field',
          value: 'initial',
          readonly: true,
          disabled: false,
        },
        path: 'testField',
      });

      // StringDisplay itself doesn't prevent changes for readonly, only for disabled
      await wrapper.vm.valueChange('new value');
      await flushPromises();

      expect(wrapper.emitted('update:model')).toBeTruthy();
    });
  });
});
