/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import SortDropdown from './SortDropdown';

const sortByOptions = [
  { text: 'Name', value: 'name' },
  { text: 'Date', value: 'date' },
];

const defaultStubs = {
  BDropdown: { template: '<div><slot /><slot name="button-content" /></div>' },
  BDropdownForm: { template: '<div><slot /></div>' },
};

function mountComponent(props = {}) {
  return mount(SortDropdown, {
    global: {
      mocks: { $t: (key) => key },
      stubs: defaultStubs,
    },
    props: {
      sortByOptions,
      ...props,
    },
  });
}

describe('SortDropdown', () => {
  it('emits sort-field-change when sort field is changed', async () => {
    const wrapper = mountComponent();
    const [sortFieldSelect] = wrapper.findAllComponents({ name: 'SelectInput' });
    await sortFieldSelect.vm.$emit('input', 'date');
    expect(wrapper.emitted('sort-field-change')[0]).toEqual(['date']);
  });

  it('emits sort-direction-change when sort direction is changed', async () => {
    const wrapper = mountComponent();
    const [, sortDirectionSelect] = wrapper.findAllComponents({ name: 'SelectInput' });
    await sortDirectionSelect.vm.$emit('input', 'asc');
    expect(wrapper.emitted('sort-direction-change')[0]).toEqual(['asc']);
  });

  describe('@a11y', () => {
    it('should have no accessibility violations', async () => {
      const wrapper = mountComponent();
      await wrapper.vm.$nextTick();
      await runA11yTest(wrapper);
    });
  });
});
