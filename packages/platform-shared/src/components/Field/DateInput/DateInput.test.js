/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import DateInput from './index';
import { runA11yTest } from '../../../utils/testHelpers';

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

const defaultProps = {
  autofocus: false,
  type: 'test',
};

describe('DateInput', () => {
  it('builds a formatted date', () => {
    const wrapper = shallowMount(DateInput, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        label: 'test',
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    expect(wrapper.vm.buildFormattedDate('100-1-1')).toBe('0100-01-01');
    expect(wrapper.vm.buildFormattedDate('00200-0002-002')).toBe('0200-02-02');
    wrapper.vm.setInputValue('0300-03-03');
    expect(wrapper.vm.inputValue).toBe('0300-03-03');
    wrapper.vm.emitDateValue('4000-1-1');
    expect(wrapper.emitted().input[0][0]).toBe('4000-01-01');
    wrapper.vm.emitDateValue('');
    expect(wrapper.emitted().input[1][0]).toBe('');
  });

  describe('date picker dialog', () => {
    async function mountAndOpenPicker(extraProps = {}) {
      const wrapper = mount(DateInput, {
        props: {
          ...defaultMixinProps,
          ...defaultProps,
          label: 'Access Start Date',
          ...extraProps,
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
      return wrapper;
    }

    it('gives the date picker dialog a stable accessible name', async () => {
      const wrapper = await mountAndOpenPicker();

      const dialog = findByRole(wrapper, 'dialog');
      expect(dialog.exists()).toBe(true);
      expect(dialog.attributes('aria-label')).toBe('common.dateTimePicker.selectDate');
      expect(dialog.attributes('aria-labelledby')).toBeUndefined();
      wrapper.unmount();
    });

    it('uses the dialogLabel prop for the dialog name when provided', async () => {
      const wrapper = await mountAndOpenPicker({ dialogLabel: 'Select date for Access Start Date' });

      const dialog = findByRole(wrapper, 'dialog');
      expect(dialog.attributes('aria-label')).toBe('Select date for Access Start Date');
      expect(dialog.attributes('aria-labelledby')).toBeUndefined();
      wrapper.unmount();
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = mount(DateInput, {
        props: {
          ...defaultMixinProps,
          ...defaultProps,
          label: 'test',
        },
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
      });

      await runA11yTest(wrapper);
    });
  });
});
