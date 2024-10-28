<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    :class="[`depth-${depth+1}`, 'card-container-properties card-queryfilter-builder queryfilter-row shadow-none mt-3']"
    body-class="p-3">
    <div class="position-relative filter-builder-row">
      <div class="pr-lg-3">
        <BFormRow>
          <slot
            name="property-field"
            :rule-property="ruleProperty"
            :property-placeholder="propertyPlaceholder"
            :rule="rule"
            :rule-change="ruleChange"
            :unique-name="`selectPropOptions_${uniqueName}`">
            <BCol
              class="rule-property-col mb-2"
              :class="{ 'mb-lg-0': !fieldWidth }"
              :md="fieldWidth || 5">
              <FrField
                v-if="properties.length"
                :value="ruleProperty.value"
                type="select"
                :disabled="disabled"
                :label="propertySelectLabel"
                :name="`selectPropOptions_${uniqueName}`"
                :options="ruleProperty.options"
                :placeholder="propertyPlaceholder"
                @input="ruleProperty.value = $event; ruleChange({ field: $event })" />
              <FrField
                v-else
                :value="customPropValue"
                :name="`Custom_${uniqueName}`"
                @input="customPropValue = $event; ruleChange({ field: $event })" />
            </BCol>
          </slot>
          <slot
            name="operatorField"
            :operator-value="ruleOperator"
            :rule="rule"
            :rule-change="ruleChange"
            :selected-prop="ruleProperty.value"
            :unique-name="`ruleCondition_${uniqueName}`">
            <BCol
              class="rule-condition-col mb-2"
              :class="{ 'mb-lg-0': !fieldWidth }"
              :md="fieldWidth || true">
              <FrField
                :value="ruleOperator"
                type="select"
                :disabled="disabled"
                :name="`ruleCondition_${uniqueName}`"
                :options="operatorSelectOptions"
                :searchable="false"
                @input="ruleOperator = $event; ruleChange({ operator: $event })" />
            </BCol>
          </slot>
          <BCol
            v-if="!conditionIsPresent"
            class="rule-value-col mb-2 mb-lg-0"
            :md="fieldWidth || true">
            <slot
              name="valueField"
              :input-value="inputValue"
              :rule="rule"
              :rule-change="ruleChange"
              :selected-condition="ruleOperator"
              :selected-prop="ruleProperty.value"
              :unique-name="`inputValue_${uniqueName}`">
              <FrField
                :value="inputValue.value"
                :disabled="disabled"
                :name="`inputValue_${uniqueName}`"
                :options="inputValue.options"
                :type="inputValue.type"
                @input="inputValue.value = $event; ruleChange({ value: $event })" />
            </slot>
          </BCol>
        </BFormRow>
      </div>
      <div class="position-absolute filter-builder-row-buttons">
        <FrFilterBuilderRemoveButton
          v-if="hasSiblings"
          class="mr-1"
          :disabled="disabled"
          @click="removeRule" />
        <FrFilterBuilderAddButton
          class="add-button"
          :disabled="disabled"
          :hide-group="groupIsHidden"
          @add-rule="addRule" />
      </div>
    </div>
  </BCard>
</template>

<script>
import {
  BCard, BCol, BFormRow,
} from 'bootstrap-vue';
import { capitalize } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrFilterBuilderAddButton from '../FilterBuilderAddButton';
import FrFilterBuilderRemoveButton from '../FilterBuilderRemoveButton';
import { getTypeFromValue } from '../../utils/QueryFilterDefaults';

