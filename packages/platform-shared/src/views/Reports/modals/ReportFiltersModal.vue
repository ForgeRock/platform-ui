<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="report-filters-modal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('reports.template.addFilters')"
    @show="fetchAllFieldOptions">
    <FrFilterBuilderGroup
      path="0"
      class="pb-3 background-none"
      :condition-options="conditionOptions"
      :rules="queryFilter"
      :resource-name="``"
      :depth="0"
      :max-depth="4"
      :index="0"
      :operator-options="operatorOptions"
      :properties="dataSourceColumnsSortedAndFiltered"
      :property-select-label="$t('common.value')"
      :prefix-group-text="$t('queryFilterBuilder.includeWhen')"
      @add-rule="updateFilter('add-rule', $event)"
      @remove-rule="updateFilter('remove-rule', $event)"
      @operator-change="updateFilter('operator-change', $event)"
      @rule-change="updateFilter('rule-change', $event)">
      <template #valueField="{ rule, uniqueName }">
        <BContainer
          fluid
          class="p-0"
          data-testid="filter-builder-values">
          <BRow no-gutters>
            <BCol
              class="d-flex"
              md="12">
              <template v-if="rule.operator !== 'is_null' && rule.operator !== 'is_not_null'">
                <BDropdown
                  :id="`filter-type-${uniqueName}`"
                  :text="rightValueTypes.find((obj) => obj.value === rule.selectedRightValueType).label"
                  class="fr-type-button-styles"
                  toggle-class="text-dark py-2"
                  variant="link">
                  <BDropdownItem
                    v-for="(option, key) in rightValueTypes"
                    :active="option.value === rule.selectedRightValueType"
                    :key="key"
                    @click.prevent="rightValueTypeUpdate(rule, option.value)">
                    {{ option.label }}
                  </BDropdownItem>
                </BDropdown>
                <FrField
                  v-model="rule.value"
                  :id="`right-value-${uniqueName}`"
                  :label="$t('common.value')"
                  :name="uniqueName"
                  :options="rule.selectedRightValueType === 'variable' ? variableOptions[rule.operator] || [] : rule.value"
                  :taggable="rule.fieldType === 'multiselect'"
                  :type="rule.fieldType"
                  :testid="`right-value-${rule.fieldType}-${uniqueName}`"
                  class="flex-grow-1 fr-right-value-input-styles" />
              </template>
            </BCol>
          </BRow>
        </BContainer>
      </template>
    </FrFilterBuilderGroup>
    <template #modal-footer="{ cancel }">
      <div class="d-flex">
        <BButton
          variant="link"
          :disabled="isSaving"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :disabled="isSaving || disableSave"
          :show-spinner="isSaving"
          variant="primary"
          @click="saveFilter" />
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description
 * Modal for adding filters to a custom analytics report template.
 */
