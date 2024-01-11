/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import uuid from 'uuid/v4';
import InputMixin from './index';

jest.mock('uuid/v4');

const TestComponent = {
  render() {},
  mixins: [InputMixin],
  data() {
    return {
      inputValue: '',
    };
  },
};

describe('InputMixin', () => {
  it('InputMixin id is set', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        id: 'testId',
      },
    });
    expect(wrapper.vm.internalId).toBe('testId');
  });

  it('InputMixin uid is set when id prop is empty', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
      },
    });
    const expected = `floatingLabelInput${wrapper.vm._uid}`;
    expect(wrapper.vm.internalId).toBe(expected);
  });

  it('InputMixin sets floating label on Chrome', () => {
    jest.useFakeTimers();
    // eslint-disable-next-line no-restricted-properties
    navigator.__defineGetter__('userAgent', () => ['Chrome']);

    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        label: 'test',
      },
    });

    expect(wrapper.vm.floatingLabel).toEqual(true);
    jest.runAllTimers();
  });

  it('InputMixin sets floating label on Edge', () => {
    jest.useFakeTimers();
    // eslint-disable-next-line no-restricted-properties
    navigator.__defineGetter__('userAgent', () => ['Edge']);
    window.document.getElementById = () => ({ value: 'test' });

    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        label: 'test',
      },
    });

    expect(wrapper.vm.floatingLabel).toEqual(true);
    jest.runAllTimers();
  });

  it('Initial value calls setter method setInputValue', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        value: 'test',
      },
    });

    expect(wrapper.vm.inputValue).toBe('test');
  });

  it('Initial value defaults to empty string', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
      },
    });

    expect(wrapper.vm.$data.inputValue).toBe('');
  });

  it('Initial value can be set as String', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        value: 'test',
      },
    });

    expect(wrapper.vm.$data.inputValue).toBe('test');
  });

  it('Initial value can be set as Array', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        value: ['test'],
      },
    });

    expect(wrapper.vm.$data.inputValue).toEqual(['test']);
  });

  it('Initial value can be set as Object', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        value: { test: 'test' },
      },
    });

    expect(wrapper.vm.$data.inputValue).toEqual({ test: 'test' });
  });

  it('Initial value can be set as Number', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        value: 5,
      },
    });

    expect(wrapper.vm.$data.inputValue).toBe(5);
  });

  it('TestComponent without float labels', () => {
    const wrapper = shallowMount(TestComponent, {
      props: {
        name: 'testMixin',
        floatingLabel: false,
      },
    });

    setTimeout(() => {
      expect(wrapper.vm.floatLabels).toEqual(false);
    }, 1000);
    jest.runAllTimers();
  });

  it('Generates an uuid name prop if the name attribute is empty', () => {
    const uuidValue = '';
    uuid.mockImplementation(() => uuidValue);

    const wrapper = shallowMount(TestComponent, {
      props: {
        value: 5,
      },
    });

    expect(wrapper.vm.name).toBe(uuidValue);
  });
});
