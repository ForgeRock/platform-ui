/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount } from '@vue/test-utils';
import InputMixin from './index';

const TestComponent = {
  render() {},
  mixins: [InputMixin],
};

describe('InputMixin', () => {
  it('InputMixin loaded', () => {
    const wrapper = shallowMount(TestComponent);
    expect(wrapper.name()).toBe('InputMixin');
  });

  it('InputMixin uid is set', () => {
    const wrapper = shallowMount(TestComponent);
    // eslint-disable-next-line no-underscore-dangle
    const expected = `floatingLabelInput${wrapper.vm._uid}`;
    expect(wrapper.vm.$data.id).toBe(expected);
  });

  it('Initial value calls setter method setInputValue', () => {
    const setInputValue = jest.fn();
    shallowMount(TestComponent, {
      propsData: {
        value: 'test',
      },
      methods: {
        setInputValue,
      },
    });

    expect(setInputValue).toBeCalled();
  });

  it('Initial value defaults to empty string', () => {
    const wrapper = shallowMount(TestComponent);

    expect(wrapper.vm.$data.inputValue).toBe('');
  });

  it('Initial value can be set as String', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        value: 'test',
      },
    });

    expect(wrapper.vm.$data.inputValue).toBe('test');
  });

  it('Initial value can be set as Array', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        value: ['test'],
      },
    });

    expect(wrapper.vm.$data.inputValue).toEqual(['test']);
  });

  it('Initial value can be set as Object', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        value: { test: 'test' },
      },
    });

    expect(wrapper.vm.$data.inputValue).toEqual({ test: 'test' });
  });

  it('Initial value can be set as Number', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        value: 5,
      },
    });

    expect(wrapper.vm.$data.inputValue).toBe(5);
  });

  it('Update to inputValue triggers handler and event', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        label: 'test label',
      },
    });
    const inputValueHandlerSpy = jest.spyOn(wrapper.vm, 'inputValueHandler');

    wrapper.setData({ inputValue: 'test' });

    expect(inputValueHandlerSpy).toBeCalled();
    expect(wrapper.vm.$data.floatLabels).toBeTruthy();
    expect(wrapper.emitted().input[0]).toStrictEqual(['test']);
  });

  it('Update to inputValue triggers handler and event', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        label: 'test label',
      },
    });
    const inputValueHandlerSpy = jest.spyOn(wrapper.vm, 'inputValueHandler');

    wrapper.setData({ inputValue: 'test' });

    expect(inputValueHandlerSpy).toBeCalled();
    expect(wrapper.vm.$data.floatLabels).toBeTruthy();
    expect(wrapper.emitted().input[0]).toStrictEqual(['test']);
  });
});

describe('InputMixin floatLabels', () => {
  it('String inputValue change updates floatLabels', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        label: 'test label',
      },
    });

    expect(wrapper.vm.$data.floatLabels).toBeFalsy();
    wrapper.setData({ inputValue: 't' });
    expect(wrapper.vm.$data.floatLabels).toBeTruthy();
    wrapper.setData({ inputValue: '' });
    expect(wrapper.vm.$data.floatLabels).toBeFalsy();
  });

  it('Object inputValue change updates floatLabels', () => {
    const wrapper = shallowMount(TestComponent, {
      propsData: {
        label: 'test label',
        value: { value: '' },
      },
    });

    expect(wrapper.vm.$data.floatLabels).toBeFalsy();
    wrapper.setData({ inputValue: { value: 't' } });
    expect(wrapper.vm.$data.floatLabels).toBeTruthy();
    wrapper.setData({ inputValue: { value: '' } });
    expect(wrapper.vm.$data.floatLabels).toBeFalsy();
  });
});
