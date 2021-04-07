<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :id="id"
    :name="name"
    :description="description"
    :errors="errors"
    :is-html="isHtml"
    :label="label"
    :validation="validation"
    :validation-immediate="validationImmediate">
    <VueMultiSelect
      :id="id"
      ref="vms"
      v-model="inputValue"
      v-bind="$attrs"
      class="h-100 text-nowrap"
      label="text"
      track-by="value"
      :name="name"
      :disabled="disabled"
      :options="selectOptions"
      :searchable="searchable"
      :show-labels="false"
      :allow-empty="allowEmpty"
      :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'no-multiselect-label': !this.label }]"
      :placeholder="placeholder"
      @search-change="$emit('search-change', $event)"
      @open="openHandler"
      @close="closeDropDown(inputValue)"
      @input="$emit('input', inputValue.value)">
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
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Single select input. Allows selection of one element in a dropdown
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {String} value default ''
 */
export default {
  name: 'Select',
  mixins: [InputMixin],
  components: {
    FrInputLayout,
    VueMultiSelect,
  },
  props: {
    allowEmpty: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('common.typeToSearch');
      },
    },
    searchable: {
      type: Boolean,
      default: true,
    },
    /**
     * Options for select input.
     */
    options: {
      type: [Array, Object],
      required: true,
    },
  },
  mounted() {
    if (this.autofocus) {
      this.openHandler();
    }

    this.setInputValue(this.value);
  },
  computed: {
    selectOptions() {
      if (this.options.length && has(this.options[0], 'value')) {
        return this.options;
      }

      return map(this.options, (option) => ({
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
        this.floatLabels = value !== undefined && value !== null && (value.toString().length > 0 || this.value.length > 0) && !!this.label;
      }
    },
    inputValueHandler(inputValue) {
      this.floatLabels = inputValue.value !== null && inputValue.value.toString().length > 0 && !!this.label;
    },
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.inputValue = find(this.selectOptions, { value: newVal });
      }
    },
    /**
     * @description focus the Vue Multi Select component (vms) and floats the label
     */
    openHandler() {
      if (this.searchable) {
        this.$refs.vms.$el.querySelector('input').focus();
      }
      this.floatLabels = true;
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
    options(newOptions, oldOptions) {
      if (!this.inputValue || this.value !== this.inputValue.value) {
        this.setInputValue(this.value);
      }
      // Look for changes to the text of the selected option and update the input value if needed
      if (this.value) {
        const oldValueObject = oldOptions.find(({ value }) => value === this.value);
        const newValueObject = newOptions.find(({ value }) => value === this.value);
        if (!oldValueObject || (oldValueObject.value === newValueObject.value && oldValueObject.text !== newValueObject.text)) {
          this.setInputValue(this.value);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';
</style>
