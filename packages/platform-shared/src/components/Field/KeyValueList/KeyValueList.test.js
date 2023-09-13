/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import i18n from '@/i18n';
import KeyValueList from './index';

describe('KeyValueList', () => {
  describe('unit tests', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(KeyValueList, {
        mocks: {
          $t: (key) => key,
        },
        $refs: {
          testField: {
            setErrors: () => Promise.resolve(true),
          },
        },
        propsData: {
          value: '',
          name: 'testField',
        },
      });
      wrapper.vm.$refs.testField.setErrors = jest.fn();
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

    it('does not delete item if currently editing an item', () => {
      wrapper.setData({
        keyValues: {
          en: 'value',
        },
        currentKey: '',
      });

      wrapper.vm.deleteItem('en');

      expect(wrapper.emitted()).toEqual({});
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
        currentKey: null,
      });

      expect(wrapper.vm.keyValueObject.value).toBe('');
      expect(wrapper.vm.keyValueObject.key).toBe('');
      expect(wrapper.vm.currentKey).toBeNull();
      wrapper.vm.editItem('en');
      expect(wrapper.vm.keyValueObject.value).toBe('value');
      expect(wrapper.vm.keyValueObject.key).toBe('en');
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

  describe('component tests', () => {
    function mountComponent(propsData, overrideData = {}) {
      const wrapper = mount(KeyValueList, {
        i18n,
        propsData: {
          value: '',
          name: 'testField',
          ...propsData,
        },
      });
      wrapper.setData(overrideData);
      return wrapper;
    }

    it('shows required error if field is required but not filled out', async () => {
      const wrapper = mountComponent({ validation: 'required', value: [{ key: 'initialValue' }] });
      await flushPromises();
      expect(wrapper.find('.list-group-item').exists()).toBe(true);
      expect(wrapper.find('#testfield0-error').exists()).toBe(false);
      const deleteButton = wrapper.find('.material-icons-outlined');
      deleteButton.trigger('click');
      await flushPromises();
      expect(wrapper.find('.list-group-item').exists()).toBe(false);
      expect(wrapper.find('#testfield0-error').text()).toBe(i18n.t('common.policyValidationMessages.REQUIRED'));
    });
  });
});
