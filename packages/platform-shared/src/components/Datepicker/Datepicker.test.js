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
    // attached so .focus() works
    attachTo: document.body,
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
  });
}

let wrapper;
// VTU's trigger() can't set bubbles/cancelable; dispatch real keydowns
const tabKeydown = () => new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

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

  it('contains focus within the open dialog when Tab is pressed at the boundary (IAM-11385)', async () => {
    wrapper = setupMount({ name: 'datepicker', placeholder: 'test' });
    const datepicker = findByTestId(wrapper, 'datepicker');

    // BV flips `visible` inside a requestAnimationFrame
    await datepicker.find('button').trigger('click');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await flushPromises();

    const dialog = datepicker.find('[role="dialog"]');
    expect(dialog.exists()).toBe(true);

    // Tab from the grid (last tab stop) wraps to the first tabable element
    const tabables = dialog.findAll('button, [tabindex]:not([tabindex^="-"])');
    expect(tabables.length).toBeGreaterThan(1);
    const grid = tabables[tabables.length - 1];
    expect(grid.attributes('tabindex')).toBe('0');
    grid.element.focus();
    grid.element.dispatchEvent(tabKeydown());
    expect(document.activeElement).toBe(tabables[0].element);
  });

  it('releases the focus trap when the dialog is hidden', async () => {
    wrapper = setupMount({ name: 'datepicker', placeholder: 'test' });
    const datepicker = findByTestId(wrapper, 'datepicker');
    const toggle = datepicker.find('button');

    await toggle.trigger('click');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await flushPromises();
    expect(toggle.attributes('aria-expanded')).toBe('true');

    // While open, Tab from the grid wraps to the first tabable element
    const dialog = datepicker.find('[role="dialog"]');
    const tabables = dialog.findAll('button, [tabindex]:not([tabindex^="-"])');
    const grid = tabables[tabables.length - 1];
    grid.element.focus();
    grid.element.dispatchEvent(tabKeydown());
    expect(document.activeElement).toBe(tabables[0].element);

    // Closing removes the trap's keydown listener from the dialog
    const removeSpy = jest.spyOn(dialog.element, 'removeEventListener');
    await toggle.trigger('click');
    await flushPromises();
    expect(toggle.attributes('aria-expanded')).toBe('false');
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
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
