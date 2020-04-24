<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BCard
    no-body
    class="card-container-properties card-queryfilter-builder shadow-none my-3"
    :class="`depth-${depth+1}`">
    <BCardBody class="p-3">
      <BForm>
        <BRow
          no-gutters
          class="d-flex flex-sm-wrap flex-md-nowrap">
          <div class="flex-grow-1 pr-md-3">
            <BFormRow>
              <BCol
                md="5"
                class="mb-2 mb-md-0">
                <FrField
                  name="field"
                  :placeholder="propertyPlaceholder"
                  :searchable="true"
                  :field="selectPropOptions()"
                  @valueChange="propertyChange"
                />
              </BCol>
              <BCol
                class="mb-2 mb-md-0"
                :md="true">
                <FrField
                  :searchable="false"
                  :field="selectConditionOptions"
                  @valueChange="conditionChange"
                />
              </BCol>
              <BCol
                class="mb-2 mb-md-0"
                v-if="!conditionIsPresent()"
                :md="true">
                <FrField
                  :field="inputValue"
                  @valueChange="valueChange"
                />
              </BCol>
            </BFormRow>
          </div>
          <div class="d-flex flex-nowrap">
            <FrRemoveButton
              v-if="hasSiblings"
              class="mr-1"
              @click="removeRule" />
            <FrAddButton
              :hide-group="isMaxDepth(depth)"
              @add-rule="emitRule"
              @add-group="emitGroup"
            />
          </div>
        </BRow>
      </BForm>
    </BCardBody>
  </BCard>
</template>

<script>
import {
  BCard, BCardBody, BCol, BForm, BFormRow, BRow,
} from 'bootstrap-vue';
import { capitalize } from 'lodash';
import Field from '@forgerock/platform-shared/src/components/Field';
import AddButton from '../QueryFilterAddButton';
import RemoveButton from '../QueryFilterRemoveButton';
import { defaultConditionOptions, getTypeFromValue } from '../QueryFilterDefaults';


export default {
  name: 'QueryFilterRow',
  components: {
    FrAddButton: AddButton,
    BCard,
    BCardBody,
    BCol,
    BForm,
    BFormRow,
    BRow,
    FrField: Field,
    FrRemoveButton: RemoveButton,
  },
  computed: {
    propertyPlaceholder() {
      const name = this.resource;
      return `${capitalize(name)} ${this.$t('queryFilterBuilder.properties')}`;
    },
    selectConditionOptions() {
      const propType = getTypeFromValue(this.rules.field, this.properties);
      const options = this.conditionOptionsByType(propType);
      const value = options.filter((option) => option.value === this.rules.operator).length > 0
        ? this.rules.operator
        : options.shift().value;
      return {
        options,
        type: 'select',
        value,
      };
    },
  },
  data() {
    return {
      defaultConditionOptions,
      inputValue: this.parseType(this.rules.field, this.rules.value),
      selectPropOptions() {
        return {
          options: this.properties.map((prop) => (
            { text: prop.label, value: prop.value })),
          type: 'select',
          value: this.rules.field,
        };
      },
    };
  },
  props: {
    resource: {
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
    groupIndex: {
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
      required: true,
      type: Array,
    },
    rules: {
      required: true,
      type: Object,
    },
    showValue: {
      default: true,
      required: false,
      type: Boolean,
    },
  },
  watch: {
    rules(rule, prevRule) {
      if (rule.field === prevRule.field) return;

      const updateValueFromField = this.parseType(rule.field, rule.value);
      this.$set(this.$data, 'inputValue', {
        ...updateValueFromField,
      });

      if (!prevRule.field.length || rule.field === prevRule.field) return;

      const updateValueFromProp = this.parseType(rule.field, '');
      this.$set(this.$data, 'inputValue', {
        ...updateValueFromProp,
      });
    },
  },
  methods: {
    emitGroup() {
      this.$emit('add-group', {
        depth: this.depth, groupIndex: this.groupIndex, index: this.index, path: this.path,
      });
    },
    emitRule() {
      this.$emit('add-rule', {
        depth: this.depth, groupIndex: this.groupIndex, index: this.index, path: this.path,
      });
    },
    conditionIsPresent() {
      return this.rules.operator === defaultConditionOptions.IsPresent.value || this.rules.operator === defaultConditionOptions.IsNotPresent.value;
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
    isMaxDepth(depth) {
      return depth === this.maxDepth - 1;
    },
    parseType(fieldValue, inputValue) {
      if (!fieldValue) return { type: 'string', value: '' };

      const type = getTypeFromValue(fieldValue, this.properties);
      switch (type) {
      case 'boolean':
        return {
          value: inputValue, type: 'select', options: ['True', 'False'],
        };
      case 'number':
        return { type: 'integer', value: typeof inputValue === 'number' ? inputValue : '' };
      default:
        return { type, value: inputValue };
      }
    },
    propertyChange(value) {
      if (!value) return;
      this.$emit('rule-change', {
        depth: this.depth, groupIndex: this.groupIndex, index: this.index, path: this.path, value: { field: value },
      });
    },
    removeRule() {
      this.$emit('remove-rule', {
        depth: this.depth, groupIndex: this.groupIndex, index: this.index, path: this.path,
      });
    },
    conditionChange(value) {
      this.$emit('rule-change', {
        depth: this.depth, groupIndex: this.groupIndex, index: this.index, path: this.path, value: { operator: value },
      });
    },
    valueChange(value) {
      this.$emit('rule-change', {
        depth: this.depth, groupIndex: this.groupIndex, index: this.index, path: this.path, value: { value },
      });
    },
  },
};
</script>
