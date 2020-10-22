<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
            class="d-inline-flex"
            :searchable="false"
            :field="defaultOperatorOptions"
            @valueChange="operatorChange" />
        </div>
        <template v-if="isBaseGroup">
          {{ $t('queryFilterBuilder.groupOperatorText2') }}
        </template>
      </div>
      <template v-if="!isBaseGroup">
        <FrRemoveButton
          v-if="hasSiblings"
          class="mr-1"
          :disabled="disabled"
          @click="removeRule" />
        <FrAddButton
          class="mr-1"
          :disabled="disabled"
          :hide-group="isMaxDepth"
          @add-rule="addRuleHandler" />
      </template>
    </div>
    <template v-for="(subfilter, i) in rules.subfilters">
      <FrQueryFilterRow
        v-if="isRow(subfilter)"
        :disabled="disabled"
        :rule="subfilter"
        :resource-name="resourceName"
        :depth="depth"
        :has-siblings="rules.subfilters.length > 1"
        :index="i"
        :key="subfilter.uniqueIndex"
        :max-depth="maxDepth"
        :path="`${path}`"
        :properties="properties"
        @add-rule="addRule"
        @remove-rule="removeRule"
        @rule-change="ruleChange" />
      <QueryFilterGroup
        v-else
        :disabled="disabled"
        :rules="subfilter"
        :resource-name="resourceName"
        :depth="depth + 1"
        :has-siblings="rules.subfilters.length > 1"
        :index="i"
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
import Field from '@forgerock/platform-shared/src/components/Field';
import QueryFilterRow from '../QueryFilterRow';
import AddButton from '../QueryFilterAddButton';
import RemoveButton from '../QueryFilterRemoveButton';
import filterOperators from '../QueryFilterDefaults';

export default {
  name: 'QueryFilterGroup',
  components: {
    BCard,
    FrAddButton: AddButton,
    FrField: Field,
    FrRemoveButton: RemoveButton,
    FrQueryFilterRow: QueryFilterRow,
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
  },
  data() {
    return {
      defaultOperatorOptions: {
        options: Object.values(filterOperators).map(
          (prop) => ({ text: prop.label, value: prop.delimeter }),
        ),
        type: 'select',
        value: this.rules.operator,
        disabled: this.disabled,
      },
      filterOperators,
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
