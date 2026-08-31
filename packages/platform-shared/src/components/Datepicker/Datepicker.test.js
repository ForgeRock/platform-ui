/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByRole, findByTestId, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { flushPromises, mount } from '@vue/test-utils';
import { v4 as uuid } from 'uuid';
import Datepicker from './index';

jest.mock('uuid', () => ({ v4: jest.fn() }));

function setupMount(props) {
  return mount(Datepicker, {
    props: {
      ...props,
    },
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
  });
}

let wrapper;
describe('Datepicker Component', () => {
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('contains a bootstrap datepicker', () => {
    wrapper = setupMount({
      name: 'datepicker',
    });
    const datepicker = findByTestId(wrapper, 'datepicker');

    expect(datepicker.exists()).toBe(true);
  });

  it('has placeholder text', () => {
    wrapper = setupMount({
      name: 'datepicker',
      placeholder: 'test',
    });
    const datepicker = findByTestId(wrapper, 'datepicker');
    expect(datepicker.find('.text-muted').text()).toBe('test');
  });

  it('floats placeholder text when a value is set', async () => {
    wrapper = setupMount({
      name: 'datepicker',
      placeholder: 'test',
    });
    expect(wrapper.find('.input-has-value').exists()).toBe(false);
    await wrapper.setProps({ value: 'John' });
    expect(wrapper.find('.input-has-value').exists()).toBe(true);
  });

  it('generates a name when the name property is empty', async () => {
    const uuidValue = 'b5fa8ea0-a8bc-4285-b34d-8ad4c6cec7d6';
    uuid.mockImplementation(() => uuidValue);
    wrapper = setupMount({ placeholder: 'test' });
    expect(wrapper.vm.name).toBe(uuidValue);
  });

  describe('date picker dialog', () => {
    async function mountAndOpenPicker(props) {
      wrapper = setupMount({ name: 'datepicker', placeholder: 'Expiry Date', ...props });
      await flushPromises();
      await wrapper.find('button').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      return wrapper;
    }

    it('gives the date picker dialog a stable accessible name', async () => {
      await mountAndOpenPicker();

      const dialog = findByRole(wrapper, 'dialog');
      expect(dialog.exists()).toBe(true);
      expect(dialog.attributes('aria-label')).toBe('common.dateTimePicker.selectDate');
      expect(dialog.attributes('aria-labelledby')).toBeUndefined();
    });

    it('uses the dialogLabel prop for the dialog name when provided', async () => {
      await mountAndOpenPicker({ dialogLabel: 'Select date for Apply Expiration Date (optional)' });

      const dialog = findByRole(wrapper, 'dialog');
      expect(dialog.attributes('aria-label')).toBe('Select date for Apply Expiration Date (optional)');
      expect(dialog.attributes('aria-labelledby')).toBeUndefined();
    });
  });

  describe('@a11y', () => {
    it('Datepicker should be accessible', async () => {
      wrapper = setupMount({
        name: 'datepicker',
        placeholder: 'Select date',
        value: '2024-06-15',
      });

      // Need to wait for Datepicker to render few `aria-labelledby` attributes for the
      // Datepicker dropdown dialog.
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
