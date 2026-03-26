/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { defineComponent, toRef } from 'vue';
import * as localStorageUtils from '@forgerock/platform-shared/src/utils/localStorageUtils';
import useColumnPicker from './useColumnPicker';

jest.mock('@forgerock/platform-shared/src/utils/localStorageUtils');

const initialColumns = [
  { value: 'user.name', listLabel: 'User Name' },
  { value: 'user.email', listLabel: 'Email' },
];

// Helper to test the composable within a component context
const TestComponent = defineComponent({
  props: {
    initialColumns: {
      type: [Array, Function, Object],
      default: () => [],
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    // We use a function wrapper if we want to test reactivity of props
    const columns = typeof props.initialColumns === 'function' ? props.initialColumns : toRef(props, 'initialColumns');
    return { ...useColumnPicker(columns, props.options) };
  },
  template: '<div></div>',
});

describe('useColumnPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(null);
  });

  it('initializes with correct defaults', () => {
    const wrapper = mount(TestComponent, {
      props: { initialColumns },
    });
    expect(wrapper.vm.activeColumns).toEqual(initialColumns);
    expect(wrapper.vm.show).toBe(false);
    expect(wrapper.vm.pickerProps.show).toBe(false);
    expect(wrapper.vm.pickerProps.activeColumns).toEqual(initialColumns);
  });

  it('filters visibleColumns using tableHiddenColumnKeys', () => {
    const cols = [
      { key: 'a' },
      { key: 'b' },
      { key: 'actions' },
    ];
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns: cols,
        options: { tableHiddenColumnKeys: ['actions'] },
      },
    });

    // visibleColumns should not include 'actions'
    expect(wrapper.vm.visibleColumns.map((c) => c.key)).toEqual(['a', 'b']);
    // activeColumns should still include 'actions'
    expect(wrapper.vm.activeColumns.map((c) => c.key)).toContain('actions');
  });

  it('loads columns from localStorage if it exists', () => {
    const stored = ['user.name'];
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(stored);

    const wrapper = mount(TestComponent, {
      props: {
        initialColumns,
        options: { storageKey: 'test-key' },
      },
    });

    expect(localStorageUtils.getValueFromLocalStorage).toHaveBeenCalledWith('test-key');
    // Should have reconstructed the full object from initialColumns
    expect(wrapper.vm.activeColumns).toEqual([initialColumns[0]]);
  });

  it('prunes stale columns from localStorage that no longer exist in available columns', () => {
    const stored = ['user.name', 'stale.column'];
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(stored);

    const wrapper = mount(TestComponent, {
      props: {
        initialColumns, // Only has name and email
        options: { storageKey: 'test-key' },
      },
    });

    // Should only have user.name
    expect(wrapper.vm.activeColumns).toHaveLength(1);
    expect(wrapper.vm.activeColumns[0].value).toBe('user.name');
  });

  it('always preserves "actions" column even if not in validIds (it is handled internally)', () => {
    const stored = ['user.name', 'actions'];
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(stored);

    const wrapper = mount(TestComponent, {
      props: {
        initialColumns: [{ value: 'user.name' }],
        options: { storageKey: 'test-key' },
      },
    });

    expect(wrapper.vm.activeColumns.map((c) => c.value)).toContain('actions');
  });

  it('reacts to dynamic initialColumns changes', async () => {
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns: [{ value: 'a' }],
      },
    });

    expect(wrapper.vm.activeColumns).toEqual([{ value: 'a' }]);

    await wrapper.setProps({
      initialColumns: [{ value: 'b' }],
    });

    expect(wrapper.vm.activeColumns).toEqual([{ value: 'b' }]);
  });

  it('discards invalid object-array storage format and falls back to initialColumns', () => {
    // Non-string array stored formats should be loaded but ignored
    const stored = [
      { key: 'col1', enabled: true },
      { key: 'col2', enabled: false },
    ];
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(stored);

    const cols = [{ key: 'col1' }, { key: 'col2' }];
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns: cols,
        options: { storageKey: 'test-key' },
      },
    });

    // Storage is not used, activeColumns falls back to the full initialColumns list
    expect(wrapper.vm.activeColumns).toEqual(cols);
  });

  it('discards verbose object-array storage format (with sortable, class, etc.) and falls back to initialColumns', () => {
    // Mirrors the legacy localStorage shape from the previous column picker implementation
    const stored = [
      {
        key: 'givenName', label: 'First Name', sortable: false, enabled: true, sortDirection: 'desc', class: 'text-truncate',
      },
      {
        key: 'cn', label: 'Common Name', sortable: false, enabled: false, sortDirection: 'desc', class: 'text-truncate',
      },
      {
        key: 'sn', label: 'Last Name', sortable: false, enabled: true, sortDirection: 'desc', class: 'text-truncate',
      },
    ];
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(stored);

    const cols = [{ key: 'givenName' }, { key: 'cn' }, { key: 'sn' }];
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns: cols,
        options: { storageKey: 'identities_alpha_user_0_columns' },
      },
    });

    // Storage is ignored, activeColumns falls back to the full initialColumns list
    expect(wrapper.vm.activeColumns).toEqual(cols);
  });

  it('does NOT filter out "actions" column and defaults to enabled columns if no storage exists', () => {
    const cols = [
      { key: 'col1', enabled: true },
      { key: 'col2', enabled: false },
      { key: 'actions', enabled: true },
    ];
    const wrapper = mount(TestComponent, {
      props: { initialColumns: cols },
    });

    // Should have both col1 and actions (both are enabled)
    expect(wrapper.vm.activeColumns).toEqual([
      { key: 'col1', enabled: true },
      { key: 'actions', enabled: true },
    ]);
  });

  it('preserves "actions" column enabled state in syncWithOriginalList', () => {
    const wrapper = mount(TestComponent);
    const original = [
      { key: 'a', enabled: true },
      { key: 'actions', enabled: true },
    ];
    const active = [{ key: 'a', enabled: true }];

    const result = wrapper.vm.syncWithOriginalList(active, original);

    // actions should stay enabled even if not in active
    expect(result).toEqual([
      { key: 'a', enabled: true },
      { key: 'actions', enabled: true },
    ]);
  });

  it('updates storage and state on save', () => {
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns,
        options: { storageKey: 'test-key' },
      },
    });

    const newCols = [{ value: 'user.name' }];
    wrapper.vm.saveColumns(newCols);

    expect(localStorageUtils.setLocalStorageValue).toHaveBeenCalledWith('test-key', ['user.name']);
    expect(wrapper.vm.activeColumns).toEqual(newCols);
  });

  it('removes storage key when saved columns match initialColumns (no custom defaultColumns)', () => {
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns,
        options: { storageKey: 'test-key' },
      },
    });

    wrapper.vm.saveColumns([...initialColumns]);

    expect(localStorageUtils.removeLocalStorageValue).toHaveBeenCalledWith('test-key');
    expect(localStorageUtils.setLocalStorageValue).not.toHaveBeenCalled();
  });

  it('removes storage key when saved columns match custom defaultColumns after reset', () => {
    const defaultColumns = [{ value: 'user.name' }];
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns, // has user.name + user.email
        options: { storageKey: 'test-key', defaultColumns },
      },
    });

    // Simulate a reset: user saved only the default column
    wrapper.vm.saveColumns([{ value: 'user.name' }]);

    expect(localStorageUtils.removeLocalStorageValue).toHaveBeenCalledWith('test-key');
    expect(localStorageUtils.setLocalStorageValue).not.toHaveBeenCalled();
  });

  it('keeps storage key when saved columns differ from defaultColumns', () => {
    const defaultColumns = [{ value: 'user.name' }];
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns,
        options: { storageKey: 'test-key', defaultColumns },
      },
    });

    // User selected user.email (not the default)
    wrapper.vm.saveColumns([{ value: 'user.email' }]);

    expect(localStorageUtils.setLocalStorageValue).toHaveBeenCalledWith('test-key', ['user.email']);
    expect(localStorageUtils.removeLocalStorageValue).not.toHaveBeenCalled();
  });

  it('removes storage key even when ignored columns appear in different positions', () => {
    const cols = [
      { value: 'user.name' },
      { value: 'actions' }, // ignored column in the middle
      { value: 'user.email' },
    ];
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns: cols,
        options: { storageKey: 'test-key' },
      },
    });

    // Save with actions at the end (different order to source)
    wrapper.vm.saveColumns([{ value: 'user.name' }, { value: 'user.email' }, { value: 'actions' }]);

    expect(localStorageUtils.removeLocalStorageValue).toHaveBeenCalledWith('test-key');
  });

  it('removes storage key correctly when defaultColumns contains a stale column not in initialColumns', () => {
    const defaultColumns = [{ value: 'user.name' }, { value: 'stale.col' }];
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns, // user.name + user.email — no stale.col
        options: { storageKey: 'test-key', defaultColumns },
      },
    });

    // After reset, the stale column is pruned; saving just user.name should remove the key
    wrapper.vm.saveColumns([{ value: 'user.name' }]);

    expect(localStorageUtils.removeLocalStorageValue).toHaveBeenCalledWith('test-key');
  });

  it('initializes from defaultColumns when no stored key is present', () => {
    const defaultColumns = [initialColumns[0]]; // only user.name
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns,
        options: { storageKey: 'test-key', defaultColumns },
      },
    });

    expect(wrapper.vm.activeColumns).toEqual([initialColumns[0]]);
  });

  it('falls back to initialColumns when defaultColumns is an empty array', () => {
    // This guards against the [] || source bug: [] is truthy so it would
    // incorrectly be used as the defaults, leaving activeColumns empty.
    const wrapper = mount(TestComponent, {
      props: {
        initialColumns,
        options: { storageKey: 'test-key', defaultColumns: [] },
      },
    });

    expect(wrapper.vm.activeColumns).toEqual(initialColumns);
    expect(wrapper.vm.pickerProps.defaultColumns).toEqual(initialColumns);
  });

  it('opens modal correctly', () => {
    const wrapper = mount(TestComponent);
    wrapper.vm.open();
    expect(wrapper.vm.show).toBe(true);
    expect(wrapper.vm.pickerProps.show).toBe(true);
  });
});
