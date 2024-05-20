/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { findByText } from '../../../../utils/testHelpers';
import i18n from '@/i18n';
import KeyValuePanel from './index';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

describe('KeyValuePanel', () => {
  let wrapper;

  function setup(props) {
    wrapper = mount(KeyValuePanel, {
      global: {
        plugins: [i18n],
      },
      props: {
        value: {
          key: '',
          value: '',
        },
        ...props,
      },
    });
  }

  it('Can override default labels', async () => {
    setup({
      value: {
        key: '',
        value: '',
        keyLabel: 'test key label',
        valueLabel: 'test value label',
      },
    });
    await flushPromises();

    expect(wrapper.find('label').text()).toBe('test key label');
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('test value label');
  });

  it('Falls back to default labels when no labels in value prop', () => {
    setup();
    expect(wrapper.find('label').text()).toBe('Key');
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Value');
  });

  it('Will have a select with options when keyOptions prop is provided', async () => {
    setup({
      value: {
        key: '',
        value: '',
      },
      keyOptions: [
        'option 1',
        'option 2',
      ],
    });
    await flushPromises();

    expect(wrapper.find('input').attributes('class')).toBe('multiselect__input');
    const listElements = wrapper.findAll('li');
    expect(listElements[0].text()).toBe('option 1');
    expect(listElements[1].text()).toBe('option 2');
  });

  it('Emits save-key-value event with the current key/value when clicking done', async () => {
    setup({
      value: {
        key: 'test key',
        value: 'test value',
      },
    });
    await flushPromises();

    await findByText(wrapper, 'button', 'Done').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('save-key-value')).toBeTruthy();
    expect(wrapper.emitted('save-key-value')[0]).toEqual([{ key: 'test key', value: 'test value' }]);
  });

  describe('validateKey method', () => {
    it('prevents tagging if new key is already present in KeyValueList', async () => {
      setup({
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
      setup({
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
