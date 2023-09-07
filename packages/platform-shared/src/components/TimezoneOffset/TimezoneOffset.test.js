/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import TimezoneOffset from './index';

describe('TimezoneOffset Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(TimezoneOffset, {
      global: {
        mocks: {
          $t(val) { return val; },
        },
        renderStubDefaultSlot: true,
      },
    });
  });

  it('display value is user friendly string', async () => {
    await wrapper.setProps({ value: -7 });
    expect(wrapper.find('output').text()).toBe('GMT - 7:00');
  });

  it('contains link to timezone offset explanation', () => {
    expect(wrapper.findComponent({ name: 'BLink' }).text()).toBe('timezone.linkText');
    expect(wrapper.findComponent({ name: 'BLink' }).attributes('href')).toBe('https://www.timeanddate.com/time/zones/');
  });
});
