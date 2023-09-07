/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import uuid from 'uuid/v4';
import Datepicker from './index';

jest.mock('uuid/v4');

describe('Datepicker Component', () => {
  it('contains a bootstrap datepicker', () => {
    const wrapper = mount(Datepicker, {
      props: {
        name: 'datepicker',
      },
    });
    const datepicker = findByTestId(wrapper, 'datepicker');

    expect(datepicker.exists()).toBe(true);
  });

  it('has placeholder text', () => {
    const wrapper = mount(Datepicker, {
      props: {
        name: 'datepicker',
        placeholder: 'test',
      },
    });
    const datepicker = findByTestId(wrapper, 'datepicker');

    expect(datepicker.find('.text-muted').text()).toBe('test');
  });

  it('floats placeholder text when a value is set', async () => {
    const wrapper = mount(Datepicker, {
      props: {
        name: 'datepicker',
        placeholder: 'test',
      },
    });
    expect(wrapper.find('.input-has-value').exists()).toBe(false);
    await wrapper.setProps({ value: 'John' });
    expect(wrapper.find('.input-has-value').exists()).toBe(true);
  });

  it('generates a name when the name property is empty', async () => {
    const uuidValue = 'b5fa8ea0-a8bc-4285-b34d-8ad4c6cec7d6';
    uuid.mockImplementation(() => uuidValue);
    const wrapper = mount(Datepicker, {
      props: {
        placeholder: 'test',
      },
    });
    expect(wrapper.vm.name).toBe(uuidValue);
  });
});
