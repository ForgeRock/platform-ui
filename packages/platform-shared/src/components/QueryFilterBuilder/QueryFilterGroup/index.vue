<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BCard
    :class="groupCardClass"
    no-body>
    <BCardBody :class="groupCardBodyClass">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-sm-flex align-items-center flex-wrap">
          <div
            class="pr-2"
            v-if="!notInitialGroup()">
            {{ $t('queryFilterBuilder.groupOperatorText1', { resource }) }}
          </div>
          <div class="pr-sm-2 py-1 py-sm-0">
            <FrField
              class="d-inline-flex"
              :field="defaultOperatorOptions"
              @valueChange="operatorChange"
            />
          </div>
          <div v-if="!notInitialGroup()">
            {{ $t('queryFilterBuilder.groupOperatorText2') }}
          </div>
        </div>
        <div
          v-if="notInitialGroup()">
          <FrRemoveButton
            class="mr-1"
            @click="removeGroup" />
          <FrAddButton
            :hide-group="isMaxDepth(depth)"
            class="mr-1"
            @add-rule="addRuleHandler"
            @add-group="addGroupHandler"
          />
        </div>
      </div>
      <template v-for="(row, i) in rules.subfilters">
        <FrQueryFilterRow
          v-if="isRow(row)"
          :rules="cloneDeep(row)"
          :resource="resource"
          :depth="depth"
          :group-index="index"
          :has-siblings="rules.subfilters.length > 1"
          :index="i"
          :key="`row${depth}:${i}`"
          :max-depth="maxDepth"
          :path="`${path}`"
          :properties="properties"
          @add-rule="emitRule"
          @add-group="emitGroup"
          @remove-rule="removeRule"
          @rule-change="ruleChange"
        />
        <QueryFilterGroup
          v-else
          :rules="row"
          :resource="resource"
          :depth="depth + 1"
          :group-path="path"
          :index="parseInt(i)"
          :key="`group${i}`"
          :max-depth="maxDepth"
          :path="`${path}:${i}`"
          :properties="properties"
          @add-rule="emitRule"
          @add-group="emitGroup"
          @operator-change="operatorChange"
          @remove-group="removeGroup"
          @remove-rule="removeRule"
          @rule-change="ruleChange"
        />
      </template>
    </BCardBody>
  </BCard>
</Template>

<script>
import { BCard, BCardBody } from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import Field from '@forgerock/platform-shared/src/components/Field';
import QueryFilterRow from '../QueryFilterRow';
import AddButton from '../QueryFilterAddButton';
import RemoveButton from '../QueryFilterRemoveButton';
import filterOperators from '../QueryFilterDefaults';

export default {
  name: 'QueryFilterGroup',
  components: {
    BCard,
    BCardBody,
    FrAddButton: AddButton,
    FrField: Field,
    FrRemoveButton: RemoveButton,
    FrQueryFilterRow: QueryFilterRow,
  },
  computed: {
    groupCardClass() {
      return this.depth === 0
        ? ['shadow-none', 'border-0']
        : ['shadow-none', 'card-queryfilter-builder', 'my-3', `depth-${this.depth}`];
    },
    groupCardBodyClass() {
      return this.depth === 0
        ? ['p-0']
        : [];
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
      },
      filterOperators,
    };
  },
  props: {
    rules: {
      required: true,
      type: Object,
    },
    resource: {
      required: true,
      type: String,
    },
    depth: {
      required: true,
      type: Number,
    },
    groupPath: {
      required: true,
      type: String,
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
      required: true,
      type: Array,
    },
  },
  methods: {
    addRuleHandler() {
      this.emitRule({ depth: this.depth - 1, index: this.index, path: this.groupPath });
    },
    addGroupHandler() {
      this.emitGroup({ depth: this.depth - 1, index: this.index, path: this.groupPath });
    },
    emitGroup(args) {
      this.$emit('add-group', args);
    },
    emitRule(args) {
      this.$emit('add-rule', args);
    },
    cloneDeep,
    isMaxDepth(depth) {
      return depth === this.maxDepth - 1;
    },
    isRow(row) {
      return !Object.keys(row).includes('subfilters');
    },
    removeRule(args) {
      this.$emit('remove-rule', args);
    },
    removeGroup(args) {
      if (!args) {
        this.$emit('remove-group', {
          depth: this.depth - 1,
          groupIndex: this.index - 1,
          index: this.index,
          path: this.path,
        });
      } else {
        this.$emit('remove-group', args);
      }
    },
    ruleChange(args) {
      this.$emit('rule-change', args);
    },
    operatorChange(args) {
      if (!args.depth) {
        this.$emit('operator-change', {
          depth: this.depth,
          groupIndex: this.index,
          path: this.path,
          value: args,
        });
      } else {
        this.$emit('operator-change', args);
      }
    },
    notInitialGroup() {
      return this.depth > 0;
    },
  },
};
</script>
