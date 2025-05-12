/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
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

  function mountComponent(customModelValue = modelValue) {
    return mount(ColumnConfiguration, {
      props: {
        selectInputs,
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
      { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
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
      { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
      { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
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
});
