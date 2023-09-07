/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import KeyValueList from './index';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

describe('KeyValueList', () => {
  describe('unit tests', () => {
    let wrapper;
    function setup(props) {
      wrapper = shallowMount(KeyValueList, {
        global: {
          mocks: {
            $t: (key) => key,
          },
        },
        props: {
          value: '',
          name: 'testField',
          ...props,
        },
      });
      wrapper.vm.validateField = jest.fn();
    }

    it('Saves new key value pair', async () => {
      setup({
        value: {
          en: 'value',
        },
      });

      wrapper.vm.saveKeyValue({ key: 'fr', value: 'frValue' });

      expect(wrapper.emitted().input).toEqual(
        [
          [
            {
              en: 'value',
              fr: 'frValue',
            },
          ],
        ],
      );
    });

    it('deletes item', () => {
      setup({
        value: {
          en: 'value',
        },
      });

      wrapper.vm.deleteItem('en');

      expect(wrapper.emitted().input).toEqual(
        [
          [
            {},
          ],
        ],
      );
    });

    it('does not delete item if currently editing an item', async () => {
      setup({
        value: {
          en: 'value',
        },
      });

      await wrapper.setData({
        currentKey: '',
      });

      wrapper.vm.deleteItem('en');

      expect(wrapper.emitted().input).toBeUndefined();
    });

    it('Edits existing value when key is left the same', async () => {
      setup({
        value: {
          en: 'value',
        },
      });

      await wrapper.setData({
        currentKey: 'en',
      });

      wrapper.vm.saveKeyValue({ key: 'en', value: 'enValue' });

      expect(wrapper.emitted().input).toEqual(
        [
          [
            {
              en: 'enValue',
            },
          ],
        ],
      );
    });

    it('Edits key when editItem is called', () => {
      setup({
        value: {
          en: 'value',
        },
      });

      expect(wrapper.vm.keyValueObject.value).toBe('');
      expect(wrapper.vm.keyValueObject.key).toBe('');
      expect(wrapper.vm.currentKey).toBeNull();
      wrapper.vm.editItem('en');
      expect(wrapper.vm.keyValueObject.value).toBe('value');
      expect(wrapper.vm.keyValueObject.key).toBe('en');
    });

    it('Hides the text indicating it is empty when it has saved values', async () => {
      setup({
        value: {
          en: 'value',
        },
      });
      await wrapper.setData({
        currentKey: 'en',
      });

      const emptyTextElement = wrapper.find('.fr-key-value-panel.text-center.py-3');
      expect(emptyTextElement.exists()).toBe(false);
    });
  });

  describe('component tests', () => {
    function mountComponent(propsData) {
      const wrapper = mount(KeyValueList, {
        global: {
          plugins: [i18n],
        },
        props: {
          value: '',
          name: 'testField',
          ...propsData,
        },
      });
      return wrapper;
    }

    it('shows required error if field is required but not filled out', async () => {
      const wrapper = mountComponent({ validation: 'required', value: [{ key: 'initialValue' }] });
      await flushPromises();
      expect(wrapper.find('.list-group-item').exists()).toBe(true);
      expect(wrapper.find('#testfield0-error').exists()).toBe(false);
      const deleteButton = wrapper.find('.material-icons-outlined');
      await deleteButton.trigger('click');
      expect(wrapper.find('.list-group-item').exists()).toBe(false);
      expect(wrapper.find('#testfield0-error').text()).toBe(i18n.global.t('common.policyValidationMessages.REQUIRED'));
    });
  });
});
