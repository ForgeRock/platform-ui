/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  ref,
  computed,
  watch,
  onMounted,
  toValue,
} from 'vue';
import { cloneDeep, sortBy } from 'lodash';
import { getValueFromLocalStorage, setLocalStorageValue, removeLocalStorageValue } from '@forgerock/platform-shared/src/utils/localStorageUtils';

// Keys that indicate a column has visibility - this is not always a uniform name so we check for multiple common options
const VISIBILITY_KEYS = ['enabled', 'show'];

/**
 * Checks if a column object has any of the common "enabled" properties.
 * This is used to determine if the column configuration uses an "enabled" flag approach or a flat list approach.
 *
 * @param {Object} col - The column object to check
 * @returns {Boolean} True if the column has any visibility keys, false otherwise
 */
function hasEnabledProp(col) {
  return VISIBILITY_KEYS.some((key) => Object.prototype.hasOwnProperty.call(col, key));
}

/**
 * Checks if a column is enabled based on common "enabled" properties.
 *
 * @param {Object} col - The column object to check
 * @returns {Boolean} True if the column is enabled, false otherwise
 */

function isColumnEnabled(col) {
  return VISIBILITY_KEYS.every((key) => !Object.prototype.hasOwnProperty.call(col, key) || col[key] !== false);
}

/**
 * Sets a column as enabled based on common "enabled" properties.
 *
 * @param {Object} col - The column object to update
 */
function setColumnEnabled(col) {
  VISIBILITY_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(col, key)) col[key] = true;
  });
}

/**
 * Headless orchestrator for the ColumnPicker component.
 * This hook is intended to be used by the component managing the table.
 *
 * @param {Array|Ref|Function} initialColumns - The full list of available columns used as the source for resolving stored keys (can be reactive)
 * @param {Object} options - Configuration options
 * @param {String|Ref|Function} options.storageKey - Key for localStorage persistence (can be reactive)
 * @param {Array|Ref|Function} [options.defaultColumns] - Columns to restore when "Reset to Default" is clicked. If omitted, falls back to initialColumns.
 */
