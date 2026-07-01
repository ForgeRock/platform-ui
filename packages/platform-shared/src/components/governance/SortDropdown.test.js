/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { BDropdown } from 'bootstrap-vue';
import FrSelectInput from '@forgerock/platform-shared/src/components/Field/SelectInput';
import SortDropdown from './SortDropdown';

const sortByOptions = [
  { text: 'Name', value: 'name' },
  { text: 'Date', value: 'date' },
];

function mountComponent(props = {}, options = {}) {
  return mount(SortDropdown, {
    attachTo: document.body,
    global: {
      mocks: { $t: (key) => key },
      stubs: { FrIcon: true },
    },
    props: {
      sortByOptions,
      ...props,
    },
    ...options,
  });
}

describe('SortDropdown', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('toggle button', () => {
    it('renders a closed dropdown toggle', () => {
      const wrapper = mountComponent();
      const toggle = wrapper.find('button.dropdown-toggle');

      expect(toggle.attributes('aria-expanded')).toBe('false');
      expect(toggle.attributes('aria-label')).toBe('common.sortBy');
    });

    it('uses the selected sort field in the toggle accessible name', () => {
      const wrapper = mountComponent({ selectedItem: 'date' });

      expect(wrapper.find('button.dropdown-toggle').attributes('aria-label')).toBe('common.sortByLabel');
    });

    it('updates the toggle accessible name when selectedItem changes', async () => {
      const wrapper = mountComponent();
      expect(wrapper.find('button.dropdown-toggle').attributes('aria-label')).toBe('common.sortBy');

      await wrapper.setProps({ selectedItem: 'name' });

      expect(wrapper.find('button.dropdown-toggle').attributes('aria-label')).toBe('common.sortByLabel');
    });

    it('generates unique IDs for multiple dropdown instances', async () => {
      const firstWrapper = mountComponent();
      const secondWrapper = mountComponent();
      await flushPromises();

      const firstToggleId = firstWrapper.find('button.dropdown-toggle').attributes('id');
      const secondToggleId = secondWrapper.find('button.dropdown-toggle').attributes('id');

      expect(firstToggleId).toBeTruthy();
      expect(secondToggleId).toBeTruthy();
      expect(firstToggleId).not.toBe(secondToggleId);
      expect(firstWrapper.find('.dropdown-menu').attributes('aria-labelledby')).toBe(firstToggleId);
      expect(secondWrapper.find('.dropdown-menu').attributes('aria-labelledby')).toBe(secondToggleId);
    });
  });

  describe('focus management', () => {
    it('moves focus to the first select when the dropdown is shown', async () => {
      const wrapper = mountComponent();
      const dropdown = wrapper.findComponent(BDropdown);
      const firstSelect = wrapper.findAllComponents(FrSelectInput)[0];
      const firstMultiselect = firstSelect.find('.multiselect');

      dropdown.vm.$emit('shown');
      await flushPromises();

      expect(firstMultiselect.exists()).toBe(true);
      expect(document.activeElement).toBe(firstMultiselect.element);
      expect(firstMultiselect.classes()).not.toContain('multiselect--active');
    });
  });

  describe('dropdown content', () => {
    it('renders the form when opened', async () => {
      const wrapper = mountComponent();
      await wrapper.find('button.dropdown-toggle').trigger('click');

      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
      expect(wrapper.findAllComponents(FrSelectInput)).toHaveLength(2);
    });

    it('closes when Escape is pressed inside the dropdown', async () => {
      const wrapper = mountComponent();
      await wrapper.find('button.dropdown-toggle').trigger('click');
      await flushPromises();

      await wrapper.find('.dropdown-menu').trigger('keydown', { keyCode: 27 });
      await flushPromises();

      expect(wrapper.find('.dropdown-menu').classes()).not.toContain('show');
    });
  });

  describe('emits', () => {
    it('emits sort-field-change when sort field is changed', async () => {
      const wrapper = mountComponent();
      await wrapper.find('button.dropdown-toggle').trigger('click');
      const [sortFieldSelect] = wrapper.findAllComponents(FrSelectInput);

      await sortFieldSelect.vm.$emit('input', 'date');

      expect(wrapper.emitted('sort-field-change')[0]).toEqual(['date']);
    });

    it('emits sort-direction-change when sort direction is changed', async () => {
      const wrapper = mountComponent();
      await wrapper.find('button.dropdown-toggle').trigger('click');
      const [, sortDirectionSelect] = wrapper.findAllComponents(FrSelectInput);

      await sortDirectionSelect.vm.$emit('input', 'asc');

      expect(wrapper.emitted('sort-direction-change')[0]).toEqual(['asc']);
    });
  });

  describe('@a11y', () => {
    it('should have no accessibility violations when closed', async () => {
      const wrapper = mountComponent({}, {
        global: {
          mocks: { $t: (key) => key },
          stubs: {
            BDropdown: { template: '<div><slot /><slot name="button-content" /></div>' },
            BDropdownForm: { template: '<div><slot /></div>' },
            FrIcon: true,
          },
        },
      });
      await runA11yTest(wrapper);
    });

    it('should have no accessibility violations when open', async () => {
      const wrapper = mountComponent({ selectedItem: 'date' }, {
        global: {
          mocks: { $t: (key) => key },
          stubs: {
            BDropdown: { template: '<div><slot /><slot name="button-content" /></div>' },
            BDropdownForm: { template: '<div><slot /></div>' },
            FrIcon: true,
          },
        },
      });
      await runA11yTest(wrapper);
    });
  });
});
