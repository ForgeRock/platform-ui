/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules.umd';
import KeyValuePanel from './index';

describe('KeyValuePanel', () => {
  let wrapper;
  beforeEach(() => {
    extend('required', {
      ...required,
    });

    wrapper = mount(KeyValuePanel, {
      mocks: {
        $t: (key) => (key),
      },
      propsData: {
        value: {
          key: '',
          value: '',
        },
      },
    });
  });

  it('Can override default labels', async () => {
    await wrapper.setProps({
      value: {
        key: '',
        value: '',
        keyLabel: 'test key label',
        valueLabel: 'test value label',
      },
    });

    expect(wrapper.find('input').attributes('placeholder')).toBe('test key label');
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('test value label');
  });

  it('Falls back to default labels when no labels in value prop', () => {
    expect(wrapper.find('input').attributes('placeholder')).toBe('common.key');
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('common.value');
  });

  it('Will have a select with options when keyOptions prop is provided', async () => {
    await wrapper.setProps({
      value: {
        key: '',
        value: '',
      },
      keyOptions: [
        'option 1',
        'option 2',
      ],
    });

    expect(wrapper.find('input').attributes('class')).toBe('multiselect__input');
    const listElements = wrapper.findAll('li').wrappers;
    expect(listElements[0].text()).toBe('option 1');
    expect(listElements[1].text()).toBe('option 2');
  });

  it('Emits save-key-value event with the current key/value when clicking done', async () => {
    await wrapper.setProps({
      value: {
        key: 'test key',
        value: 'test value',
      },
    });
    const saveKeyValue = jest.spyOn(wrapper.vm, 'saveKeyValue');
    wrapper.find('button').trigger('click');
    expect(saveKeyValue).toHaveBeenCalled();

    expect(wrapper.emitted('save-key-value')).toBeTruthy();
    expect(wrapper.emitted('save-key-value')[0]).toEqual([{ key: 'test key', value: 'test value' }]);
  });

  describe('validateKey method', () => {
    it('prevents tagging if new key is already present in KeyValueList', async () => {
      await wrapper.setProps({
        value: {
          key: '',
          value: '',
        },
        allKeyOptions: [
          'option 1',
          'option 2',
        ],
        keyOptions: [
          'option 1',
        ],
      });

      expect(wrapper.vm.isTaggable).toBe(true);
      expect(wrapper.vm.availableKeyOptions).toEqual(['option 1']);

      wrapper.vm.validateKey('option 2');

      expect(wrapper.vm.isTaggable).toBe(false);
      expect(wrapper.vm.availableKeyOptions).toEqual([]);
    });

    it('allows tagging if new key is not present in KeyValueList', async () => {
      await wrapper.setProps({
        value: {
          key: '',
          value: '',
        },
        allKeyOptions: [
          'option 1',
          'option 2',
        ],
        keyOptions: [
          'option 1',
        ],
      });

      expect(wrapper.vm.isTaggable).toBe(true);
      expect(wrapper.vm.availableKeyOptions).toEqual(['option 1']);

      wrapper.vm.validateKey('option 3');

      expect(wrapper.vm.isTaggable).toBe(true);
      expect(wrapper.vm.availableKeyOptions).toEqual(['option 1']);
    });
  });
});
