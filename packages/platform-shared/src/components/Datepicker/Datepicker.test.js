/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import Datepicker from './index';

describe('Datepicker Component', () => {
  it('Datepicker successfully loaded', () => {
    const wrapper = mount(Datepicker);
    expect(wrapper.name()).toEqual('Datepicker');
  });

  it('contains a bootstrap datepicker', () => {
    const wrapper = mount(Datepicker);
    const datepicker = findByTestId(wrapper, 'datepicker');

    expect(datepicker.exists()).toBe(true);
  });

  it('has placeholder text', () => {
    const wrapper = mount(Datepicker, {
      propsData: {
        placeholder: 'test',
      },
    });
    const datepicker = findByTestId(wrapper, 'datepicker');

    expect(datepicker.find('.text-muted').text()).toBe('test');
  });

  it('floats placeholder text when a value is set', () => {
    const wrapper = mount(Datepicker, {
      propsData: {
        placeholder: 'test',
      },
    });
    expect(wrapper.find('.input-has-value').exists()).toBe(false);
    wrapper.setProps({ value: 'John' });
    expect(wrapper.find('.input-has-value').exists()).toBe(true);
  });
});
