<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

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
              name="field"
              :placeholder="propertyPlaceholder"
              :field="selectPropOptions"
              @valueChange="ruleChange({ field: $event })" />
          </BCol>
          <BCol
            class="rule-condition-col mb-2 mb-md-0"
            :md="true">
            <FrField
              :searchable="false"
              :field="selectConditionOptions"
              @valueChange="ruleChange({ operator: $event })" />
          </BCol>
          <BCol
            class="rule-value-col mb-2 mb-md-0"
            v-if="!conditionIsPresent"
            :md="true">
            <FrField
              :field="inputValue"
              @valueChange="ruleChange({ value: $event })" />
          </BCol>
        </BFormRow>
      </div>
      <FrRemoveButton
        v-if="hasSiblings"
        class="mr-1"
        :disabled="disabled"
        @click="removeRule" />
      <FrAddButton
        class="add-button"
        :disabled="disabled"
        :hide-group="isMaxDepth"
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
import AddButton from '../QueryFilterAddButton';
import RemoveButton from '../QueryFilterRemoveButton';
import { defaultConditionOptions, getTypeFromValue } from '../QueryFilterDefaults';

export default {
  name: 'QueryFilterRow',
  components: {
    BCard,
    BCol,
    BFormRow,
    FrAddButton: AddButton,
    FrField,
    FrRemoveButton: RemoveButton,
  },
  computed: {
    selectConditionOptions() {
      const propType = getTypeFromValue(this.rule.field, this.properties);
      const options = this.conditionOptionsByType(propType);
      const value = options.filter((option) => option.value === this.rule.operator).length > 0
        ? this.rule.operator
        : options.shift().value;
      return {
        options,
        type: 'select',
        value,
        disabled: this.disabled,
      };
    },
    isMaxDepth() {
      return this.depth === this.maxDepth - 1;
    },
    conditionIsPresent() {
      return this.rule.operator === defaultConditionOptions.IsPresent.value || this.rule.operator === defaultConditionOptions.IsNotPresent.value;
    },
    selectPropOptions() {
      return {
        options: this.properties.map((prop) => (
          { text: prop.label, value: prop.value })),
        type: 'select',
        value: this.rule.field,
        disabled: this.disabled,
      };
    },
  },
  data() {
    return {
      propertyPlaceholder: this.$t('queryFilterBuilder.properties', { propertyName: capitalize(this.resourceName) }),
      defaultConditionOptions,
      inputValue: this.parseType(this.rule.field, this.rule.value),
      value: '',
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
    index: {
      required: true,
      type: Number,
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
  },
  watch: {
    rule(rule, prevRule) {
      if (rule.field !== prevRule.field) {
        const updateValueFromField = this.parseType(rule.field, prevRule.value);
        this.$set(this.$data, 'inputValue', {
          ...updateValueFromField,
        });
      }
    },
  },
  methods: {
    addRule(type) {
      this.$emit('add-rule', {
        depth: this.depth, index: this.index, path: this.path, type,
      });
    },
    conditionOptionsByType(type) {
      const defaultConditions = Object.values(defaultConditionOptions)
        .map((option) => ({ text: option.label, value: option.value }));

      const conditions = Object.values(defaultConditionOptions)
        .filter((option) => option.type.includes(type))
        .map((option) => ({ text: option.label, value: option.value }
        ));

      return conditions.length === 0 ? defaultConditions : conditions;
    },
    parseType(fieldValue, value) {
      if (!fieldValue) return { type: 'string', value: '', disabled: this.disabled };

      const type = getTypeFromValue(fieldValue, this.properties);
      switch (type) {
        case 'boolean':
          return {
            type: 'select', value: value.toLowerCase() === 'false' || value === false ? 'False' : 'True', options: ['True', 'False'], disabled: this.disabled,
          };
        case 'number':
          return { type: 'integer', value: typeof value === 'number' ? value : '', disabled: this.disabled };
        default:
          return { type, value, disabled: this.disabled };
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
