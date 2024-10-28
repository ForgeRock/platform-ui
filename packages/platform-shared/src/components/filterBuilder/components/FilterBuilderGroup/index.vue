<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    :class="groupCardClass"
    :body-class="groupCardBodyClass">
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-sm-flex align-items-center flex-grow-1">
        <div
          v-if="isBaseGroup"
          class="pr-2">
          <slot name="prefix">
            {{ prefixGroupOperatorText }}
          </slot>
        </div>
        <div class="pr-sm-2 py-1 py-sm-0">
          <FrField
            v-model="defaultOperatorOptions.value"
            class="d-inline-flex"
            :name="defaultOperatorOptionsName"
            type="select"
            :disabled="disabled"
            :options="defaultOperatorOptions.options"
            :searchable="false"
            @input="operatorChange" />
        </div>
        <template v-if="isBaseGroup">
          <slot name="suffix">
            {{ $t('queryFilterBuilder.groupOperatorText2') }}
          </slot>
        </template>
      </div>
      <template v-if="!isBaseGroup">
        <FrFilterBuilderRemoveButton
          v-if="hasSiblings"
          class="mr-1"
          :disabled="disabled"
          @click="removeRule" />
        <FrFilterBuilderAddButton
          v-if="!rules.disableAdd"
          class="mr-1"
          :disabled="disabled"
          :hide-group="isMaxDepth"
          @add-rule="addRuleHandler" />
      </template>
    </div>
    <template
      v-for="(subfilter, i) in rules.subfilters"
      :key="subfilter.uniqueIndex">
      <FrFilterBuilderRow
        v-if="isRow(subfilter)"
        :operator-options="conditionOptions"
        :disabled="disabled"
        :rule="subfilter"
        :resource-name="resourceName"
        :depth="depth"
        :has-siblings="rules.subfilters.length > 1"
        :hide-group="hideGroup"
        :index="i"
        :is-ldap="isLdap"
        :max-depth="maxDepth"
        :path="path"
        :properties="properties"
        :property-select-label="propertySelectLabel"
        :boolean-value-type="booleanValueType"
        @add-rule="addRule"
        @remove-rule="removeRule"
        @rule-change="ruleChange">
        <template
          v-for="(key, slotName) in $slots"
          #[slotName]="slotData">
          <!-- @slot passthrough slot -->
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
      </FrFilterBuilderRow>
      <FilterBuilderGroup
        v-else
        :condition-options="conditionOptions"
        :disabled="disabled"
        :rules="subfilter"
        :resource-name="resourceName"
        :depth="depth + 1"
        :has-siblings="rules.subfilters.length > 1"
        :index="i"
        :is-ldap="isLdap"
        :max-depth="maxDepth"
        :operator-options="operatorOptions"
        :path="`${path}:${i}`"
        :properties="properties"
        :property-select-label="propertySelectLabel"
        @add-rule="addRule"
        @operator-change="operatorChange"
        @remove-rule="removeRule"
        @rule-change="ruleChange">
        <template
          v-for="(key, slotName) in $slots"
          #[slotName]="slotData">
          <!-- @slot passthrough slot -->
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
      </FilterBuilderGroup>
    </template>
  </BCard>
</template>

<script>
import { BCard } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrFilterBuilderRow from '../FilterBuilderRow';
import FrFilterBuilderAddButton from '../FilterBuilderAddButton';
import FrFilterBuilderRemoveButton from '../FilterBuilderRemoveButton';

export default {
  name: 'FilterBuilderGroup',
  components: {
    BCard,
    FrField,
    FrFilterBuilderAddButton,
    FrFilterBuilderRemoveButton,
    FrFilterBuilderRow,
  },
  data() {
    return {
      defaultOperatorOptionsName: `${this.resourceName}_defaultOperatorOptions_${this.rules.subfilters?.[0].uniqueIndex || this.index}`,
    };
  },
  computed: {
    groupCardClass() {
      return this.depth === 0
        ? ['shadow-none', 'border-0']
        : ['shadow-none', 'card-queryfilter-builder', 'mt-3', `depth-${this.depth}`];
    },
    groupCardBodyClass() {
      return this.depth === 0
        ? 'p-0'
        : 'p-3';
    },
    isMaxDepth() {
      return this.depth === this.maxDepth;
    },
    isBaseGroup() {
      return this.depth === 0;
    },
    defaultOperatorOptions() {
      return {
        options: Object.values(this.operatorOptions).map(
          (prop) => ({ text: prop.label, value: prop.delimeter }),
        ),
        value: this.rules.operator,
      };
    },
    prefixGroupOperatorText() {
      return this.prefixGroupText || this.$t('queryFilterBuilder.groupOperatorText1', { resourceName: this.resourceName });
    },
  },
  props: {
    conditionOptions: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hasSiblings: {
      default: false,
      type: Boolean,
    },
    hideGroup: {
      default: false,
      type: Boolean,
    },
    rules: {
      required: true,
      type: Object,
    },
    resourceName: {
      type: String,
      default: '',
    },
    depth: {
      required: true,
      type: Number,
    },
    /**
     * Array index for adding/removing from group array
     */
    index: {
      required: true,
      type: Number,
    },
    isLdap: {
      type: Boolean,
      default: false,
    },
    maxDepth: {
      required: true,
      type: Number,
    },
    operatorOptions: {
      type: Object,
      default: () => {},
    },
    path: {
      required: true,
      type: String,
    },
    prefixGroupText: {
      default: '',
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
    booleanValueType: {
      default: 'string',
      type: String,
    },
  },
  methods: {
    addRuleHandler(type) {
      this.addRule({
        depth: this.depth - 1,
        index: this.index,
        path: this.path,
        type,
      });
    },
    addRule(args) {
      this.$emit('add-rule', args);
    },
    isRow(row) {
      return !Object.prototype.hasOwnProperty.call(row, 'subfilters');
    },
    removeRule(args) {
      if (!args) {
        this.$emit('remove-rule', {
          depth: this.depth - 1,
          index: this.index,
          path: this.path,
        });
      } else {
        this.$emit('remove-rule', args);
      }
    },
    ruleChange(args) {
      this.$emit('rule-change', args);
    },
    operatorChange(args) {
      if (!args.depth) {
        this.$emit('operator-change', {
          depth: this.depth,
          path: this.path,
          value: args,
        });
      } else {
        this.$emit('operator-change', args);
      }
    },
  },
};
</script>
