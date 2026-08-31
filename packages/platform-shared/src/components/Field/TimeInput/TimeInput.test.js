/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { findByRole, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import TimeInput from './index';

const defaultMixinProps = {
  id: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
  readonly: false,
  autofocus: true,
};

let wrapper;
afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

describe('TimeInput', () => {
  describe('input value handling', () => {
    beforeEach(() => {
      wrapper = shallowMount(TimeInput, {
        props: {
          ...defaultMixinProps,
          label: 'test',
        },
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
      });
    });

    it('builds a formatted time', async () => {
      wrapper.vm.emitValidTime('01:01');
      expect(wrapper.emitted().input[0][0]).toContain('1:00Z');
      wrapper.vm.emitValidTime('02:02:02');
      expect(wrapper.emitted().input[1][0]).toContain('2:02Z');
      wrapper.vm.emitValidTime('');
      expect(wrapper.emitted().input[2][0]).toContain('');
      wrapper.vm.inputValue = '03:03:03 Z';
      await flushPromises();
      expect(wrapper.vm.inputValue).toEqual('03:03:03');
    });

    it('No input event is emitted when the component is initialized', async () => {
      await flushPromises();
      expect(wrapper.emitted().input).toBeFalsy();
    });

    it('No input event is emitted when the input value is not changed', async () => {
      wrapper.setData({ inputValue: '01:01' });
      await flushPromises();
      wrapper.vm.inputValue = '01:01';
      expect(wrapper.emitted().input).toBeFalsy();
    });

    it('Event is emitted when the input value is changed', async () => {
      wrapper.setData({ inputValue: '01:01' });
      await wrapper.vm.$nextTick();
      wrapper.vm.emitValidTime('02:02');
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted().input[0][0]).toBeTruthy();
    });
  });

  describe('time picker dialog', () => {
    beforeEach(async () => {
      wrapper = mount(TimeInput, {
        props: {
          ...defaultMixinProps,
          id: 'start-time',
          label: 'Access Start Date',
          value: '11:05',
        },
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
        attachTo: document.body,
      });

      await wrapper.find('button').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
    });

    it('gives the time picker dialog a stable accessible name', async () => {
      const dialog = findByRole(wrapper, 'dialog');
      expect(dialog.exists()).toBe(true);
      expect(dialog.attributes('aria-label')).toBe('common.dateTimePicker.selectTime');
      expect(dialog.attributes('aria-labelledby')).toBeUndefined();
    });

    it('keeps the stable dialog name after the selected value changes', async () => {
      // The spinbutton UI does not render in jsdom (BTime renders empty), so the full
      // user input path can't be driven in a unit test. Setting localHMS directly
      // exercises the same BFormTimepicker re-render path the regression depends on.
      const timePickerVm = wrapper.findComponent({ name: 'BFormTimepicker' });
      timePickerVm.vm.localHMS = '12:30';
      await flushPromises();
      await wrapper.vm.$nextTick();

      const dialog = findByRole(wrapper, 'dialog');
      expect(dialog.attributes('aria-label')).toBe('common.dateTimePicker.selectTime');
      expect(dialog.attributes('aria-labelledby')).toBeUndefined();
    });

    it('uses the dialogLabel prop for the dialog name when provided', async () => {
      wrapper.unmount();
      wrapper = mount(TimeInput, {
        props: {
          ...defaultMixinProps,
          id: 'end-time',
          label: 'Access End Date',
          dialogLabel: 'Select time for Access End Date',
          value: '11:05',
        },
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
        attachTo: document.body,
      });

      await wrapper.find('button').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();

      const dialog = findByRole(wrapper, 'dialog');
      expect(dialog.attributes('aria-label')).toBe('Select time for Access End Date');
      expect(dialog.attributes('aria-labelledby')).toBeUndefined();
    });

    describe('@a11y', () => {
      it('has no accessibility violations when the time picker dialog is open', async () => {
        const dialog = findByRole(wrapper, 'dialog');
        expect(dialog.exists()).toBe(true);
        await runA11yTest(dialog);
      });
    });
  });
});