export default function useColumnPicker(initialColumns = [], options = {}) {
  const activeColumns = ref([]);
  const showModal = ref(false);
  const currentStorageKey = computed(() => toValue(options.storageKey));
  // ignoredColumnKeys should always be a string array and include 'actions' as a default ignored key.
  const ignoredColumnKeys = computed(() => {
    const additional = toValue(options.ignoredColumnKeys) || [];
    const keys = Array.isArray(additional) ? additional : [additional];
    return ['actions', ...keys.map((k) => String(k))];
  });
  const tableHiddenColumnKeys = computed(() => {
    const additional = toValue(options.tableHiddenColumnKeys) || [];
    const keys = Array.isArray(additional) ? additional : [additional];
    return keys.map((k) => String(k));
  });

  /**
   * Loads columns from local storage or defaults to defaultColumns (or initialColumns as fallback).
   * Handles both flat arrays and  "enabled" flag arrays.
   * Also prunes columns that are no longer available in the source list.
   */
  function loadColumns() {
    const stored = currentStorageKey.value ? getValueFromLocalStorage(currentStorageKey.value) : null;
    const source = toValue(initialColumns);
    const optionDefaults = toValue(options.defaultColumns);
    // If no default options are provided, fall back to source columns as the default
    const defaults = optionDefaults?.length ? optionDefaults : source;
    let baseColumns = [];

    // Any stored values that are not a string array are treated as stale and ignored.
    const isValidFormat = Array.isArray(stored) && stored.every((item) => typeof item === 'string');

    if (isValidFormat && stored.length) {
      baseColumns = stored.map((id) => {
        const found = source.find((c) => (c.value || c.key) === id);
        if (found) {
          const cloned = cloneDeep(found);
          setColumnEnabled(cloned);
          return cloned;
        }
        // If a stored column isn't found but is part of the ignored column keys we return a placeholder object.
        // This should never happen since ignored columns are filtered out before saving, but this is a safeguard against stale storage values.
        if (ignoredColumnKeys.value.includes(id)) {
          return { value: id, key: id };
        }
        return null;
      }).filter(Boolean);
    } else {
      baseColumns = defaults;
    }

    if (baseColumns.length > 0) {
      activeColumns.value = hasEnabledProp(baseColumns[0])
        ? baseColumns.filter((c) => isColumnEnabled(c))
        : baseColumns;
    } else {
      activeColumns.value = [];
    }

    // Prune stale columns that no longer exist in the current source
    const validIds = new Set(source.map((c) => c.value || c.key));
    activeColumns.value = activeColumns.value.filter((c) => {
      const id = c.value || c.key;
      return ignoredColumnKeys.value.includes(id) || validIds.has(id);
    });

    activeColumns.value = cloneDeep(activeColumns.value);
  }

  /**
   * Saves new selection to local storage and updates reactive state.
   * If the new selection matches the default columns, the storage key is removed.
   * @param {Array} newColumns - The new set of active columns
   */
  function saveColumns(newColumns) {
    const source = toValue(initialColumns);
    const rawDefaults = toValue(options.defaultColumns);
    const defaults = rawDefaults?.length ? rawDefaults : source;
    const hiddenInState = activeColumns.value.filter((c) => ignoredColumnKeys.value.includes(c.value || c.key));
    const columnsToSave = cloneDeep(newColumns);
    columnsToSave.forEach(setColumnEnabled);

    hiddenInState.forEach((hiddenCol) => {
      const id = hiddenCol.value || hiddenCol.key;
      if (!columnsToSave.find((c) => (c.value || c.key) === id)) {
        columnsToSave.push(hiddenCol);
      }
    });

    if (currentStorageKey.value) {
      const validIds = new Set(source.map((c) => c.value || c.key));
      const isVisible = (c) => !ignoredColumnKeys.value.includes(c.value || c.key);
      const normalizedDefaults = (defaults.length > 0 && hasEnabledProp(defaults[0])
        ? defaults.filter((c) => isColumnEnabled(c))
        : defaults)
        .filter((c) => isVisible(c) && validIds.has(c.value || c.key));

      const defaultVisibleIds = normalizedDefaults.map((c) => c.value || c.key).join(',');
      const newVisibleIds = columnsToSave.filter(isVisible).map((c) => c.value || c.key).join(',');

      // Only persist if there is a difference from defaults to avoid unnecessary localStorage usage.
      if (defaultVisibleIds === newVisibleIds) {
        removeLocalStorageValue(currentStorageKey.value);
      } else {
        setLocalStorageValue(currentStorageKey.value, columnsToSave.map((c) => c.value || c.key || c));
      }
    }
    activeColumns.value = columnsToSave;
  }

  /**
   * Helper to map active columns back to a full list with 'enabled' flags.
   *
   * @param {Array} active - The currently active columns
   * @param {Array} original - The full list of available columns
   * @param {Object} syncOptions - Sync options
   * @param {Boolean} syncOptions.sortDisabledAlphabetically - If true, disabled items are sorted by label
   * @returns {Array} Combined list with enabled flags
   */
  function syncWithOriginalList(active, original, syncOptions = {}) {
    const activeKeys = active.map((ac) => ac.value || ac.key);
    const activePart = active.map((ac) => {
      const found = original.find((v) => (v.value || v.key) === (ac.value || ac.key));
      return { ...found, enabled: true };
    });
    let inactivePart = original
      .filter((col) => !activeKeys.includes(col.value || col.key))
      .map((col) => {
        const isIgnored = ignoredColumnKeys.value.includes(col.value || col.key);
        return { ...col, enabled: isIgnored ? (col.enabled !== false) : false };
      });

    if (syncOptions.sortDisabledAlphabetically) {
      inactivePart = sortBy(inactivePart, [(col) => (col.label || '').toLowerCase()]);
    }

    return [...activePart, ...inactivePart];
  }

  function open() {
    showModal.value = true;
  }

  // Props to be spread onto ColumnPicker v-bind="pickerProps"
  const pickerProps = computed(() => ({
    show: showModal.value,
    activeColumns: activeColumns.value,
    ignoredColumnKeys: ignoredColumnKeys.value,
    defaultColumns: toValue(options.defaultColumns)?.length ? toValue(options.defaultColumns) : toValue(initialColumns),
    'onUpdate:show': (val) => { showModal.value = val; },
    'onUpdate:activeColumns': (val) => {
      const source = toValue(initialColumns);
      const hiddenInSource = source.filter((c) => ignoredColumnKeys.value.includes(c.value || c.key));
      const newVal = cloneDeep(val);
      hiddenInSource.forEach((hiddenCol) => {
        const id = hiddenCol.value || hiddenCol.key;
        if (!newVal.find((c) => (c.value || c.key) === id)) {
          newVal.push(hiddenCol);
        }
      });
      activeColumns.value = newVal;
    },
    onApply: saveColumns,
  }));

  watch(currentStorageKey, () => {
    loadColumns();
  });

  watch(() => toValue(initialColumns), () => {
    loadColumns();
  }, { deep: true });

  onMounted(() => {
    loadColumns();
  });

  // The list of columns to actually show in the table, filtering out any that are hidden via tableHiddenColumnKeys
  const visibleColumns = computed(() => {
    const current = activeColumns.value.length === 0 ? toValue(initialColumns) : activeColumns.value;
    return current.filter((c) => !tableHiddenColumnKeys.value.includes(c.value || c.key));
  });

  return {
    activeColumns,
    visibleColumns,
    show: showModal,
    open,
    pickerProps,
    loadColumns,
    saveColumns,
    syncWithOriginalList,
  };
}
