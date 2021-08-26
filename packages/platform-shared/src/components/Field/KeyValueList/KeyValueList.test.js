/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import KeyValueList from './index';

describe('KeyValueList', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(KeyValueList, {
      mocks: {
        $t: (key) => {
          const translationMap = {
            'trees.editPanel.none': 'none',
            'trees.editPanel.key': 'key',
            'trees.editPanel.value': 'value',
          };
          return translationMap[key];
        },
        setValidationRules: () => ({}),
      },
      propsData: {
        value: '',
        name: 'testField',
      },
    });
  });

  it('Key Value successfully loaded', () => {
    expect(wrapper.name()).toEqual('KeyValueList');
  });

  it('Saves new key value pair', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: '',
    });

    wrapper.vm.saveKeyValue({ key: 'fr', value: 'frValue' });

    expect(wrapper.emitted()).toEqual({
      input: [
        [
          {
            en: 'value',
            fr: 'frValue',
          },
        ],
      ],
    });
  });

  it('deletes item', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: '',
    });

    wrapper.vm.deleteItem('en');

    expect(wrapper.emitted()).toEqual({
      input: [
        [
          {},
        ],
      ],
    });
  });

  it('Edits existing value when key is left the same', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });

    wrapper.vm.saveKeyValue({ key: 'en', value: 'enValue' });

    expect(wrapper.emitted()).toEqual({
      input: [
        [
          {
            en: 'enValue',
          },
        ],
      ],
    });
  });

  it('Edits key when editItem is called', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });

    expect(wrapper.vm.keyValueObject.value).toBe('');
    expect(wrapper.vm.keyValueObject.key).toBe('');
    expect(wrapper.vm.currentKey).toBe('en');
    wrapper.vm.editItem('en');
    expect(wrapper.vm.keyValueObject.value).toBe('value');
    expect(wrapper.vm.keyValueObject.key).toBe('en');
  });

  it('Displays text indicating when it is empty', () => {
    wrapper.setData({
      keyValues: {},
      currentKey: null,
    });
    const emptyTextElement = wrapper.find('.fr-key-value-panel.text-center.py-3');
    expect(emptyTextElement.exists()).toBe(true);
    expect(emptyTextElement.text()).toBe('(none)');
  });

  it('Hides the text indicating it is empty when adding a first value', () => {
    wrapper.setData({
      keyValues: {},
      currentKey: null,
    });
    wrapper.find('.mr-1.mb-1').trigger('click');
    const emptyTextElement = wrapper.find('.fr-key-value-panel.text-center.py-3');
    expect(emptyTextElement.exists()).toBe(false);
  });

  it('Hides the text indicating it is empty when it has saved values', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });

    const emptyTextElement = wrapper.find('.fr-key-value-panel.text-center.py-3');
    expect(emptyTextElement.exists()).toBe(false);
  });
});
