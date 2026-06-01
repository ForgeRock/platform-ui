/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import DurationInput from './index';

defineRule('non_negative_integer', () => true);

const defaultProps = {
  id: '',
  errors: [],
  name: '',
  description: '',
  disabled: false,
  floatingLabel: true,
  isHtml: false,
  label: '',
  placeholder: '',
  readonly: false,
  autofocus: true,
  validation: '',
  validationImmediate: false,
  defaultUnit: 'days',
  value: 'PT1M',
};

describe('DurationInput', () => {
  it('builds a formatted duration', () => {
    const wrapper = shallowMount(DurationInput, {
      props: {
        ...defaultProps,
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    expect(wrapper.vm.durationUnit).toBe('minutes');
    wrapper.vm.setDurationUnit('seconds');
    expect(wrapper.vm.durationUnit).toBe('seconds');
    expect(wrapper.emitted().input[0][0]).toEqual('PT1S');
  });

  it('updates duration unit and rebuilds formatted duration', async () => {
    const wrapper = shallowMount(DurationInput, {
      props: {
        ...defaultProps,
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    await wrapper.setData({
      durationUnit: 'years',
    });
    wrapper.vm.durationValue = 3;

    expect(wrapper.vm.durationUnit).toBe('years');
    wrapper.vm.setDurationUnit('hours');
    expect(wrapper.vm.durationUnit).toBe('hours');
    expect(wrapper.emitted().input[0][0]).toEqual('PT3H');
  });

  it('sets month input', () => {
    const wrapper = shallowMount(DurationInput, {
      props: {
        ...defaultProps,
        value: 'P1M',
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    expect(wrapper.vm.durationUnit).toBe('months');
  });

  it.each([
    ['P2Y', '2', 'years'],
    ['P3M', '3', 'months'],
    ['P4W', '4', 'weeks'],
    ['P5D', '5', 'days'],
    ['PT6H', '6', 'hours'],
    ['PT7M', '7', 'minutes'],
    ['PT8S', '8', 'seconds'],
  ])('parses incoming value %s into number %s and unit %s', (value, expectedNumber, expectedUnit) => {
    const wrapper = shallowMount(DurationInput, {
      props: { ...defaultProps, value },
      global: { mocks: { $t: (text) => text } },
    });

    expect(wrapper.vm.durationValue).toBe(expectedNumber);
    expect(wrapper.vm.durationUnit).toBe(expectedUnit);
  });

  it('emits formatted duration when onNumberInput is called', () => {
    const wrapper = shallowMount(DurationInput, {
      props: { ...defaultProps, value: 'P1D' },
      global: { mocks: { $t: (text) => text } },
    });

    wrapper.vm.onNumberInput(10);

    expect(wrapper.vm.durationValue).toBe('10');
    expect(wrapper.emitted().input).toHaveLength(1);
    expect(wrapper.emitted().input[0][0]).toBe('P10D');
  });

  describe('error and boundary scenarios', () => {
    it('passes through negative value so validation can show an error', () => {
      const wrapper = shallowMount(DurationInput, {
        props: { ...defaultProps, value: 'P1D' },
        global: { mocks: { $t: (text) => text } },
      });

      wrapper.vm.onNumberInput(-5);

      expect(wrapper.vm.durationValue).toBe('-5');
      expect(wrapper.emitted().input).toHaveLength(1);
      expect(wrapper.emitted().input[0][0]).toBe('P-5D');
    });

    it('sets durationValue to empty string and emits empty string when input is cleared', () => {
      const wrapper = shallowMount(DurationInput, {
        props: { ...defaultProps, value: 'P1D' },
        global: { mocks: { $t: (text) => text } },
      });

      wrapper.vm.onNumberInput('');

      expect(wrapper.vm.durationValue).toBe('');
      expect(wrapper.emitted().input[0][0]).toBe('');
    });

    it('sets durationValue to empty string and emits empty string when input is null', () => {
      const wrapper = shallowMount(DurationInput, {
        props: { ...defaultProps, value: 'P1D' },
        global: { mocks: { $t: (text) => text } },
      });

      wrapper.vm.onNumberInput(null);

      expect(wrapper.vm.durationValue).toBe('');
      expect(wrapper.emitted().input[0][0]).toBe('');
    });

    it('when stripped value equals durationValue, corrects the DOM without re-emitting', () => {
      const wrapper = shallowMount(DurationInput, {
        props: { ...defaultProps, value: 'P5D' },
        global: { mocks: { $t: (text) => text } },
      });

      wrapper.vm.onNumberInput(5);

      expect(wrapper.vm.durationValue).toBe('5');
      expect(wrapper.emitted().input).toBeFalsy();
    });

    it('does not update durationValue or durationUnit when value prop is unparseable', () => {
      const wrapper = shallowMount(DurationInput, {
        props: { ...defaultProps, value: 'PT1M' },
        global: { mocks: { $t: (text) => text } },
      });

      wrapper.vm.setInputValue('not-a-duration');

      expect(wrapper.vm.durationValue).toBe('1');
      expect(wrapper.vm.durationUnit).toBe('minutes');
    });

    it('does not reset durationUnit when setInputValue receives a string with an unrecognised unit character', () => {
      const wrapper = shallowMount(DurationInput, {
        props: { ...defaultProps, value: 'P5D' },
        global: { mocks: { $t: (text) => text } },
      });

      wrapper.vm.setInputValue('P05fD');

      expect(wrapper.vm.durationValue).toBe('5');
      expect(wrapper.vm.durationUnit).toBe('days');
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = mount(DurationInput, {
        props: {
          ...defaultProps,
          label: 'Duration Input',
        },
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
      });
      await wrapper.vm.$nextTick();
      await runA11yTest(wrapper);
    });
  });
});
