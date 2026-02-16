/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import SpinButton from './index';
import { runA11yTest } from '../../../utils/testHelpers';

describe('SpinButton', () => {
  function setup(props) {
    return mount(SpinButton, {
      props: { ...props, name: 'test-spin-button' },
    });
  }

  describe('component', () => {
    it('should render the component with default props', () => {
      const wrapper = setup();
      expect(wrapper.exists()).toBe(true);
    });

    it('should set the input value when value prop is passed', async () => {
      const wrapper = setup({ value: 5 });
      expect(wrapper.vm.$data.inputValue).toBe(5);
    });

    it('should emit input event when input value is changed', async () => {
      const wrapper = setup({ value: 5 });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$data.inputValue).toBe(5);
      wrapper.find('input').setValue(10);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted().input).toBeTruthy();
    });

    it('should increment value when increment button is clicked', async () => {
      const wrapper = setup({ value: 5 });
      await wrapper.vm.$nextTick();
      const incrementButton = wrapper.findAll('button[aria-label="Increment"]')[0];
      await wrapper.vm.$nextTick();
      expect(incrementButton.exists()).toBe(true);
      await incrementButton.trigger('mousedown');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.inputValue).toBe(6);
    });

    it('should decrement value when decrement button is clicked', async () => {
      const wrapper = setup({ value: 5 });
      await wrapper.vm.$nextTick();
      const downButton = wrapper.findAll('button[aria-label="Decrement"]')[0];
      await wrapper.vm.$nextTick();
      await downButton.trigger('mousedown');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.inputValue).toBe(4);
    });
  });

  describe('@a11y', () => {
    it('should have no accessibility violations', async () => {
      const wrapper = setup({ value: 5, disabled: true });
      await wrapper.vm.$nextTick();
      runA11yTest(wrapper);
    });
  });
});
