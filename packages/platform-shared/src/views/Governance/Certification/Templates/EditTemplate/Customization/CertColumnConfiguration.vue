<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrColumnConfiguration
      class="my-4"
      :select-inputs="selectFields"
      :model-value="selectedColumnsList"
      @update:model-value="handleUpdate" />
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

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
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
    showFor: ['accounts', 'entitlements', 'roles'],
  },
  {
    key: 'application',
    label: 'Application',
    options: getSelectOptionsForCategory('application'),
    showFor: ['accounts', 'entitlements', 'entitlementComposition'],
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
    showFor: ['roles'],
  },
  {
    key: 'review',
    label: 'Review',
    options: getSelectOptionsForCategory('review'),
    showFor: ['accounts', 'entitlements', 'roles', 'entitlementComposition'],
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
  }));
});

</script>
