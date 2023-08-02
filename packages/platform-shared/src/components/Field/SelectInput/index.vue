<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

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
    :floating-label="floatingLabel"
    :validation="validation"
    :validation-immediate="validationImmediate"
    :readonly-label="disabled">
    <VueMultiSelect
      :id="id"
      ref="vms"
      v-model="inputValue"
      v-bind="$attrs"
      class="text-nowrap"
      label="text"
      track-by="value"
      role="combobox"
      :aria-expanded="isExpanded ? 'true': 'false'"
      :aria-labelledby="id + '-label'"
      :name="name"
      :disabled="disabled"
      :options="selectOptions"
      :searchable="searchable"
      :show-labels="false"
      :allow-empty="allowEmpty"
      :class="[{'polyfill-placeholder': floatLabels, 'h-100': floatingLabel}, 'white-label-background form-control p-0', {'no-multiselect-label': !this.label }]"
      :placeholder="placeholder"
      :data-testid="testid"
      @search-change="$emit('search-change', $event)"
      @open="openHandler"
      @select="$emit('select', $event)"
      @close="floatingLabel && closeDropDown(inputValue)"
      @input="$emit('input', inputValue ? inputValue.value : '')"
      @tag="$emit('tag', $event)">
      <template #noResult>
        {{ $t('common.noResult') }}
      </template>
      <template
        v-for="(key, slotName) in $scopedSlots"
        #[slotName]="slotData">
        <!-- @slot passthrough slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </VueMultiSelect>
    <template
      v-for="(key, slotName) in $scopedSlots"
      #[slotName]="slotData">
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
} from 'lodash';
// import vue-multiselect from src because dist min/uglified package gets removed in build
import VueMultiSelect from '../../../../../../node_modules/vue-multiselect/src/index';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Single select input. Allows selection of one element in a dropdown
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {String} value default ''
 */
export default {
  name: 'SelectInput',
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
    /**
     * Optionally sorts the displayed select options by their text attribute.
     */
    sortOptions: {
      type: Boolean,
      default: false,
    },
    /**
     * Optionally scrolls the selected option into view when the select is opened.
     */
    showSelectedOptionOnOpen: {
      type: Boolean,
      default: false,
    },
    testid: {
      type: String,
      default: '',
    },
    /**
     * For accessibility: if you want to manually associate the input field with a label, legend etc.
     */
    inputLabelledby: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isExpanded: false,
    };
  },
  mounted() {
    if (this.searchable) {
      this.$refs.vms.$refs.search.setAttribute('autocomplete', 'off');
    }

    if (this.autofocus) {
      this.openHandler();
    }

    this.setInputValue(this.value);
  },
  updated() {
    // Note: in certain browsers, screen readers are unable to associate a <legend> with the select component
    // this fix tells the input what it's labelledby, which is the id of that <legend> element
    if (this.inputLabelledby) {
      const multiselectInput = this.$el.querySelector('.multiselect__input');
      if (multiselectInput) {
        multiselectInput.setAttribute('aria-labelledby', this.inputLabelledby);
      }
    }
  },
  computed: {
    selectOptions() {
      let formattedOptions;

      if (this.options.length && Object.hasOwnProperty.call(this.options[0], 'value')) {
        formattedOptions = [...this.options];
      } else {
        formattedOptions = this.options.map((option) => {
          const formattedOption = typeof (option) === 'string' ? option.trim() : option;
          return {
            text: formattedOption,
            value: formattedOption,
          };
        });
      }

      if (this.sortOptions) {
        formattedOptions.sort((a, b) => a.text.localeCompare(b.text));
      }
      return formattedOptions;
    },
  },
  methods: {
    closeDropDown(newVal) {
      this.isExpanded = false;
      if (newVal === null) {
        this.floatLabels = false;
      } else {
        const value = typeof newVal === 'object' && Object.hasOwnProperty.call(newVal, 'value') ? newVal.value : newVal;
        this.floatLabels = value !== undefined && value !== null && (value.toString().length > 0 || (this.value !== null && this.value.length > 0)) && !!this.label;
      }
      this.$emit('close');
    },
    inputValueHandler(inputValue) {
      this.floatLabels = this.floatingLabel && inputValue && inputValue.value !== null && inputValue.value.toString().length > 0 && !!this.label;
    },
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.inputValue = find(this.selectOptions, { value: newVal });
      }
    },
    /**
     * @description focus the Vue Multi Select component (vms) and floats the label
     * Also scrolls the selected option into view if showSelectedOptionOnOpen is true
     */
    openHandler() {
      this.isExpanded = true;
      this.$emit('open');

      if (this.searchable) {
        this.$refs.vms.$el.querySelector('input').focus();
      }
      this.floatLabels = this.floatingLabel;

      // Scroll the select list to show the selected option
      if (this.showSelectedOptionOnOpen && this.value) {
        setTimeout(() => {
          this.$refs.vms.$el.querySelector('.multiselect__option--selected').scrollIntoView({ block: 'center' });
        }, 20);
      }
    },
  },
  watch: {
    value: {
      handler(value) {
        this.setInputValue(value);

        if (this.floatingLabel && value === '') {
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
        if (!oldValueObject || (newValueObject && (oldValueObject.value === newValueObject.value && oldValueObject.text !== newValueObject.text))) {
          this.setInputValue(this.value);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';

::v-deep .form-label-group {
  .form-label-group-input {
    .multiselect--active {
      outline-offset: 2px;
      outline: 2px solid;
    }
  }
}

</style>