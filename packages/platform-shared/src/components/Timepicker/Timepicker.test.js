/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import Timepicker from './index';
import { runA11yTest } from '../../utils/testHelpers';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});
describe('Timepicker Component', () => {
  it('contains a bootstrap timepicker', () => {
    wrapper = shallowMount(Timepicker);
    expect(wrapper.findComponent({ name: 'BFormTimepicker' }).exists()).toBe(true);
  });

  it('has placeholder text', async () => {
    wrapper = shallowMount(Timepicker, {
      props: {
        placeholder: 'test',
      },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: 'BFormTimepicker' }).attributes('placeholder')).toBe('test');
  });

  it('floats placeholder text when a value is set', async () => {
    wrapper = shallowMount(Timepicker, {
      props: {
        placeholder: 'test',
      },
    });
    expect(wrapper.find('.input-has-value').exists()).toBe(false);
    await wrapper.setProps({ value: 'John' });
    expect(wrapper.find('.input-has-value').exists()).toBe(true);
  });

  describe('@a11y', () => {
    it('Timepicker should be accessible', async () => {
      wrapper = mount(Timepicker, {
        props: {
          placeholder: 'Select time',
          value: '12:00',
        },
      });

      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
