/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import PasswordCallback from '@/components/callbacks/PasswordCallback';

let wrapper;
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  disconnect: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
}));

describe('PasswordCallback', () => {
  function mountComponent(label) {
    wrapper = mount(PasswordCallback, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        name: 'testField',
        type: 'password',
        label,
        value: '',
      },
    });
  }

  function mockLabelWidth(inputLabelWidth, aboveFieldLabelWidth) {
    wrapper.vm.inputLabelWidth = inputLabelWidth;
    wrapper.vm.aboveFieldLabelWidth = aboveFieldLabelWidth;
  }

  describe('successfully loaded', () => {
    it('PasswordCallback successfully loaded', () => {
      mountComponent('What\'s your favorite color?');
      expect(wrapper.name()).toEqual('PasswordCallback');
    });
  });

  describe('fetch labels', () => {
    it('fetching for the inputLabel and the aboveFieldLabel returns the elements', async () => {
      mountComponent('What\'s your favorite color?');
      await wrapper.vm.$forceUpdate();
      expect(wrapper.find('[data-test-id="aboveFieldLabel"]').exists()).toBe(true);
      expect(wrapper.find('.password-field .form-label-group-input label').exists()).toBe(true);
    });
  });

  describe('showLabelOverField', () => {
    it('showLabelOverField is false when label is not longer than input field', async () => {
      mountComponent('What\'s your favorite color?');
      mockLabelWidth(300, 150);
      await wrapper.vm.$forceUpdate();
      expect(wrapper.vm.showLabelOverField).toBe(false);
      expect(wrapper.find('[data-test-id="aboveFieldLabel"]').classes()).toContain('invisible', 'position-absolute', 'text-nowrap');
    });
    it('showLabelOverField is true when label is longer than input field', async () => {
      mountComponent('What was the name of the first dog your parents got you when you lived in the small house in Ohio?');
      mockLabelWidth(300, 400);
      await wrapper.vm.$forceUpdate();
      expect(wrapper.vm.showLabelOverField).toBe(true);
      expect(wrapper.find('[data-test-id="aboveFieldLabel"]').classes()).not.toContain('invisible', 'position-absolute', 'text-nowrap');
    });
  });
});
