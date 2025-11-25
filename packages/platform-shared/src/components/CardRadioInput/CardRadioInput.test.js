/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import CardRadioInput from './index';
import { runA11yTest } from '../../utils/testHelpers';

describe('CardRadioInput Component', () => {
  let wrapper;
  describe('@a11y', () => {
    function setup(props = {}, slotContent = '') {
      wrapper = mount(CardRadioInput, {
        props: {
          ...props,
        },
        slots: {
          default: slotContent,
        },
      });
      return wrapper;
    }

    it('should pass accessibility tests when the radioValue is set', async () => {
      wrapper = setup({ radioValue: true }, '<div>Test Content</div>');
      await runA11yTest(wrapper);
    });

    it('should pass accessibility tests when radio button is disabled', async () => {
      wrapper = setup({ disabled: true }, '<div>Test Content</div>');
      await runA11yTest(wrapper);
    });

    it('should pass accessibility tests when value is provided', async () => {
      wrapper = setup({ value: true }, '<div>Test Content</div>');
      await runA11yTest(wrapper);
    });
  });

  describe('Component behavior', () => {
    it('uses a card containing value text by default', () => {
      wrapper = shallowMount(CardRadioInput, {
        global: {
          renderStubDefaultSlot: true,
        },
        props: {
          radioValue: 'test',
        },
      });
      expect(wrapper.find('b-card-stub').exists()).toBe(true);
      expect(wrapper.find('b-card-stub').text()).toEqual('test');
    });

    it('default slot will allow for custom content within card', () => {
      wrapper = shallowMount(CardRadioInput, {
        global: {
          renderStubDefaultSlot: true,
        },
        props: {
          radioValue: 'test',
        },
        slots: {
          default: '<code></code>',
        },
      });
      expect(wrapper.find('b-card-stub').exists()).toBe(true);
      expect(wrapper.text()).toEqual('');
      expect(wrapper.find('code').exists()).toBe(true);
    });
  });
});
