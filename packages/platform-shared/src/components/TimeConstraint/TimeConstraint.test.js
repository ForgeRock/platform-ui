/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import TimeConstraint from './index';

describe('TimeConstraint Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(TimeConstraint, {
      mocks: {
        $t(val) { return val; },
      },
      propsData: {
        value: '2020-01-02T12:00:00.000Z/2020-01-03T13:00:00.000Z',
      },
    });
  });

  it('TimeConstraint successfully loaded', () => {
    expect(wrapper.name()).toEqual('TimeConstraint');
  });

  it('contains two datepickers, two timepickers, and one offset selector', () => {
    const datepickers = wrapper.findAll({ name: 'Datepicker' });
    expect(datepickers.at(0).exists()).toBe(true);
    expect(datepickers.at(1).exists()).toBe(true);
    const timepickers = wrapper.findAll({ name: 'Timepicker' });
    expect(timepickers.at(0).exists()).toBe(true);
    expect(timepickers.at(1).exists()).toBe(true);
    expect(wrapper.find({ name: 'TimezoneOffset' }).exists()).toBe(true);
  });

  // TODO Server has a different timezone so tests that pass locally fail on server.
  // Need to find a way to test component properly.

  // it('takes an iso range as value and properly sets child component values', () => {
  //   const datepickers = wrapper.findAll({ name: 'Datepicker' });
  //   expect(datepickers.at(0).attributes('value')).toBe('2020-1-2');
  //   expect(datepickers.at(1).attributes('value')).toBe('2020-1-3');
  //   const timepickers = wrapper.findAll({ name: 'Timepicker' });
  //   expect(timepickers.at(0).attributes('value')).toBe('4:0:00');
  //   expect(timepickers.at(1).attributes('value')).toBe('5:0:00');
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