export default {
  name: 'FilterBuilderRow',
  components: {
    BCard,
    BCol,
    BFormRow,
    FrField,
    FrFilterBuilderAddButton,
    FrFilterBuilderRemoveButton,
  },
  computed: {
    operatorSelectOptions() {
      if (this.isLdap) {
        return Object.values(this.operatorOptions).map(
          (prop) => ({ text: prop.label, value: prop.value }),
        );
      }
      const propType = getTypeFromValue(this.ruleProperty.value, this.properties);
      return this.conditionOptionsByType(propType);
    },
    groupIsHidden() {
      return this.isMaxDepth || this.hideGroup;
    },
    isMaxDepth() {
      return this.depth === this.maxDepth - 1;
    },
    conditionIsPresent() {
      if (!this.operatorOptions.IsPresent) return false;
      return this.rule.operator === this.operatorOptions.IsPresent.value || this.rule.operator === this.operatorOptions.IsNotPresent.value;
    },
    ruleProperty() {
      return {
        options: this.properties.map((prop) => (
          { text: prop.label, value: prop.value })),
        value: this.rule.field,
      };
    },
  },
  data() {
    return {
      propertyPlaceholder: this.$t('queryFilterBuilder.properties', { propertyName: capitalize(this.resourceName) }),
      inputValue: this.parseType(this.rule.field, this.rule.value),
      ruleOperator: Object.values(this.operatorOptions).findIndex((option) => option.value === this.rule.operator) > -1
        ? this.rule.operator
        : this.operatorOptions[0]?.value,
      value: '',
      customPropValue: this.rule.field,
      uniqueName: `${this.resourceName}_${this.rule.uniqueIndex}`,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    resourceName: {
      required: true,
      type: String,
    },
    depth: {
      required: true,
      type: Number,
    },
    hideGroup: {
      default: false,
      type: Boolean,
    },
    index: {
      required: true,
      type: Number,
    },
    isLdap: {
      type: Boolean,
      default: false,
    },
    hasSiblings: {
      required: true,
      type: Boolean,
    },
    maxDepth: {
      required: true,
      type: Number,
    },
    path: {
      required: true,
      type: String,
    },
    properties: {
      default: () => [],
      type: Array,
    },
    propertySelectLabel: {
      default: '',
      type: String,
    },
    rule: {
      required: true,
      type: Object,
    },
    operatorOptions: {
      type: Object,
      required: true,
    },
    booleanValueType: {
      type: String,
      default: 'string',
    },
  },
  inject: {
    fieldWidth: {
      default: null,
      type: Number,
    },
  },
  watch: {
    operatorSelectOptions(options) {
      if (options.findIndex((option) => option.value === this.rule.operator) === -1) {
        this.ruleOperator = options[0].value;
        this.ruleChange({ operator: this.ruleOperator });
      }
    },
    rule(rule, prevRule) {
      if (rule.field !== prevRule.field) {
        const updateValueFromField = this.parseType(rule.field, '');
        this.inputValue = { ...updateValueFromField };
      }
    },
    properties() {
      this.inputValue = this.parseType(this.rule.field, this.rule.value);
    },
  },
  methods: {
    addRule(type) {
      this.$emit('add-rule', {
        depth: this.depth, index: this.index, path: this.path, type,
      });
    },
    conditionOptionsByType(type) {
      const defaultConditions = Object.values(this.operatorOptions)
        .map((option) => ({ text: option.label, value: option.value }));

      const conditions = Object.values(this.operatorOptions)
        .filter((option) => option.type.includes(type))
        .map((option) => ({ text: option.label, value: option.value }));

      return conditions.length === 0 ? defaultConditions : conditions;
    },
    parseType(fieldValue, value) {
      if (!fieldValue) return { type: 'string', value: '' };
      const type = getTypeFromValue(fieldValue, this.properties);

      switch (type) {
        case 'boolean':
          return this.booleanValueType === 'boolean' ? {
            type: 'select',
            value: typeof value === 'string' ? value.toLowerCase() !== 'false' : Boolean(value),
            options: [{
              value: true,
              text: this.$t('common.true'),
            },
            {
              value: false,
              text: this.$t('common.false'),
            }],
          } : {
            type: 'select',
            value: value.toLowerCase() === 'false' || value === false ? 'False' : 'True',
            options: ['True', 'False'],
          };
        case 'number':
        case 'int':
          return { type: 'integer', value: typeof value === 'number' ? value : '' };
        case 'managedObject':
          return { type: 'managedObject', value, resourcePath: value };
        default:
          return { type, value };
      }
    },
    ruleChange(value) {
      const ruleChangeKey = Object.keys(value)[0];
      const shouldUpdate = this.rule[ruleChangeKey] !== value[ruleChangeKey];
      if (shouldUpdate) {
        this.$emit('rule-change', {
          depth: this.depth, index: this.index, path: this.path, value,
        });
      }
    },
    removeRule() {
      this.$emit('remove-rule', {
        depth: this.depth, index: this.index, path: this.path,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.filter-builder-row {
  padding-right: 142px;

  .filter-builder-row-buttons {
    right: 0px;
    top: 0px;
  }
}
</style>
