<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrInputLayout
    :id="id"
    :field-name="fieldName"
    :help-text="helpText"
    :errors="errors"
    :is-html="isHtml"
    :label="label">
    <VueMultiSelect
      ref="vms"
      v-model="inputValue"
      v-bind="$attrs"
      label="text"
      track-by="value"
      :name="fieldName"
      :disabled="disabled"
      :options="options"
      :show-labels="false"
      :hide-selected="true"
      :multiple="true"
      :close-on-select="false"
      :searchable="defaultSearchable"
      :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'no-multiselect-label': !this.label }, {'h-100': floatLabels || !this.label }]"
      :placeholder="defaultPlaceholder"
      @search-change="searchChange"
      @open="openHandler"
      @close="addTag"
      v-on="$listeners">
      <slot name="noResult">
        {{ $t('common.noResult') }}
      </slot>
      <template
        v-for="(key, slotName) in $scopedSlots"
        v-slot:[slotName]="slotData">
        <!-- @slot pass-through slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </VueMultiSelect>
    <template
      v-for="(key, slotName) in $scopedSlots"
      v-slot:[slotName]="slotData">
      <!-- @slot pass-through slot -->
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
  isEqual,
  map,
} from 'lodash';
import VueMultiSelect from 'vue-multiselect';
import InputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Multi select input. Allows selection of multiple element in a dropdown
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
  name: 'MultiSelect',
  mixins: [InputMixin],
  components: {
    FrInputLayout: InputLayout,
    VueMultiSelect,
  },
  props: {
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
      default: () => [],
    },
    searchable: {
      type: Boolean,
      default: true,
      required: false,
    },
    placeholder: {
      type: String,
      default: '',
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
  data() {
    return {
      searchValue: '',
    };
  },
  mounted() {
    if (this.autofocus) {
      this.openHandler();
    }
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
    defaultSearchable() {
      return this.searchable || this.options.length > 9;
    },
    defaultPlaceholder() {
      return this.placeholder || this.$t('common.typeToSearch');
    },
  },
  methods: {
    addTag() {
      if (this.$attrs.taggable && this.searchValue.length > 0) {
        this.options.push({ text: this.searchValue, value: this.searchValue });
        this.inputValue.push({ text: this.searchValue, value: this.searchValue });
      }
      this.floatLabels = this.inputValue && this.inputValue.length;
    },
    searchChange(value) {
      this.searchValue = value;
      this.$emit('search-change', value);
    },
    setInputValue(newVal) {
      const newInputValue = map(newVal, (val) => find(this.options, { value: val }));
      if (!isEqual(this.inputValue, newInputValue)) {
        this.inputValue = newInputValue;
      }
    },
    inputValueHandler(newVal) {
      this.floatLabels = (newVal.length || document.activeElement === this.$refs.vms.$el.querySelector('input')) > 0 && this.label;
      this.$emit('input', map(newVal, 'value'));
    },
    /**
     * @description focus the Vue Multi Select component (vms) and floats the label
     */
    openHandler() {
      this.$refs.vms.$el.querySelector('input').focus();
      this.floatLabels = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';

/deep/ .multiselect:focus-within {
  border-color: $blue;
  box-shadow: 0 0 0 0.0625rem $blue;
}
</style>
