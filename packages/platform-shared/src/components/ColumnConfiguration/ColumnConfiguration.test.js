/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ColumnConfiguration from './ColumnConfiguration';
import i18n from '@/i18n';

describe('ColumnConfiguration', () => {
  let wrapper;
  const selectInputs = [
    {
      key: 'user',
      label: 'User Columns',
      options: [
        { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
        { selectLabel: 'Email', listLabel: 'Email', value: 'user.email' },
      ],
    },
    {
      key: 'account',
      label: 'Account Columns',
      options: [
        { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
      ],
    },
  ];

  const modelValue = [
    { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
    { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
  ];

  function mountComponent(customModelValue = modelValue, customSelectInputs = selectInputs) {
    return mount(ColumnConfiguration, {
      props: {
        selectInputs: customSelectInputs,
        'model-value': customModelValue,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('renders select inputs and initial columns', () => {
    wrapper = mountComponent();

    // Check that select input labels are rendered
    expect(wrapper.text()).toContain('User Columns');
    expect(wrapper.text()).toContain('Account Columns');

    // Check that initial columns are rendered in the draggable list
    expect(wrapper.text()).toContain('User Name');
    expect(wrapper.text()).toContain('Account ID');
  });

  it('removes a column from the list when delete button is clicked', async () => {
    wrapper = mountComponent();

    let firstItem = wrapper.find('.list-group-item');
    expect(firstItem.text()).toContain('User Name');

    const deleteButtons = wrapper.findAll('button');
    await deleteButtons[0].trigger('click');

    firstItem = wrapper.find('.list-group-item');
    expect(firstItem.text()).toContain('Account ID');
  });

  it('emits update:modelValue when a column is removed', async () => {
    wrapper = mountComponent();

    // Remove the first column
    const deleteButtons = wrapper.findAll('button');
    await deleteButtons[0].trigger('click');

    // Should emit update:modelValue with only the remaining column
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const lastEmitted = wrapper.emitted('update:modelValue').pop()[0];
    expect(lastEmitted).toEqual([
      {
        selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id', sortable: false,
      },
    ]);
  });

  it('adds a column to the list when handleSelect is called', async () => {
    wrapper = mountComponent([
      { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
    ]);

    // Simulate selecting 'Account ID'
    await wrapper.vm.handleSelect({ selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' });

    expect(wrapper.text()).toContain('Account ID');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const lastEmitted = wrapper.emitted('update:modelValue').pop()[0];
    expect(lastEmitted).toEqual([
      {
        selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name', sortable: false,
      },
      {
        selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id', sortable: false,
      },
    ]);
  });

  it('reorders columns when handleListUpdate is called', async () => {
    wrapper = mountComponent([
      { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
      { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
    ]);

    // Simulate reordering: move 'Account ID' to the first position
    wrapper.vm.selectedColumnsList = [
      { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
      { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
    ];
    await wrapper.vm.handleListUpdate();

    const lastEmitted = wrapper.emitted('update:modelValue').pop()[0];
    expect(lastEmitted).toEqual([
      { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
      { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
    ]);
  });

  it('shows the Sortable toggle by default and hides it for options declaring hideSortable', () => {
    const selectInputsWithFlag = [
      {
        key: 'agent',
        label: 'Agent Columns',
        options: [
          // option carries the optional hideSortable declaration from its
          // hardcoded column entry (e.g. a column with no server-side sort)
          {
            selectLabel: 'Platform', listLabel: 'Platform', value: 'agent.platform', hideSortable: true,
          },
          { selectLabel: 'Agent', listLabel: 'Agent', value: 'agent.agent' },
        ],
      },
    ];
    wrapper = mountComponent([
      {
        selectLabel: 'Platform', listLabel: 'Platform', value: 'agent.platform', hideSortable: true,
      },
      { selectLabel: 'Agent', listLabel: 'Agent', value: 'agent.agent' },
    ], selectInputsWithFlag);

    const items = wrapper.findAll('.list-group-item');
    expect(items).toHaveLength(2);
    // the flagged column's row has no Sortable toggle; the other row keeps its default
    const rowsWithToggle = items.filter((item) => item.text().includes('Sortable'));
    expect(rowsWithToggle).toHaveLength(1);
    expect(rowsWithToggle[0].text()).toContain('Agent');
    expect(wrapper.text()).toContain('Platform');
  });
});
