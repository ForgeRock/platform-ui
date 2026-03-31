/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import i18n from '@/i18n';
import ColumnPicker from './ColumnPicker';

jest.mock('lodash/cloneDeep', () => (val) => JSON.parse(JSON.stringify(val)));
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

const defaultProps = {
  show: true,
  activeColumns: [
    { label: 'User Name', value: 'user.name' },
  ],
  defaultColumns: [
    { label: 'User Name', value: 'user.name' },
    { label: 'Email', value: 'user.email' },
  ],
  availableColumns: [
    {
      key: 'user',
      label: 'User Columns',
      children: [
        { label: 'User Name', value: 'user.name' },
        { label: 'Email', value: 'user.email' },
      ],
    },
  ],
};

function mountComponent(props = {}) {
  return mount(ColumnPicker, {
    global: {
      plugins: [i18n],
      stubs: {
        BModal: {
          name: 'BModal',
          template: '<div><slot /><slot name="modal-footer" /></div>',
          props: ['visible', 'ok-disabled'],
        },
        [FrIcon]: true,
        [FrField]: {
          template: '<div><input type="checkbox" :value="value" @change="$emit(\'change\', $event.target.checked)" />{{label}}</div>',
          props: ['value', 'label'],
        },
        [FrSearchInput]: true,
        [FrAccordion]: {
          name: 'FrAccordion',
          template: '<div><slot name="header" :header="items[0].header" /><slot name="body" :items="items[0].items" /></div>',
          props: ['items'],
        },
        Draggable: {
          template: '<div><slot name="item" v-for="element in list" :element="element" /></div>',
          props: ['list'],
        },
      },
    },
    props: {
      ...defaultProps,
      ...props,
    },
  });
}

