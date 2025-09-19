/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// GenericForm.spec.js
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import GenericForm from './GenericSelfService';

jest.mock('@forgerock/platform-shared/src/components/Field', () => ({
  __esModule: true,
  default: {
    name: 'FrField',
    template: `
      <input 
        v-bind="$attrs"
        :type="type === 'string' ? 'text' : type"
        :checked="type === 'checkbox' ? modelValue : null"
        v-model="modelValue" 
        @input="$emit('update:modelValue', type === 'number' ? Number($event.target.value) : $event.target.value)" 
        @change="type === 'checkbox' && $emit('update:modelValue', $event.target.checked)"
      />`,
    props: ['modelValue', 'type'],
  },
}));

describe('GenericSelfService', () => {
  const factory = (props = {}) => mount(GenericForm, {
    props: {
      selfServiceDetails: props.selfServiceDetails || {},
    },
    global: {
      stubs: {
        BFormGroup: { template: '<div><slot /></div>' },
        template: '<button @click="$emit(\'click\')"><slot /></button>',
      },
      mocks: {
        $t: (msg) => msg,
      },
    },
  });

  it('emits advanceStage with collected data when save button clicked', async () => {
    const wrapper = factory({
      selfServiceDetails: {
        requirements: {
          properties: {
            username: { type: 'string', description: 'User Name' },
          },
        },
      },
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    const input = wrapper.find('input[label="User Name"]');
    await input.setValue('username');
    await input.trigger('blur');
    await nextTick();
    await wrapper.find('button').trigger('click');
    await nextTick();
    expect(wrapper.emitted('advance-stage')).toBeTruthy();
  });
});
