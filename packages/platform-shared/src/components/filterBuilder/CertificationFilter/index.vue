<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    :body-class="bodyClass"
    :class="cardClass">
    <FrFilterBuilderGroup
      path="0"
      class="pb-3"
      boolean-value-type="boolean"
      :disabled="disabled"
      :rules="queryFilter"
      :resource-name="resourceName"
      :depth="0"
      :max-depth="3"
      :hide-group="hideGroup"
      :index="0"
      :operator-options="operatorOptions"
      :condition-options="defaultConditionOptions"
      :properties="properties"
      @add-rule="updateFilter('add-rule', $event)"
      @remove-rule="updateFilter('remove-rule', $event)"
      @operator-change="updateFilter('operator-change', $event)"
      @rule-change="updateFilter('rule-change', $event)">
      <template #prefix>
        <slot name="prefix" />
      </template>
      <template #suffix>
        <slot name="suffix" />
      </template>
      <template #valueField="{ inputValue, selectedCondition, ruleChange, selectedProp, uniqueName }">
        <template v-if="selectedCondition !== 'EXISTS'">
          <FrGovResourceSelect
            v-if="inputValue.type === 'managedObject'"
            v-model="inputValue.value"
            @input="ruleChange({ value: getValuePath(getType(selectedProp), $event.split('/').pop()) })"
            :option-function="optionFunction"
            :query-param-function="queryParamFunction"
            :resource-function="getResourceFunction(getType(selectedProp))"
            :resource-path="getResourcePath(getType(selectedProp))" />
          <FrEntitlementSelect
            v-else-if="selectedProp === 'entitlement.displayName' && selectedCondition === 'EQUALS'"
            :model-value="inputValue.value"
            @update:modelValue="ruleChange({ value: $event })" />
          <FrField
            v-else
            v-model="inputValue.value"
            :name="uniqueName"
            :disabled="disabled"
            :options="inputValue.options"
            :type="inputValue.type"
            @input="ruleChange({ value: $event })" />
        </template>
      </template>
    </FrFilterBuilderGroup>
  </BCard>
</template>

<script>
import { BCard } from 'bootstrap-vue';
import { cloneDeep, find } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrFilterBuilderGroup from '@forgerock/platform-shared/src/components/filterBuilder/components/FilterBuilderGroup';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrEntitlementSelect from '@forgerock/platform-shared/src/components/governance/EntitlementSelect';
import { findGroup } from '@forgerock/platform-shared/src/components/filterBuilder/utils/filterBuilderUtils';
import {
  getResourceFunction,
  getResourcePath,
  getResourceType,
  getValuePath,
  optionFunction,
  queryParamFunction,
} from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';
import { operatorOptions, defaultConditionOptions } from './CertFilterDefaults';

const defaultFilterOperator = operatorOptions.Any.delimeter;