describe('ColumnPicker', () => {
  it('renders correctly in category mode', async () => {
    const wrapper = mountComponent({ show: false });
    await wrapper.setProps({ show: true });
    expect(wrapper.text()).toContain('User Name');
  });

  it('clones activeColumns to pendingColumns on show', async () => {
    const wrapper = mountComponent({ show: false });
    await wrapper.setProps({ show: true });
    // Verify internal pendingColumns indirectly by checking rendered items
    const activeList = wrapper.find('.active-column-list');
    expect(activeList.text()).toContain('User Name');
  });

  it('toggles a column in pending state', async () => {
    const wrapper = mountComponent();

    // Directly manipulate pendingColumns to simulate toggle
    // This avoids issues with stubbed component event propagation in some environments
    const columnToToggle = defaultProps.activeColumns[0];
    wrapper.vm.toggleColumn(columnToToggle, false);
    await wrapper.vm.$nextTick();

    const activeList = wrapper.find('.active-column-list');
    expect(activeList.text()).not.toContain('User Name');

    // Component should NOT emit update:activeColumns until Apply
    expect(wrapper.emitted('update:activeColumns')).toBeUndefined();
  });

  it('emits apply and update:activeColumns on Apply click', async () => {
    const wrapper = mountComponent();
    // Simulate clicking 'Ok' on BModal (which we stubbed as just a div, so we call the method)
    await wrapper.vm.onApply();

    expect(wrapper.emitted('update:activeColumns')).toBeTruthy();
    expect(wrapper.emitted('apply')).toBeTruthy();
  });

  it('updates pendingColumns when Reset is clicked', async () => {
    // Start with only one active column
    const wrapper = mountComponent({
      activeColumns: [{ label: 'User Name', value: 'user.name' }],
    });
    // Ensure show is triggered to populate pendingColumns
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    const activeListBefore = wrapper.find('.active-column-list');
    expect(activeListBefore.text()).not.toContain('Email');

    const resetBtn = wrapper.find('button.text-secondary');
    await resetBtn.trigger('click');

    const activeListAfter = wrapper.find('.active-column-list');
    expect(activeListAfter.text()).toContain('User Name');
    expect(activeListAfter.text()).toContain('Email');
    // Modal should stay open
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('visible')).toBe(true);
  });

  it('handles columns that only have key (no value) correctly', async () => {
    const wrapper = mountComponent({
      availableColumns: [
        { key: 'col1', label: 'Column One' },
        { key: 'col2', label: 'Column Two' },
      ],
      activeColumns: [
        { key: 'col1', label: 'Column One' },
      ],
      defaultColumns: [],
    });
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    // key-only active column should appear in the active list
    const activeList = wrapper.find('.active-column-list');
    expect(activeList.text()).toContain('Column One');

    // toggling a key-only available column should add it to pendingColumns
    wrapper.vm.toggleColumn({ key: 'col2', label: 'Column Two' }, true);
    await wrapper.vm.$nextTick();
    expect(activeList.text()).toContain('Column Two');

    // apply should emit both key-only columns
    await wrapper.vm.onApply();
    const emitted = wrapper.emitted('update:activeColumns')[0][0];
    expect(emitted.some((c) => c.key === 'col1')).toBe(true);
    expect(emitted.some((c) => c.key === 'col2')).toBe(true);
  });

  it('deduplicates items with the same value across categories in list view', async () => {
    const wrapper = mountComponent({
      availableColumns: [
        {
          key: 'application',
          label: 'Application',
          children: [
            { label: 'Application Description', value: 'application.description' },
          ],
        },
        {
          key: 'account',
          label: 'Account',
          children: [
            { label: 'Application Description', value: 'application.description' },
            { label: 'Account Name', value: 'account.name' },
          ],
        },
      ],
      activeColumns: [],
      defaultColumns: [],
    });
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    const flatList = wrapper.vm.allAvailableColumns;
    const values = flatList.map((c) => c.value);
    expect(values.filter((v) => v === 'application.description')).toHaveLength(1);
  });

  it('keeps items with the same value in both categories in category view', async () => {
    // The same column legitimately placed in two categories should appear once per category
    // in the accordion. List view dedups; category view doesn't.
    const wrapper = mountComponent({
      availableColumns: [
        {
          key: 'application',
          label: 'Application',
          children: [
            { label: 'Application Description', value: 'application.description' },
          ],
        },
        {
          key: 'account',
          label: 'Account',
          children: [
            { label: 'Application Description', value: 'application.description' },
          ],
        },
      ],
      activeColumns: [],
      defaultColumns: [],
    });
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    const totalAccordionItems = wrapper.vm.accordionItems.flatMap((cat) => cat.items);
    expect(totalAccordionItems).toHaveLength(2);
    expect(totalAccordionItems.every((i) => i.value === 'application.description')).toBe(true);
    // Each accordion item carries its own categoryKey so :key bindings don't collide.
    const categoryKeys = totalAccordionItems.map((i) => i.categoryKey);
    expect(categoryKeys).toEqual(['application', 'account']);
  });

  it('does not duplicate items in the flat list when search is typed and cleared', async () => {
    const wrapper = mountComponent({
      availableColumns: [
        {
          key: 'application',
          label: 'Application',
          children: [
            { label: 'Application Description', value: 'application.description' },
            { label: 'Application Name', value: 'application.name' },
          ],
        },
      ],
      activeColumns: [],
      defaultColumns: [],
    });
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    const initialLength = wrapper.vm.allAvailableColumns.length;
    expect(initialLength).toBe(2);

    // Repeatedly type and clear search — the underlying data should not grow.
    const cycle = async () => {
      wrapper.vm.listSearchQuery = 'description';
      await wrapper.vm.$nextTick();
      wrapper.vm.listSearchQuery = '';
      await wrapper.vm.$nextTick();
    };
    await Promise.all(Array.from({ length: 5 }, () => cycle()));

    expect(wrapper.vm.allAvailableColumns.length).toBe(initialLength);
  });

  it('disables the Apply button when there are no active columns', async () => {
    const wrapper = mountComponent({ activeColumns: [] });
    // Ensure show is triggered
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('okDisabled')).toBe(true);
  });

  it('enables the Apply button when there are active columns', async () => {
    const wrapper = mountComponent();
    // Ensure show is triggered
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('okDisabled')).toBe(false);
  });
});
