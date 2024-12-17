<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard body-class="p-0">
    <template v-if="isBasic">
      <FrFilterBuilderGroup
        path="0"
        class="pb-3 background-none"
        :condition-options="computedConditionOptions"
        :disabled="disabled"
        :rules="queryFilter"
        :resource-name="resourceName"
        :depth="0"
        :max-depth="4"
        :index="0"
        :operator-options="operatorOptions"
        :properties="properties"
        :prefix-group-text="prefixGroupText"
        @add-rule="updateFilter('add-rule', $event)"
        @remove-rule="updateFilter('remove-rule', $event)"
        @operator-change="updateFilter('operator-change', $event)"
        @rule-change="updateFilter('rule-change', $event)">
        <template
          #property-field="{ ruleProperty, uniqueName, ruleChange, rule }"
          v-if="showTemporalValueField">
          <BCol
            class="d-flex mb-2"
            md="12">
            <div class="mr-2">
              <FrField
                :value="rule.temporalValue"
                type="select"
                :disabled="disabled"
                :name="`temporalValue_${uniqueName}`"
                :options="temporalValueOptions"
                :placeholder="i18n.global.t('governance.events.temporalValueField')"
                @input="ruleChange({ temporalValue: $event })" />
            </div>
            <div class="flex-grow-1">
              <FrField
                :value="ruleProperty.value"
                type="select"
                :disabled="disabled"
                :name="`ruleProperty_${uniqueName}`"
                :options="ruleProperty.options"
                :placeholder="propertyPlaceholder"
                @input="ruleProperty.value = $event; ruleChange({ field: $event })" />
            </div>
          </BCol>
        </template>
        <template #valueField="{ inputValue, selectedCondition, ruleChange, selectedProp, uniqueName }">
          <template v-if="!selectedCondition.endsWith('_changed')">
            <FrGovResourceSelect
              v-if="getResourcePath(selectedProp)"
              v-model="inputValue.value"
              @input="ruleChange({ value: resolveRuleChangeValue(selectedProp, $event) })"
              :resource-path="getResourcePath(selectedProp)"
              :label="getResourceLabel(selectedProp)" />
            <FrField
              v-else
              data-testid="selectedProperty"
              v-model="inputValue.value"
              :disabled="disabled"
              :name="uniqueName"
              :options="inputValue.options"
              :type="inputValue.type"
              @input="ruleChange({ value: $event })" />
          </template>
        </template>
      </FrFilterBuilderGroup>
      <div
        v-if="builderError"
        class="fr-validation-requirements text-left error-messages"
        role="alert">
        <p class="text-danger mb-0 error-message iga-error">
          {{ builderError }}
        </p>
      </div>
      <BButton
        v-if="!hideAdvanced"
        class="px-0 pt-4 pb-0"
        variant="link"
        @click="toggleMode(false)">
        {{ $t("queryFilterBuilder.advancedEditor") }}
      </BButton>
    </template>
    <template v-else>
      <FrScriptEditor
        :value="{ source: scriptEditorValue }"
        script-title=""
        :show-file-upload="false"
        :show-variables="false"
        @input="checkFilterString($event.source)"
        :readonly="disabled" />
      <BButton
        :disabled="!allowBasicMode"
        class="px-0"
        variant="link"
        @click="toggleMode(true)">
        {{ $t('queryFilterBuilder.basicEditor') }}
      </BButton>
    </template>
  </BCard>
</template>

<script setup>
/**
 * Filter builder component built around IGA filter structure. This includes before
 * and after filter rule consideration and validation that matching before and after
 * properties are provided.
 */
