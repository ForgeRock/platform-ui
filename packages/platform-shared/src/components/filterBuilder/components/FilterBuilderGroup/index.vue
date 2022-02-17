<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

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
          {{ $t('queryFilterBuilder.groupOperatorText1', { resourceName }) }}
        </div>
        <div class="pr-sm-2 py-1 py-sm-0">
          <FrField
            v-model="defaultOperatorOptions.value"
            class="d-inline-flex"
            name="defaultOperatorOptions"
            type="select"
            :disabled="disabled"
            :options="defaultOperatorOptions.options"
            :searchable="false"
            @input="operatorChange" />
        </div>
        <template v-if="isBaseGroup">
          {{ $t('queryFilterBuilder.groupOperatorText2') }}
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
    <template v-for="(subfilter, i) in rules.subfilters">
      <FrFilterBuilderRow
        v-if="isRow(subfilter)"
        :disabled="disabled"
        :rule="subfilter"
        :resource-name="resourceName"
        :depth="depth"
        :has-siblings="rules.subfilters.length > 1"
        :index="i"
        :is-ldap="isLdap"
        :key="subfilter.uniqueIndex"
        :max-depth="maxDepth"
        :path="`${path}`"
        :properties="properties"
        @add-rule="addRule"
        @remove-rule="removeRule"
        @rule-change="ruleChange" />
      <FilterBuilderGroup
        v-else
        :disabled="disabled"
        :rules="subfilter"
        :resource-name="resourceName"
        :depth="depth + 1"
        :has-siblings="rules.subfilters.length > 1"
        :index="i"
        :is-ldap="isLdap"
        :key="subfilter.uniqueIndex"
        :max-depth="maxDepth"
        :path="`${path}:${i}`"
        :properties="properties"
        @add-rule="addRule"
        @operator-change="operatorChange"
        @remove-rule="removeRule"
        @rule-change="ruleChange" />
    </template>
  </BCard>
</template>

<script>
import { BCard } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrFilterBuilderRow from '../FilterBuilderRow';
import FrFilterBuilderAddButton from '../FilterBuilderAddButton';
import FrFilterBuilderRemoveButton from '../FilterBuilderRemoveButton';
import { operatorOptions } from '../../utils/QueryFilterDefaults';
import { ldapOperatorOptions } from '../../utils/LdapFilterDefaults';

export default {
  name: 'FilterBuilderGroup',
  components: {
    BCard,
    FrField,
    FrFilterBuilderAddButton,
    FrFilterBuilderRemoveButton,
    FrFilterBuilderRow,
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
      const operators = this.isLdap ? ldapOperatorOptions : operatorOptions;
      return {
        options: Object.values(operators).map(
          (prop) => ({ text: prop.label, value: prop.delimeter }),
        ),
        value: this.rules.operator,
      };
    },
  },
  data() {
    return {
      ldapOperatorOptions,
      operatorOptions,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    hasSiblings: {
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
    path: {
      required: true,
      type: String,
    },
    properties: {
      default: () => [],
      type: Array,
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
