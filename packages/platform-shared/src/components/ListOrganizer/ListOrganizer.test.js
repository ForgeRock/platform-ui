/**
 * Copyright (c) 2022-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref, computed, toValue } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';
import ListOrganizer from './index';

jest.mock('@forgerock/platform-shared/src/composables/useColumnPicker');

jest.mock('@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker', () => ({
  name: 'FrColumnPicker',
  template: '<div class="fr-column-picker-mock"></div>',
  props: ['activeColumns', 'availableColumns', 'show'],
}));

const defaultProps = {
  global: {
    mocks: {
      $t: (t) => t,
    },
    stubs: {
      FrIcon: true,
    },
  },
  props: {
    value: [
      {
        key: '1',
        label: '1',
        enabled: true,
      },
      {
        key: '2',
        label: '2',
        enabled: true,
      },
      {
        key: '3',
        label: '3',
        enabled: true,
      },
    ],
    isTesting: true,
  },
};

describe('ListOrganizer Component', () => {
  let wrapper;
  let mockLoadColumns;

  beforeEach(async () => {
    mockLoadColumns = jest.fn();
    useColumnPicker.mockImplementation((initialColumns) => {
      const activeColumns = ref(toValue(initialColumns));
      const show = ref(false);
      return {
        open: () => { show.value = true; },
        show,
        activeColumns,
        pickerProps: computed(() => ({
          show: show.value,
          activeColumns: activeColumns.value,
          'onUpdate:show': (val) => {
            show.value = val;
          },
          'onUpdate:activeColumns': (newVal) => {
            activeColumns.value = newVal;
          },
        })),
        loadColumns: mockLoadColumns,
        syncWithOriginalList: (newActive, original) => {
          const originalWithEnabled = original.map((col) => ({
            ...col,
            enabled: newActive.some((c) => (c.value || c.key) === (col.value || col.key)),
          }));
          return originalWithEnabled;
        },
      };
    });

    wrapper = mount(ListOrganizer, defaultProps);
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();
  });

  it('button slot provides compatible showModal and new open function', async () => {
    const wrapperWithSlot = mount(ListOrganizer, {
      ...defaultProps,
      slots: {
        button: `
          <template #button="{ showModal, open }">
            <button id="show-modal-btn" @click="open"></button>
            <button id="open-btn" @click="open"></button>
          </template>
        `,
      },
    });

    const showModalBtn = wrapperWithSlot.find('#show-modal-btn');
    const openBtn = wrapperWithSlot.find('#open-btn');

    expect(showModalBtn.exists()).toBe(true);
    expect(openBtn.exists()).toBe(true);

    // Test compatible showModal.value = true
    await showModalBtn.trigger('click');
    expect(wrapperWithSlot.findComponent({ name: 'FrColumnPicker' }).props('show')).toBe(true);

    // Close and test open function
    await wrapperWithSlot.findComponent({ name: 'FrColumnPicker' }).vm.$emit('update:show', false);
    expect(wrapperWithSlot.findComponent({ name: 'FrColumnPicker' }).props('show')).toBe(false);

    await openBtn.trigger('click');
    expect(wrapperWithSlot.findComponent({ name: 'FrColumnPicker' }).props('show')).toBe(true);
  });

  it('passes correct active columns to ColumnPicker', () => {
    const picker = wrapper.findComponent({ name: 'FrColumnPicker' });
    expect(picker.exists()).toBe(true);
    expect(picker.props('activeColumns')).toHaveLength(3);
  });

  it('emits list-updated when ColumnPicker applies changes', async () => {
    const picker = wrapper.findComponent({ name: 'FrColumnPicker' });
    const newActiveColumns = [
      { key: '1', label: '1', enabled: true },
      { key: '3', label: '3', enabled: true },
    ];

    await picker.vm.$emit('apply', newActiveColumns);

    expect(wrapper.emitted()['list-updated']).toBeTruthy();
    const updatedList = wrapper.emitted()['list-updated'][0][0];
    expect(updatedList.find((c) => c.key === '1').enabled).toBe(true);
    expect(updatedList.find((c) => c.key === '2').enabled).toBe(false);
    expect(updatedList.find((c) => c.key === '3').enabled).toBe(true);
  });

  it('resetList() calls internal loadColumns', async () => {
    expect(wrapper.vm.resetList).toBeDefined();
    await wrapper.vm.resetList();
    expect(mockLoadColumns).toHaveBeenCalled();
  });
});

describe('ListOrganizer Component with columnOrganizerKey', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = mount(ListOrganizer, {
      ...defaultProps,
      props: {
        ...defaultProps.props,
        columnOrganizerKey: 'test-key',
      },
    });
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();
  });

  it('view column icon should have correct classes', async () => {
    const button = wrapper.find('button');
    expect(button.attributes('class')).toContain('btn-link text-dark');
  });

  it('allColumnsDisabled should update based on activeColumns length', async () => {
    expect(wrapper.vm.allColumnsDisabled).toBe(false);

    // Simulate all columns unchecked by updating active-columns
    const picker = wrapper.findComponent({ name: 'FrColumnPicker' });
    await picker.vm.$emit('update:activeColumns', []);

    expect(wrapper.vm.allColumnsDisabled).toBe(true);
  });
});