import {
  computed,
  nextTick,
  provide,
  ref,
  watch,
} from 'vue';
import {
  BButton,
  BCol,
  BContainer,
  BDropdown,
  BDropdownItem,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { cloneDeep, isEqual } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrFilterBuilderGroup from '@forgerock/platform-shared/src/components/filterBuilder/components/FilterBuilderGroup';
import { operatorOptions } from '@forgerock/platform-shared/src/components/filterBuilder/utils/QueryFilterDefaults';
import { findGroup } from '@forgerock/platform-shared/src/components/filterBuilder/utils/filterBuilderUtils';
import useReportSettings from '../composables/ReportSettings';
import i18n from '@/i18n';

// Definitions
const emit = defineEmits(['get-field-options', 'update-filter']);
const props = defineProps({
  conditionOptions: {
    type: Object,
    default: () => ({}),
  },
  dataSourceColumns: {
    type: Array,
    default: () => [],
  },
  existingFilter: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  variableOptions: {
    type: Object,
    default: () => ({}),
  },
});

// Composables
const { sortCompare } = useReportSettings();

// Globals
const existingFilterClone = ref({});
const queryFilter = ref({});
const rightValueTypes = [
  { label: i18n.global.t('common.literal'), value: 'literal' },
  { label: i18n.global.t('common.variable'), value: 'variable' },
];
let uniqueIndex = 0;

// Functions

/**
 * Ensures our keys in v-if iteration have unique values
 *
 * @returns {number} New unique index
 */
function getUniqueIndex() {
  uniqueIndex += 1;
  return uniqueIndex;
}

/**
 * Generates default rule based on passed-in values
 * @property {String} field - Field name of new rule
 * @property {String} fieldType - Field type of new rule
 * @property {String} operator - Operator to compare the field's value to
 * @property {String} selectedRightValueType - right value type (literal, variable)
 * @property {String} value - Field value of new rule
 * @returns {Object} Newly generated rule with given values or default values
 */
function getDefaultRule(
  field = '',
  fieldType = 'string',
  operator = 'contains',
  selectedRightValueType = 'literal',
  value = '',
) {
  return {
    field,
    fieldType,
    operator,
    selectedRightValueType,
    value,
    uniqueIndex: getUniqueIndex(),
  };
}

/**
 * Generates default group based on values passed in
 * @property {Array} data - the rules that belong in this group
 * @property {String} operator - 'and' or 'or' operator
 * @returns {Object} Newly generated group with given rules or default rule
 */
function getDefaultGroup(
  data = [getDefaultRule()],
  operator = operatorOptions.Any.delimeter,
) {
  return {
    operator,
    subfilters: data,
    uniqueIndex: getUniqueIndex(),
  };
}

/**
 * Updates the right value rule input
 * @property {Object} rule - the rule that belong to the current group
 * @property {String} type - 'literal' or 'variable' right value types
 * @returns {Object} Newly generated group with given rules or default rule
 */
function rightValueTypeUpdate(rule, type) {
  rule.selectedRightValueType = type;

  if (type === 'variable') {
    if (!props.variableOptions[rule.operator]) {
      emit('get-field-options', rule.operator);
    }
    rule.fieldType = 'select';
    rule.value = '';
  } else if (rule.operator === 'in' || rule.operator === 'not_in') {
    rule.fieldType = 'multiselect';
    rule.value = [];
  } else {
    rule.fieldType = 'string';
    rule.value = '';
  }
}

/**
 * Builds updated filter with newly changed rules
 * @property {string} eventName - name of emitted event to determine exactly what to update
 * @property {Object} data - updated values
 */
function updateFilter(eventName, data) {
  const {
    depth, index, path, value, type,
  } = data;
  const paths = path.split(':');
  const group = findGroup(queryFilter.value, paths, 0, depth);
  const subFilter = type === 'row' ? getDefaultRule : getDefaultGroup;

  if (
    eventName === 'rule-change'
    && value.operator
    && value.operator !== 'is_null'
    && value.operator !== 'is_not_null'
    && group.subfilters[index].selectedRightValueType === 'variable'
    && !props.variableOptions[value.operator]
  ) {
    // Fetch new variable filter options from newly selected operator
    emit('get-field-options', value.operator);
  }

  if (eventName === 'rule-change' && value.operator) {
    if (value.operator === 'is_null' || value.operator === 'is_not_null') {
      delete group.subfilters[index].selectedRightValueType;
      delete group.subfilters[index].fieldType;
      delete group.subfilters[index].value;
    } else {
      if (!group.subfilters[index].selectedRightValueType) {
        group.subfilters[index].selectedRightValueType = 'literal';
      }

      if (value.operator === 'in' || value.operator === 'not_in') {
        if (group.subfilters[index].selectedRightValueType === 'literal') {
          group.subfilters[index].fieldType = 'multiselect';
        } else {
          group.subfilters[index].fieldType = 'select';
        }
      } else if (group.subfilters[index].selectedRightValueType === 'literal') {
        group.subfilters[index].fieldType = 'string';
      } else {
        group.subfilters[index].fieldType = 'select';
      }

      group.subfilters[index].value = '';
    }
  }

  switch (eventName) {
    case 'add-rule':
      group.subfilters.splice(index + 1, 0, subFilter());
      break;
    case 'operator-change':
      group.operator = value;
      break;
    case 'rule-change':
      group.subfilters[index] = { ...group.subfilters[index], ...value };
      break;
    case 'remove-rule':
      group.subfilters.splice(index, 1);
      break;
    default:
      break;
  }
}

/**
 * Saves the filter
 */
function saveFilter() {
  emit('update-filter', 'filter', 0, queryFilter.value);
  existingFilterClone.value = cloneDeep(queryFilter.value);
}

/**
 * Fetches fieldoptions for all unique rule operators
 */
async function fetchAllFieldOptions() {
  // Necessary because the @show hook used to trigger this function in the
  // <BModal> component was not executing in time for the props to populate.
  await nextTick();
  const existingRules = props.existingFilter?.definition?.subfilters;
  const nonFieldoptionOperators = ['is_null', 'is_not_null', 'and', 'or'];
  const operatorList = new Set();

  // In order to be able to identify all unique operators so we can fetch
  // their corresponding field options, we must search through the rules
  // array and call this function recursively when we run into a subfilters
  // property, since this property assumes a nested set of filter rules.
  function rulesRecursion(rules) {
    rules.forEach((rule) => {
      if (rule.subfilters) {
        rulesRecursion(rule.subfilters);
      }

      if (!nonFieldoptionOperators.includes(rule.operator)) {
        operatorList.add(rule.operator);
      }
    });
  }

  if (existingRules) {
    rulesRecursion(existingRules);
  } else {
    operatorList.add('contains');
    queryFilter.value = getDefaultGroup();
  }
  operatorList.forEach((operator) => { emit('get-field-options', operator); });
}

/**
 * Populates the filter rules when props.existingFilter changes
 */
async function populateForm() {
  const existingFilterDefinition = props.existingFilter?.definition;

  if (existingFilterDefinition) {
    if (!isEqual(existingFilterDefinition, existingFilterClone.value)) {
      queryFilter.value = cloneDeep(existingFilterDefinition);
      existingFilterClone.value = cloneDeep(existingFilterDefinition);
    } else {
      queryFilter.value = cloneDeep(existingFilterClone.value);
    }
  }
}

function hasEmptyValues(obj) {
  // Check if the object itself has an empty 'field' or 'value' property
  if (obj.field === '' || (obj.value !== undefined && !obj.value?.length)) {
    return true;
  }

  // If the object has 'subfilters', recursively check each one
  if (obj.subfilters && Array.isArray(obj.subfilters)) {
    for (let i = 0; i < obj.subfilters.length; i += 1) {
      if (hasEmptyValues(obj.subfilters[i])) {
        return true;
      }
    }
  }

  // If no empty 'field' or 'value' found, return false
  return false;
}

// Computed
const disableSave = computed(() => hasEmptyValues(queryFilter.value));
const dataSourceColumnsSortedAndFiltered = computed(() => props.dataSourceColumns
  .filter(({ type }) => type !== 'json' && type !== 'array')
  .map(({ path }) => ({ value: path, label: path }))
  .sort((a, b) => sortCompare(a, b, 'path')));

// Watchers
watch(() => props.existingFilter, () => {
  populateForm();
});

// Start
(() => {
  // Provide fieldWidth for filterBuilderRow to use
  provide('fieldWidth', 12);
  // Instantiates the query filter builder
  queryFilter.value = getDefaultGroup();
})();
</script>

<style lang="scss">
.background-none,
.background-none .card,
.card-container-properties {
  background: none;
}

.card-queryfilter-builder {
  &.depth-1 {
    border-left: 2px solid $blue;
  }

  &.depth-2 {
    border-left: 2px solid $green;
  }

  &.depth-3 {
    border-left: 2px solid $yellow;
  }

  &.depth-4 {
    border-left: 2px solid $red;
  }
}
</style>

<style lang="scss" scoped>
.fr-type-button-styles {
  width: 124px;
  border: 1px solid $gray-400;
  border-right: 0;
  border-radius: 5px 0 0 5px;
}

.fr-right-value-input-styles {
  :deep(input),
  :deep(.multiselect__tags) {
    border-radius: 0 5px 5px 0 !important;
  }
}
</style>
