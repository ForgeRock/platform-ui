/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import TimezoneOffset from './index';

describe('TimezoneOffset Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(TimezoneOffset, {
      mocks: {
        $t(val) { return val; },
      },
    });
  });

  it('TimezoneOffset successfully loaded', () => {
    expect(wrapper.name()).toEqual('TimezoneOffset');
  });

  it('display value is user friendly string', () => {
    wrapper.setProps({ value: '-7' });
    expect(wrapper.find('output').text()).toBe('GMT - 7:00');
  });

  it('contains link to timezone offset explanation', () => {
    expect(wrapper.find({ name: 'BLink' }).text()).toBe('timezone.linkText');
    expect(wrapper.find({ name: 'BLink' }).attributes('href')).toBe('https://www.timeanddate.com/time/zones/');
  });
});
