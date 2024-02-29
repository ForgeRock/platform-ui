/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import dayjs from 'dayjs';
import TimeConstraint from './index';

jest.mock('dayjs');

describe('TimeConstraint Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(TimeConstraint, {
      global: {
        mocks: {
          $t(val) { return val; },
        },
        renderStubDefaultSlot: true,
      },
      props: {
        value: '2020-01-02T12:00:00.000Z/2020-01-03T13:00:00.000Z',
      },
    });
  });
  jest.useFakeTimers().setSystemTime(new Date('2077-01-01'));

  dayjs.mockImplementation(() => ({
    add: () => dayjs(),
    subtract: () => dayjs(),
    year: () => 2077,
    month: () => 1,
    date: () => 1,
    hour: () => 0,
    minute: () => 0,
    isAfter: () => false,
    toISOString: () => '',
    utcOffset: () => 0,
  }));

  it('contains two datepickers, two timepickers, and one offset selector', () => {
    const datepickers = wrapper.findAllComponents({ name: 'Datepicker' });
    expect(datepickers[0].exists()).toBe(true);
    expect(datepickers[1].exists()).toBe(true);
    const timepickers = wrapper.findAllComponents({ name: 'Timepicker' });
    expect(timepickers[0].exists()).toBe(true);
    expect(timepickers[1].exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'TimezoneOffset' }).exists()).toBe(true);
  });

  // TODO Server has a different timezone so tests that pass locally fail on server.
  // Need to find a way to test component properly.

  // it('takes an iso range as value and properly sets child component values', () => {
  //   const datepickers = wrapper.findAll({ name: 'Datepicker' });
  //   expect(datepickers[0].attributes('value')).toBe('2020-1-2');
  //   expect(datepickers[1].attributes('value')).toBe('2020-1-3');
  //   const timepickers = wrapper.findAll({ name: 'Timepicker' });
  //   expect(timepickers[0].attributes('value')).toBe('4:0:00');
  //   expect(timepickers[1].attributes('value')).toBe('5:0:00');
  // });

  // it('moving start past end will adjust end to be equal to start', () => {
  //   wrapper.setData({ startDate: '2020-1-04' });
  //   expect(wrapper.vm.$data.endDate).toBe('2020-1-04');
  //   expect(wrapper.vm.$data.endTime).toBe('4:0:00');
  //   expect(wrapper.vm.$data.endISO).toBe('2020-01-04T12:00:00.000Z');
  // });

  // it('moving end date before start till adjust start to be equal to end', () => {
  //   wrapper.setData({ endDate: '2020-1-01' });
  //   expect(wrapper.vm.$data.startDate).toBe('2020-1-01');
  //   expect(wrapper.vm.$data.startTime).toBe('5:0:00');
  //   expect(wrapper.vm.$data.startISO).toBe('2020-01-01T13:00:00.000Z');
  // });

  // it('changing the offset changes both ISO strings in the range', () => {
  //   expect(wrapper.vm.$data.startISO).toBe('2020-01-02T12:00:00.000Z');
  //   expect(wrapper.vm.$data.endISO).toBe('2020-01-03T13:00:00.000Z');
  //   wrapper.setData({ offset: -4 });
  //   expect(wrapper.vm.$data.startISO).toBe('2020-01-02T08:00:00.000Z');
  //   expect(wrapper.vm.$data.endISO).toBe('2020-01-03T09:00:00.000Z');
  // });
});