export default {
  name: 'CertificationFilter',
  components: {
    BCard,
    FrField,
    FrFilterBuilderGroup,
    FrGovResourceSelect,
    FrEntitlementSelect,
  },
  data() {
    return {
      queryFilter: {},
      uniqueIndex: 0,
      operatorOptions,
      defaultConditionOptions,
    };
  },
  props: {
    bodyClass: {
      type: String,
      default: 'p-3 p-sm-4',
    },
    cardClass: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hideGroup: {
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
    filter: {
      type: Object,
      default: () => {},
    },
  },
  mounted() {
    this.queryFilter = this.getGroup();
  },
  methods: {
    getResourceFunction,
    getResourcePath,
    getValuePath,
    optionFunction,
    queryParamFunction,
    /**
     * Returns resource path from property value passed in
     * @param {String} prop property value to search for
     */
    getType(prop) {
      return getResourceType(find(this.properties, ((x) => x.value === prop)).path);
    },
    massageValue(value) {
      return value;
    },
    /**
     * Generates default group based on values passed in
     *
     * @property {Array} data - the rules that belong in this group
     * @property {String} operator - 'and' or 'or' operator
     *
     * @returns {Object} Newly generated group with given rules or default rule
     */
    getDefaultGroup(
      data = [this.getDefaultRule()],
      operator = defaultFilterOperator,
    ) {
      return {
        subfilters: data,
        operator,
        uniqueIndex: this.getUniqueIndex(),
      };
    },
    /**
     * Generates default rule based on values passed in
     *
     * @property {String} operator - Operator to compare the field's value to
     * @property {String} field - Field name of new rule
     * @property {String} value - Field value of new rule
     *
     * @returns {Object} Newly generated rule with given values or default values
     */
    getDefaultRule(operator = 'EQUALS', field = '', value = '') {
      return {
        operator,
        field,
        value,
        uniqueIndex: this.getUniqueIndex(),
      };
    },
    /**
     * Ensures our keys in v-if iteration have unique values
     *
     * @returns {number} New unique index
     */
    getUniqueIndex() {
      this.uniqueIndex += 1;
      return this.uniqueIndex;
    },
    /**
     * Builds updated filter with newly changed rules
     *
     * @property {string} eventName - name of emitted event to determine exactly what to update
     * @property {Object} data - updated values
     */
    updateFilter(eventName, data) {
      const {
        depth, index, path, value, type,
      } = data;

      const tempFilter = cloneDeep(this.queryFilter);
      const paths = path.split(':');
      const group = findGroup(tempFilter, paths, 0, depth);

      switch (eventName) {
        case 'add-rule':
          if (type === 'row') {
            group.subfilters.splice(index + 1, 0, this.getDefaultRule());
          } else {
            group.subfilters.splice(index + 1, 0, this.getDefaultGroup());
          }
          this.$emit('error');
          break;
        case 'operator-change':
          group.operator = value;
          break;
        case 'rule-change':
          group.subfilters[index] = { ...group.subfilters[index], ...value };
          if (value.field) {
            const propertyType = find(this.properties, { value: value.field })?.type;
            switch (propertyType) {
              case 'boolean':
                group.subfilters[index].value = true;
                break;
              default:
                group.subfilters[index].value = '';
            }
          }
          break;
        case 'remove-rule':
          group.subfilters.splice(index, 1);
          break;
        default:
          break;
      }
      this.$set(this.$data, 'queryFilter', tempFilter);
    },
    /**
     * Generates the group of rules based on the filter passed as parameter of the component, if the filter is empty,
     * the default group is returned, otherwise, the rules are generated.
     *
     * @returns {object} group of rules
     */
    getGroup() {
      if (!this.filter.operator) {
        return this.getDefaultGroup();
      }
      return this.getRule(this.filter);
    },
    /**
     * Generates the rule based on a filter, this is a recursive method that allows to generate rules with subfilters
     *
     * @returns {object} generated rule with subfilters if applies
     */
    getRule(rule) {
      // Reconstruct NOT operators back into single level for this filter
      if (rule.operator === 'NOT') {
        rule.operator = `NOT ${rule.operand[0].operator}`;
        rule.operand = rule.operand[0].operand;
      }
      const formatedRule = {
        operator: rule.operator,
        uniqueIndex: this.getUniqueIndex(),
      };
      if (!rule.operand.length) {
        formatedRule.field = rule.operand.targetName;
        formatedRule.value = rule.operand.targetValue;
      } else {
        formatedRule.subfilters = rule.operand.map((subfilter) => this.getRule(subfilter));
      }
      return formatedRule;
    },
  },
  watch: {
    queryFilter(queryFilter) {
      this.$emit('filter-update', queryFilter);
    },
  },
};
</script>

<style lang="scss">
.card-queryfilter-builder {
  &.depth-1 {
    border-left: 2px solid $blue !important;
  }

  &.depth-2 {
    border-left: 2px solid $green;
  }

  &.depth-3 {
    border-left: 2px solid $yellow;
  }
}
</style>
