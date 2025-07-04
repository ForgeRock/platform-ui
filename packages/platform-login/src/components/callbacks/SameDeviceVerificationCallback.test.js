/**
 * Copyright (c) 2025 Ping Identity. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { BButton } from 'bootstrap-vue';
import SameDeviceVerificationCallback from '@/components/callbacks/SameDeviceVerificationCallback';

describe('SameDeviceVerificationCallback', () => {
  it('should call setInputValue with "true" when button is clicked', async () => {
    const mockSetInputValue = jest.fn();

    const wrapper = mount(SameDeviceVerificationCallback, {
      props: {
        index: 0,
        callback: {
          setInputValue: mockSetInputValue,
        },
      },
      global: {
        components: {
          BButton,
        },
        mocks: {
          $t: (msg) => msg,
        },
      },
    });

    const button = wrapper.find('#continueOnDeviceBtn');
    await button.trigger('click');

    expect(mockSetInputValue).toHaveBeenCalledTimes(1);
    expect(mockSetInputValue).toHaveBeenCalledWith('true');
  });

  it('should render button with correct name and value attributes', () => {
    const wrapper = mount(SameDeviceVerificationCallback, {
      props: {
        index: 2,
        callback: {
          setInputValue: jest.fn(),
        },
      },
      global: {
        components: {
          BButton,
        },
        mocks: {
          $t: (msg) => msg,
        },
      },
    });

    const button = wrapper.find('#continueOnDeviceBtn');
    expect(button.attributes('name')).toBe('callback_2');
    expect(button.attributes('value')).toBe('true');
  });

  it('should render translated button text from $t', () => {
    const wrapper = mount(SameDeviceVerificationCallback, {
      props: {
        index: 1,
        callback: {
          setInputValue: jest.fn(),
        },
      },
      global: {
        components: {
          BButton,
        },
        mocks: {
          $t: (key) => (key === 'common.continueOnDevice'
            ? 'Continue on your device'
            : key),
        },
      },
    });

    const button = wrapper.find('#continueOnDeviceBtn');
    expect(button.text()).toBe('Continue on your device');
  });
});
