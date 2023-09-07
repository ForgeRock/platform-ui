/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import KeyValueList from './index';

describe('KeyValueList', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(KeyValueList, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        schema: {
          properties: {},
        },
      },
    });
  });

  it('Saves new key value pair', async () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: '',
    });

    wrapper.vm.saveKeyValue({ key: 'fr', value: 'frValue' });

    expect(wrapper.emitted().input).toEqual([
      [
        {
          en: 'value',
          fr: 'frValue',
        },
      ],
    ]);
  });

  it('Edits existing value when key is left the same', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });

    wrapper.vm.saveKeyValue({ key: 'en', value: 'enValue' });

    expect(wrapper.emitted().input).toEqual([
      [
        {
          en: 'enValue',
        },
      ],
    ]);
  });

  it('Edits existing key when key is changed', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });

    wrapper.vm.saveKeyValue({ key: 'fr', value: 'frValue' });

    expect(wrapper.emitted().input).toEqual([
      [
        {
          fr: 'frValue',
        },
      ],
    ]);
  });

  it('Displays text indicating when it is empty', () => {
    const emptyTextElement = wrapper.find('.fr-key-value-panel.text-center.py-3');
    expect(emptyTextElement.exists()).toBe(true);
    expect(emptyTextElement.text()).toBe('()');
  });

  it('Hides the text indicating it is empty when adding a first value', async () => {
    wrapper.find('.fr-key-link').trigger('click');
    await flushPromises();
    const emptyTextElement = wrapper.find('.fr-key-value-panel.text-center.py-3');
    expect(emptyTextElement.exists()).toBe(false);
  });

  it('Hides the text indicating it is empty when it has saved values', async () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });
    await flushPromises();

    const emptyTextElement = wrapper.find('.fr-key-value-panel.text-center.py-3');
    expect(emptyTextElement.exists()).toBe(false);
  });
});
