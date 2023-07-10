<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    :class="[`depth-${depth+1}`, 'card-container-properties card-queryfilter-builder queryfilter-row shadow-none mt-3']"
    body-class="p-3">
    <div class="d-flex flex-sm-wrap flex-md-nowrap">
      <div class="flex-grow-1 pr-md-3">
        <BFormRow>
          <BCol
            md="5"
            class="rule-property-col mb-2 mb-md-0">
            <FrField
              v-if="properties.length"
              v-model="selectPropOptions.value"
              name="selectPropOptions"
              type="select"
              :disabled="disabled"
              :options="selectPropOptions.options"
              :placeholder="propertyPlaceholder"
              validation="required"
              @input="ruleChange({ field: $event })" />
            <FrField
              v-else
              v-model="customPropValue"
              name="Custom"
              type="string"
              @input="ruleChange({ field: $event })" />
          </BCol>
          <BCol
            class="rule-condition-col mb-2 mb-md-0"
            :md="true">
            <FrField
              v-model="selectConditionOptions.value"
              name="selectConditionOptions"
              type="select"
              :disabled="disabled"
              :options="selectConditionOptions.options"
              :searchable="false"
              @input="ruleChange({ operator: $event })" />
          </BCol>
          <BCol
            class="rule-value-col mb-2 mb-md-0"
            v-if="!conditionIsPresent"
            :md="true">
            <slot
              name="valueField"
              :inputValue="inputValue"
              :selectedCondition="selectConditionOptions.value"
              :selectedProp="selectPropOptions.value"
              :ruleChange="ruleChange">
              <FrField
                v-model="inputValue.value"
                name="inputValue"
                :disabled="disabled"
                :options="inputValue.options"
                :type="inputValue.type"
                @input="ruleChange({ value: $event })" />
            </slot>
          </BCol>
        </BFormRow>
      </div>
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
    selectConditionOptions() {
      let options;

      if (this.isLdap) {
        options = Object.values(this.conditionOptions).map(
          (prop) => ({ text: prop.label, value: prop.value }),
        );
        return {
          options,
          value: options.filter((option) => option.value === this.rule.operator).length > 0
            ? this.rule.operator
            : options.shift().value,
        };
      }

      const propType = getTypeFromValue(this.rule.field, this.properties);
      options = this.conditionOptionsByType(propType);
      const value = options.filter((option) => option.value === this.rule.operator).length > 0
        ? this.rule.operator
        : options.shift().value;
      return {
        options,
        value,
      };
    },
    groupIsHidden() {
      return this.isMaxDepth || this.hideGroup;
    },
    isMaxDepth() {
      return this.depth === this.maxDepth - 1;
    },
    conditionIsPresent() {
      if (!this.conditionOptions.IsPresent) return false;
      return this.rule.operator === this.conditionOptions.IsPresent.value || this.rule.operator === this.conditionOptions.IsNotPresent.value;
    },
    selectPropOptions() {
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
      value: '',
      customPropValue: this.rule.field,
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
    rule: {
      required: true,
      type: Object,
    },
    conditionOptions: {
      type: Object,
      required: true,
    },
  },
  watch: {
    rule(rule, prevRule) {
      if (rule.field !== prevRule.field) {
        const updateValueFromField = this.parseType(rule.field, '');
        this.$set(this.$data, 'inputValue', {
          ...updateValueFromField,
        });
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
      const defaultConditions = Object.values(this.conditionOptions)
        .map((option) => ({ text: option.label, value: option.value }));

      const conditions = Object.values(this.conditionOptions)
        .filter((option) => option.type.includes(type))
        .map((option) => ({ text: option.label, value: option.value }
        ));

      return conditions.length === 0 ? defaultConditions : conditions;
    },
    parseType(fieldValue, value) {
      if (!fieldValue) return { type: 'string', value: '' };

      const type = getTypeFromValue(fieldValue, this.properties);
      switch (type) {
        case 'boolean':
          return {
            type: 'select', value: value.toLowerCase() === 'false' || value === false ? 'False' : 'True', options: ['True', 'False'],
          };
        case 'number':
          return { type: 'integer', value: typeof value === 'number' ? value : '' };
        case 'managedObject':
          return { type: 'managedObject', value, resourcePath: value };
        default:
          return { type, value };
      }
    },
    ruleChange(value) {
      const ruleChangeKeys = Object.keys(value);
      const shouldUpdate = ruleChangeKeys.some((key) => this.rule[key] !== value[key]);
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
