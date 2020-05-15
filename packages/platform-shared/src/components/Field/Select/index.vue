<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrInputLayout
    :id="id"
    :field-name="fieldName"
    :help-text="helpText"
    :is-html="isHtml"
    :label="label">
    <VueMultiSelect
      v-model="inputValue"
      v-bind="$attrs"
      class="h-100"
      label="text"
      track-by="value"
      :name="fieldName"
      :disabled="disabled"
      :options="options"
      :searchable="searchable"
      :show-labels="false"
      :allow-empty="allowEmpty"
      :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'no-multiselect-label': !this.label }]"
      :placeholder="placeholder"
      @search-change="$emit('search-change', $event)"
      @open="floatLabels = true"
      @close="closeDropDown(inputValue)">
      <slot name="noResult">
        {{ $t('common.noResult') }}
      </slot>
      <template
        v-for="(key, slotName) in $scopedSlots"
        v-slot:[slotName]="slotData">
        <!-- @slot passthrough slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </VueMultiSelect>
    <template
      v-for="(key, slotName) in $scopedSlots"
      v-slot:[slotName]="slotData">
      <!-- @slot passthrough slot -->
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrInputLayout>
</template>

<script>
import {
  find,
  has,
  map,
} from 'lodash';
import VueMultiSelect from 'vue-multiselect';
import InputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Single select input. Allows selection of one element in a dropdown
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @prop {boolean} disabled default false
 *  @prop {string} fieldName default ''
 *  @prop {string} helpText default ''
 *  @prop {string} label default ''
 *  @prop {array|object} failedPolicies default {}
 *  @prop {function} validator default noop
 *  @prop {Array|Object|Number|String} value default ''
 */
export default {
  name: 'Select',
  mixins: [InputMixin],
  components: {
    FrInputLayout: InputLayout,
    VueMultiSelect,
  },
  props: {
    allowEmpty: {
      type: Boolean,
      default: false,
    },
    /**
     * Options for select input.
     */
    selectOptions: {
      type: [Array, Object],
      required: true,
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('common.typeToSearch');
      },
      required: false,
    },
    searchable: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  computed: {
    options() {
      if (this.selectOptions.length && has(this.selectOptions[0], 'value')) {
        return this.selectOptions;
      }

      return map(this.selectOptions, (option) => ({
        text: option,
        value: option,
      }));
    },
  },
  methods: {
    closeDropDown(newVal) {
      if (newVal === null) {
        this.floatLabels = false;
      } else {
        const value = typeof newVal === 'object' && Object.hasOwnProperty.call(newVal, 'value') ? newVal.value : newVal;
        this.floatLabels = !!value && (value.toString().length > 0 || this.value.length > 0) && !!this.label;
      }
    },
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.inputValue = find(this.options, { value: newVal });
      }
    },
  },
  watch: {
    value: {
      handler(value) {
        this.setInputValue(value);

        if (value === '') {
          this.floatLabels = false;
        }
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';
</style>
