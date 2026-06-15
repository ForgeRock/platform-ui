/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import GlossaryDetailsForm from './GlossaryDetailsForm';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));

const defaultProps = {
  userResourceName: 'alpha_user',
  roleResourceName: 'alpha_role',
  orgResourceName: 'alpha_organization',
  glossarySchema: [],
  modelValue: {},
};

function setup(props = {}) {
  return shallowMount(GlossaryDetailsForm, {
    global: {
      mocks: { $t: (k) => k },
    },
    props: { ...defaultProps, ...props },
  });
}

describe('GlossaryDetailsForm', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('renders form generator when not loading', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.html()).toContain('form-generator-stub');
    });

    it('shows form generator for schema with no pending relationship loads', async () => {
      const wrapper = setup({
        glossarySchema: [{
          name: 'department',
          displayName: 'Department',
          type: 'string',
          isMultiValue: false,
        }],
        modelValue: { department: 'Engineering' },
      });
      await flushPromises();
      expect(wrapper.html()).toContain('form-generator-stub');
    });
  });

  describe('@actions', () => {
    it('builds string schema field for primitive type attribute', async () => {
      const wrapper = setup({
        glossarySchema: [{
          name: 'department',
          displayName: 'Department',
          type: 'string',
          isMultiValue: false,
        }],
        modelValue: { department: 'Engineering' },
      });
      await flushPromises();
      expect(wrapper.vm.schema.length).toBe(1);
      expect(wrapper.vm.schema[0][0].type).toBe('string');
      expect(wrapper.vm.schema[0][0].model).toBe('department');
    });

    it('builds multiselect schema for multi-value string with enumerated values', async () => {
      const wrapper = setup({
        glossarySchema: [{
          name: 'tags',
          displayName: 'Tags',
          type: 'string',
          isMultiValue: true,
          enumeratedValues: ['tag1', 'tag2'],
        }],
        modelValue: {},
      });
      await flushPromises();
      expect(wrapper.vm.schema[0][0].type).toBe('multiselect');
    });

    it('builds array schema for multi-value string without enumerated values', async () => {
      const wrapper = setup({
        glossarySchema: [{
          name: 'aliases',
          displayName: 'Aliases',
          type: 'string',
          isMultiValue: true,
          enumeratedValues: [],
        }],
        modelValue: {},
      });
      await flushPromises();
      expect(wrapper.vm.schema[0][0].type).toBe('array');
    });

    it('emits update:modelValue on form change, cleaning empty values', async () => {
      const wrapper = setup({
        glossarySchema: [{
          name: 'department', displayName: 'Department', type: 'string', isMultiValue: false,
        }],
        modelValue: { department: 'Engineering', emptyField: '' },
      });
      await flushPromises();

      wrapper.vm.emitGlossaryValueUpdateEvent({ path: 'department', value: 'Finance' });

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      const emitted = wrapper.emitted('update:modelValue')[0][0];
      expect(emitted.department).toBe('Finance');
      expect(emitted.emptyField).toBeUndefined();
    });

    it('builds schema entry for managedObject attribute type', async () => {
      const wrapper = setup({
        userResourceName: 'alpha_user',
        glossarySchema: [{
          name: 'owner',
          displayName: 'Owner',
          type: 'managedObject',
          managedObjectType: '/openidm/managed/user',
          isMultiValue: false,
        }],
        modelValue: {},
      });
      await flushPromises();
      expect(wrapper.vm.schema.length).toBe(1);
      expect(wrapper.vm.schema[0][0].type).toBe('managedObject');
    });
  });
});
