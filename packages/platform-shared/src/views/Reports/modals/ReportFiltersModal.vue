<!-- Copyright 2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

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
    @hidden="resetValues"
    @show="cloneExistingFilter">
    <FrFilterBuilderGroup
      path="0"
      class="pb-3 background-none"
      :condition-options="conditionOptions"
      :rules="queryFilter"
      :resource-name="``"
      :depth="0"
      :max-depth="1"
      :index="0"
      :operator-options="operatorOptions"
      :properties="dataSourceColumns"
      :property-select-label="$t('common.value')"
      :prefix-group-text="$t('queryFilterBuilder.includeWhen')"
      @add-rule="updateFilter('add-rule', $event)"
      @remove-rule="updateFilter('remove-rule', $event)"
      @operator-change="updateFilter('operator-change', $event)"
      @rule-change="updateFilter('rule-change', $event)">
      <template #valueField="{ rule, uniqueName }">
        <BContainer
          v-if="rule.value !== undefined"
          class="p-0"
          data-testid="filter-builder-values">
          <BRow no-gutters>
            <BCol
              class="d-flex"
              md="12">
              <BDropdown
                :id="`filter-type-${uniqueName}}`"
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
                :id="`right-value-${uniqueName}}`"
                :label="$t('common.value')"
                :name="uniqueName"
                :options="variableOptions[rule.operator] || []"
                :type="rule.selectedRightValueType === 'literal' ? 'string' : 'select'"
                class="flex-grow-1 fr-right-value-input-styles" />
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
          @click="$emit('update-filters', 'filter', queryFilter); modalHiddenAfterSave = true" />
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
  provide,
  ref,
  watch,
} from 'vue';
import {
  BCol,
  BContainer,
  BButton,
  BDropdown,
  BDropdownItem,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrFilterBuilderGroup from '@forgerock/platform-shared/src/components/filterBuilder/components/FilterBuilderGroup';
import { operatorOptions } from '@forgerock/platform-shared/src/components/filterBuilder/utils/QueryFilterDefaults';
import { findGroup } from '@forgerock/platform-shared/src/components/filterBuilder/utils/filterBuilderUtils';
import i18n from '@/i18n';

// Definitions
const emit = defineEmits(['get-field-options', 'update-filters']);
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
    type: Array,
    default: () => [],
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

// Globals
const existingFilterClone = ref([]);
const modalHiddenAfterSave = ref(false);
const queryFilter = ref({});
const rightValueTypes = [
  { label: i18n.global.t('common.literal'), value: 'literal' },
  { label: i18n.global.t('common.variable'), value: 'variable' },
];
let uniqueIndex = 0;

// Functions
/**
 * Clones an existing filter so we can have a snapshot of the original data
 */
function cloneExistingFilter() {
  existingFilterClone.value = cloneDeep(props.existingFilter);
}

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
 * @property {String} operator - Operator to compare the field's value to
 * @property {String} selectedRightValueType - right value type (literal, variable)
 * @property {String} value - Field value of new rule
 * @returns {Object} Newly generated rule with given values or default values
 */
function getDefaultRule(
  field = '',
  operator = 'contains',
  selectedRightValueType = 'literal',
  value = '',
) {
  return {
    field,
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
    _id: 'filter-group',
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
  } else {
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
      delete group.subfilters[index].value;
    } else {
      group.subfilters[index].selectedRightValueType = 'literal';
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

// Resets the form values
function resetValues() {
  if (!props.existingFilter.length) {
    queryFilter.value = getDefaultGroup();
  } else if (!modalHiddenAfterSave.value) {
    [queryFilter.value] = existingFilterClone.value;
  }
  modalHiddenAfterSave.value = false;
}

// Computed
const disableSave = computed(() => {
  const emptyQueries = queryFilter.value.subfilters.filter(({ field, value }) => !field || (value !== undefined && !value));
  return !!emptyQueries.length;
});

// Populates filter values from existing filter
watch(() => props.existingFilter, (filter) => {
  const [group] = filter;
  if (group) {
    queryFilter.value = group;
  } else {
    queryFilter.value = getDefaultGroup();
  }
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
