<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrColumnConfiguration
      class="my-4"
      :select-inputs="selectFields"
      :model-value="selectedColumnsList"
      @update:model-value="handleUpdate"
      @update:sortable-columns="emit('update:sortableColumns', $event)" />
  </div>
</template>

<script setup>
/**
 * Configures the columns of the table for each grant type of a certification.
 * Column options are based on the grant filter properties.
 * The available column categories are dependent on the grant type.
 */
import { computed } from 'vue';
import { startCase } from 'lodash';
import FrColumnConfiguration from '@forgerock/platform-shared/src/components/ColumnConfiguration/ColumnConfiguration';
import { OOTBColumns } from './baseColumnConfig';

const emit = defineEmits(['update:modelValue', 'update:sortableColumns']);

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  sortableColumns: {
    type: Array,
    default: () => [],
  },
  grantFilterProperties: {
    type: Object,
    required: true,
  },
  grantType: {
    type: String,
    required: true,
  },
  autoIdEnabled: {
    type: Boolean,
    default: false,
  },
  // grant flags from the template summary — gates which access columns agentAccess offers
  summary: {
    type: Object,
    default: () => ({}),
  },
});

/**
 * Retrieves the out-of-the-box (OOTB) columns for a given category.
 *
 * @param {string} category - The category for which to fetch the default columns.
 * @returns {Array} An array of column definitions associated with the specified category.
 */
function getOOTBColumns(category) {
  const columns = Object.keys(OOTBColumns).filter((column) => column.startsWith(category) && (props.autoIdEnabled || column !== 'review.prediction'));
  return columns.map((column) => ({
    selectLabel: OOTBColumns[column].label,
    listLabel: OOTBColumns[column].label,
    value: column,
    // optional per-column declaration: present means this column's Sortable
    // toggle is hidden in the picker (no server-side sort exists for it)
    hideSortable: OOTBColumns[column].hideSortable,
  }));
}

/**
 * Returns an array of select options based on the provided category.
 *
 * @param {string} category - The category for which to retrieve select options.
 * @returns {Array<Object>} An array of option objects suitable for use in a select input.
 */
function getSelectOptionsForCategory(category) {
  const categoryColumns = props.grantFilterProperties[category]?.map((property) => ({
    selectLabel: property.displayName || property.label,
    listLabel: `${startCase(category)} ${startCase(property.displayName)}`,
    value: `${category}.${property.key}`,
  })) || [];

  return [
    ...getOOTBColumns(category),
    ...categoryColumns,
  ];
}

const categorySelects = computed(() => [
  {
    key: 'user',
    label: 'User',
    options: getSelectOptionsForCategory('user'),
    showFor: ['accounts', 'entitlements', 'roles', 'identityProfile'],
  },
  {
    key: 'application',
    label: 'Application',
    options: getSelectOptionsForCategory('application'),
    showFor: ['accounts', 'entitlements', 'entitlementComposition', 'resource'],
  },
  {
    key: 'account',
    label: 'Account',
    options: getSelectOptionsForCategory('account'),
    showFor: ['accounts', 'entitlements'],
  },
  {
    key: 'entitlement',
    label: 'Entitlement',
    options: getSelectOptionsForCategory('entitlement'),
    showFor: ['entitlements', 'entitlementComposition'],
  },
  {
    key: 'role',
    label: 'Role',
    options: getSelectOptionsForCategory('role'),
    showFor: ['roles', 'roleComposition'],
  },
  {
    key: 'agent',
    label: 'Agent',
    options: getOOTBColumns('agent'),
    showFor: ['agentProfile'],
  },
  {
    // agentAccess items only consistently carry the agent's user identity — the
    // account-derived platform/model/owner columns resolve from agent account
    // records these items don't have, so only the name column is offered
    key: 'agent',
    label: 'Agent',
    options: getOOTBColumns('agent').filter((col) => col.value === 'agent.agent'),
    showFor: ['agentAccess'],
  },
  {
    key: 'resource',
    label: 'Resource',
    options: getSelectOptionsForCategory('resource'),
    showFor: ['resource'],
  },
  {
    key: 'review',
    label: 'Review',
    options: getSelectOptionsForCategory('review'),
    showFor: ['accounts', 'entitlements', 'roles', 'entitlementComposition', 'identityProfile', 'roleComposition', 'agentProfile', 'agentAccess', 'resource'],
  },
]);

const selectFields = computed(() => categorySelects.value.filter((select) => select.showFor.includes(props.grantType)));

/**
 * Returns the display label for a given column configuration.
 *
 * @param {Object} column - The column configuration object.
 * @returns {string} The label to display for the column.
 */
function getColumnLabel(column) {
  if (Object.keys(OOTBColumns).includes(column)) {
    return OOTBColumns[column].label;
  }

  const [category] = column.split('.');
  return categorySelects.value.find((select) => select.key === category)?.options
    .find((option) => option.value === column)?.listLabel || '';
}

/**
 * Handles the update event for the certification column configuration.
 *
 * @param {Event} event - The event object containing details about the update action.
 */
function handleUpdate(event) {
  emit('update:modelValue', event.map((field) => field.value));
}

/**
 * Returns the hideSortable declaration for a column value, looking it up from
 * the category select options. Saved configurations are plain strings, so the
 * flag must be re-applied from its declaration on every load — otherwise a
 * flagged column's Sortable toggle reappears once its selection round-trips.
 *
 * @param {string} value - Column value (e.g. "agent.platform").
 * @returns {Boolean|undefined} The declared hideSortable flag, if any.
 */
function getHideSortable(value) {
  return categorySelects.value
    .flatMap((select) => select.options)
    .find((option) => option.value === value)?.hideSortable;
}

/**
 * Initializes the component based on the provided model value.
 */
const selectedColumnsList = computed(() => {
  if (!props.modelValue || !Array.isArray(props.modelValue)) {
    return [];
  }
  return props.modelValue.map((field) => ({
    selectLabel: getColumnLabel(field),
    listLabel: getColumnLabel(field),
    value: field,
    sortable: props.sortableColumns.includes(field),
    hideSortable: getHideSortable(field),
  }));
});

</script>