import {
  computed,
  onMounted,
  provide,
  ref,
} from 'vue';
import { BButton, BCard, BCol } from 'bootstrap-vue';
import {
  cloneDeep, find, omit,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrScriptEditor from '@forgerock/platform-shared/src/components/ScriptEditor';
import FrFilterBuilderGroup from './components/FilterBuilderGroup';
import { temporalValueOptions, governanceConditionOptions, operatorOptions } from './utils/QueryFilterDefaults';
import {
  checkIGAFilterMeetsRequirements,
  checkIGAFilterForArrays,
  checkIGAFilterWithinNLayers,
  convertToIGAFilter,
  convertFromIGAFilter,
  findGroup,
  isGlossaryAttribute,
} from './utils/filterBuilderUtils';
import i18n from '@/i18n';

const props = defineProps({
  disabled: {
    default: false,
    type: Boolean,
  },
  resourceName: {
    required: true,
    type: String,
  },
  properties: {
    default: () => [],
    type: Array,
  },
  filterValue: {
    default: () => ({}),
    type: Object,
  },
  hideAdvanced: {
    default: false,
    type: Boolean,
  },
  hideGroup: {
    default: false,
    type: Boolean,
  },
  ignoreTemporals: {
    default: false,
    type: Boolean,
  },
  rowPosition: {
    default: false,
    type: Boolean,
  },
  prefixGroupText: {
    default: '',
    type: String,
  },
  showTemporalValueField: {
    default: false,
    type: Boolean,
  },
});

const emit = defineEmits(['filter-update', 'toggle-valid']);

const allowBasicMode = ref(true);
const builderError = ref('');
const defaultFilterOperator = operatorOptions.Any.delimeter;
let igaFilter = {};
const isBasic = ref(true);
const queryFilter = ref({});
const scriptEditorValue = ref('');
let uniqueIndex = 0;

const computedConditionOptions = computed(() => {
  // HasChanged HasNotChanged options should only be available when temporalValue field is present
  if (props.showTemporalValueField) {
    return governanceConditionOptions;
  }
  return omit(governanceConditionOptions, ['HasChanged', 'HasNotChanged']);
});

// Provide fieldWidth for filterBuilderRow to use
provide('fieldWidth', props.rowPosition ? 4 : 12);

/**
 * Ensures the keys in v-if iteration have unique values
 *
 * @returns {number} New unique index
 */
function getUniqueIndex() {
  uniqueIndex += 1;
  return uniqueIndex;
}

/**
 * Generates default rule based on values passed in
 * @property {String} temporalValue - Temporal value of new rule (before/after)
 * @property {String} field - Field name of new rule
 * @property {String} operator - Operator to compare the field's value to
 * @property {String} value - Field value of new rule
 *
 * @returns {Object} Newly generated rule with given values or default values
 */
function getDefaultRule(temporalValue = 'after', field = '', operator = 'contains', value = '') {
  return {
    temporalValue,
    field,
    operator,
    value,
    uniqueIndex: getUniqueIndex(),
  };
}

/**
 * Generates default group based on values passed in
 * @property {Array} data - the rules that belong in this group
 * @property {String} operator - 'and' or 'or' operator
 *
 * @returns {Object} Newly generated group with given rules or default rule
 */
function getDefaultGroup(
  data = [getDefaultRule()],
  operator = defaultFilterOperator,
) {
  return {
    subfilters: data,
    operator,
    uniqueIndex: getUniqueIndex(),
  };
}

/**
 * Returns resource path from property value passed in
 * @param {String} prop property value to search for
 */
function getResourcePath(prop) {
  return prop ? find(props.properties, ((x) => x.value === prop))?.path : '';
}

/**
 * Retrieves the label of a resource based on the given property.
 * @param {string} prop - The property to retrieve the resource label for.
 * @returns {string} the label of the resource.
 */
function getResourceLabel(prop) {
  const resourcePath = getResourcePath(prop);
  return resourcePath ? resourcePath.split('/').pop() || '' : '';
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

  switch (eventName) {
    case 'add-rule':
      if (type === 'row') {
        group.subfilters.splice(index + 1, 0, getDefaultRule());
      } else {
        group.subfilters.splice(index + 1, 0, getDefaultGroup());
      }
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
  igaFilter = convertToIGAFilter(queryFilter.value, props.resourceName, props.properties, props.ignoreTemporals);
  // check filter for before/after property matching if the event trigger is user updated (as
  // the user created trigger will only ever have non-temporal properties)
  if (!props.showTemporalValueField || checkIGAFilterMeetsRequirements(igaFilter)) {
    emit('filter-update', igaFilter);
    // clear error
    emit('toggle-valid', true);
    builderError.value = '';
  } else {
    // set error
    emit('toggle-valid', false);
    builderError.value = i18n.global.t('governance.events.errors.filterError');
  }
}

/**
 * Toggles between advanced and basic mode
 *
 * @property {Boolean} showBasic - whether we want to toggle to basic mode
 */
async function toggleMode(showBasic) {
  if (showBasic && checkIGAFilterWithinNLayers(igaFilter, 0, 2)) {
    isBasic.value = true;
    const parsedIgaFilter = JSON.parse(scriptEditorValue.value);
    const response = convertFromIGAFilter(parsedIgaFilter, uniqueIndex);
    queryFilter.value = response.convertedFilter;
    uniqueIndex = response.uniqueIndex;
    igaFilter = parsedIgaFilter;
  } else {
    scriptEditorValue.value = JSON.stringify(igaFilter);
    isBasic.value = false;
  }
}

/**
 * Resolves the value of a rule change based on the property schema key,
 * if the schema property is a glossary attribute and the property itself has a type of reference,
 * that means it is a manged object reference, then return the complete path for the resource,
 * otherwise return the last segment of the path only that is the specific object id.
 * This is needed because the filter works different if it is a OOTB property or is a glossary one.
 *
 * @param {String} propertySchemaKey - the property schema key
 * @param {String} value - the value to resolve
 * @returns {String} the resolved value E.g. /managed/role/role1 or role1
 */
function resolveRuleChangeValue(propertySchemaKey, value) {
  if (isGlossaryAttribute(propertySchemaKey)) {
    const property = props.properties.find((schemaProperty) => schemaProperty.value === propertySchemaKey);
    if (property.type === 'reference') {
      return value;
    }
  }
  return value.split('/').pop();
}

/**
 * Validates the advanced filter string and allows returning to basic if valid
 *
 * @property {String} filterString - Query filter in string form
 */
function checkFilterString(filterString) {
  scriptEditorValue.value = filterString;
  try {
    const currentFilter = JSON.parse(filterString);
    emit('filter-update', currentFilter);
    // look for arrays and depth
    allowBasicMode.value = !checkIGAFilterForArrays(filterString) && checkIGAFilterWithinNLayers(currentFilter, 0, 2);
  } catch {
    allowBasicMode.value = false;
  }
}

function loadFilter() {
  igaFilter = props.filterValue;
  if (!Object.keys(igaFilter).length) {
    igaFilter = { or: [{ starts_with: { prefix: { literal: '' }, value: 'user.before.' } }] };
  }
  if (!checkIGAFilterWithinNLayers(igaFilter, 0, 2) || checkIGAFilterForArrays(JSON.stringify(igaFilter))) {
    allowBasicMode.value = false;
    toggleMode(false);
  }
  const response = convertFromIGAFilter(cloneDeep(props.filterValue), 0, props.ignoreTemporals);
  queryFilter.value = cloneDeep(response.convertedFilter);
  uniqueIndex = response.uniqueIndex;
}

onMounted(() => {
  loadFilter();
});
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
