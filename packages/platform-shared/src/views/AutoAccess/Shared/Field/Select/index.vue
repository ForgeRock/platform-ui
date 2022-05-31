<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :id="id"
    :field-name="fieldName"
    :help-text="helpText"
    :errors="errors"
    :is-html="isHtml"
    :label="label">
    <VueMultiSelect
      :id="id"
      ref="vms"
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
      @open="openHandler"
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
    /**
     * Default search value
     */
    value: {
      type: Array|Object|Number|String,
      default: '',
    },
    allowEmpty: {
      type: Boolean,
      default: false,
    },
    /**
     * List of errors related to input value
     */
    errors: {
      type: Array,
      default: () => [],
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
    /**
     * @description Enable autofocus
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    if (this.autofocus) {
      this.openHandler();
    }

    this.setInputValue(this.value);
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
        this.floatLabels = value !== undefined && value !== null && (value.toString().length > 0 || this.value.length > 0) && !!this.label;
      }
    },
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.inputValue = find(this.options, { value: newVal });
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
        if (!this.inputValue) {
          this.setInputValue(value);
        }

        if (value === '') {
          this.floatLabels = false;
        }
      },
      deep: true,
    },
    selectOptions() {
      if (!this.inputValue || this.value !== this.inputValue.value) {
        this.setInputValue(this.value);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';

::v-deep .multiselect:focus-within {
  border-color: $blue;
  box-shadow: 0 0 0 0.0625rem $blue;
}

::v-deep .multiselect .multiselect__input {
  font-size: 0.9375rem;
  margin-top: 0;
  margin-bottom: 0;
  color: var(--gray);
  padding-top: 0.25rem !important;
}

::v-deep .multiselect .multiselect__tags {
  font-size: 0.9375rem;
}

::v-deep .multiselect .multiselect__single {
  margin-bottom: 0;
  font-size: 0.9375rem;
}
</style>
