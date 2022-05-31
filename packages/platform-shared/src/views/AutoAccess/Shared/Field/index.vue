<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :id="field.key"
    :class="[{'d-flex flex-row-reverse': appendTitle}, 'fr-field']"
    v-if="!loading">
    <label
      v-if="displayExternalTitle || appendTitle"
      :class="[{'mb-0 mt-2': this.field.type === 'boolean'}, {'mb-1 align-top': this.field.type === 'checkbox'}, 'text-secondary w-100']">
      <slot name="title">
        <span
          :id="`helppopover-${field.key}`"
          tabindex="0"
          class="fr-label-text">
          {{ externalTitle }}
        </span>
      </slot>
    </label>
    <BFormCheckbox
      role="switch"
      v-if="fieldType === 'boolean'"
      switch
      size="lg"
      v-model="inputValue"
      v-on="$listeners"
      :autofocus="autofocus"
      :disabled="fieldDisabled"
      class="d-inline-flex fr-toggle-primary" />
    <BFormCheckbox
      role="checkbox"
      v-else-if="fieldType === 'checkbox'"
      v-model="inputValue"
      v-on="$listeners"
      :autofocus="autofocus"
      :disabled="fieldDisabled"
      class="mr-0"
      inline />
    <ValidationProvider
      v-else
      mode="aggressive"
      :ref="field.key"
      :vid="field.key"
      :name="field.title"
      :immediate="field.validationImmediate"
      :bails="false"
      :rules="field.validation"
      v-slot="{ errors }">
      <FrMultiselect
        @input="$emit('valueChange', field.value)"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-if="fieldType === 'multiselect'"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :errors="failedPolicies.concat(errors)"
        :field-name="field.title || field.key"
        :disabled="fieldDisabled"
        :help-text="fieldDescription"
        :select-options="field.options"
        :label="fieldLabel">
        <template
          v-for="(key, slotName) in $scopedSlots"
          v-slot:[slotName]="slotData">
          <!-- @slot passthrough slot -->
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
      </FrMultiselect>
      <FrSelect
        @input="$emit('valueChange', field.value)"
        v-if="fieldType === 'select'"
        class="floating-label-input"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :errors="failedPolicies.concat(errors)"
        :field-name="field.key"
        :disabled="fieldDisabled"
        :help-text="fieldDescription"
        :select-options="field.options"
        :label="fieldLabel">
        <template
          v-for="(key, slotName) in $scopedSlots"
          v-slot:[slotName]="slotData">
          <!-- @slot passthrough slot -->
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
      </FrSelect>
      <FrBasicInput
        v-else-if="fieldType === 'password' || fieldType === 'string'"
        :type="fieldType"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="fieldDisabled"
        :errors="failedPolicies.concat(errors)"
        :field-name="field.key"
        :help-text="fieldDescription"
        :label="fieldLabel">
        <template slot="prepend">
          <slot name="prepend" />
        </template>
        <template slot="append">
          <slot name="append" />
        </template>
      </FrBasicInput>
      <FrBasicInput
        v-else-if="fieldType === 'number' || fieldType === 'integer'"
        @input="$emit('valueChange', field.value)"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model.number="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="fieldDisabled"
        :errors="failedPolicies.concat(errors)"
        :field-name="field.key"
        :help-text="fieldDescription"
        :label="fieldLabel"
        type="number">
        <template slot="prepend">
          <slot name="prepend" />
        </template>
        <template slot="append">
          <slot name="append" />
        </template>
      </FrBasicInput>
      <FrKeyValueList
        v-else-if="fieldType === 'object'"
        v-model="inputValue"
        v-on="$listeners"
        :disabled="fieldDisabled"
        :class="{'fr-error': errors.length || failedPolicies.length}" />
      <FrTag
        @input="$emit('valueChange', field.value)"
        v-else-if="fieldType === 'tag'"
        v-model="inputValue"
        v-on="$listeners"
        :autofocus="autofocus"
        :errors="failedPolicies.concat(errors)"
        :field-name="field.title || field.key"
        :disabled="fieldDisabled" />
      <FrTextArea
        v-else-if="fieldType === 'textarea'"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="fieldDisabled"
        :errors="failedPolicies.concat(errors)"
        :field-name="field.key"
        :help-text="fieldDescription"
        :label="fieldLabel" />
    </ValidationProvider>
  </div>
</template>

<script>
import {
  capitalize,
  cloneDeep,
  isEqual,
} from 'lodash';
import { BFormCheckbox } from 'bootstrap-vue';
import { ValidationProvider } from 'vee-validate';
import Select from './Select';
import Multiselect from './Multiselect';
import FrTag from './Tag';
import TextArea from './TextArea';
import BasicInput from './Basic';
import KeyValueList from './KeyValueList';

export default {
  name: 'FrField',
  components: {
    BFormCheckbox,
    FrBasicInput: BasicInput,
    FrTextArea: TextArea,
    FrSelect: Select,
    FrMultiselect: Multiselect,
    FrKeyValueList: KeyValueList,
    FrTag,
    ValidationProvider,
  },
  data() {
    return {
      inputValue: this.field.value,
      loading: true,
      oldField: {},
    };
  },
  props: {
    /**
     * Secondary way of disabling this field
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Determines whether description should be shown
     */
    displayDescription: {
      type: Boolean,
      default: true,
    },
    /**
     * Autofocus field.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * List of errors related to input value (used in callback components)
     */
    failedPolicies: {
      type: Array,
      default: () => [],
    },
    /**
     * Contains metadata for current field
     * {
     *   key: string - unique name of field for backend management
     *   title: string - optional label visible to users
     *   type: string - available types: string/text, textarea,
     *     password, number, select, multiselect, tag/array, boolean,
     *     checkbox, object. Defaults to string
     *   description: string - optional descriptive sentence or paragraph
     *   value: [string, array, object, number, boolean] - value of field
     *   options: array - optional array of selectable options for select/multiselect
     *   validation: string - optional vee-validate validation types to check against
     *   validationImmediate: boolean - optional decision of whether error validation should happen
     *     the moment that this component renders
     *   disabled: boolean - optional whether field is currently disabled - defaults to false
     *   enum: array - values of options (optional alternative for building options array)
     *   enumNames: array - visible labels of options (optional alternative for building options array)
     *   height: number - optional value that overwrites default height of toggle button
     *   width: number - optional value that overwrites default width of toggle button
     * }
     * e.g.:
     * {
     *   key: 'example',
     *   title: 'Example Field',
     *   type: 'select',
     *   description: 'This field allows you to seleect the value you want'
     *   value: 'Selected value',
     *   options: ['Selected value', 'Another value'],
     *   validation: 'required|unique',
     *   disabled: false,
     * }
     */
    field: {
      type: Object,
      default() {
        return {
          type: 'string',
          key: '',
        };
      },
    },
    /**
     * Places title of field outside actual field instead of floating label within
     */
    displayExternalTitle: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    appendTitle() {
      return this.fieldType === 'boolean' || this.fieldType === 'checkbox';
    },
    attrs() {
      return { ...this.$options.propsData, ...this.$attrs };
    },
    externalTitle() {
      return this.field.title || (this.displayDescription ? this.field.description : '');
    },
    /**
     * Returns description to display below field if not shown in popup
     *
     * @returns {String} The description text to display below the field
     */
    fieldDescription() {
      if (!this.displayDescription || !this.field.title) {
        return '';
      }
      return this.field.description;
    },
    fieldDisabled() {
      return this.field.disabled || this.disabled;
    },
    /**
     * Returns the field label if we want to see it as a floating label
     *
     * @returns {String} The text to display as a floating label
     */
    fieldLabel() {
      if (this.displayExternalTitle) {
        return '';
      }
      return this.field.title;
    },
    /**
     * Maps type aliases to known values
     *
     * @returns {String} Final field type
     */
    fieldType() {
      const { type } = this.field;
      if (!type) {
        return 'string';
      }
      const typeMap = {
        text: 'string',
        array: 'tag',
      };
      if (this.field.format === 'password') {
        return 'password';
      }
      if (typeMap[type]) {
        return typeMap[type];
      }
      return type;
    },
  },
  methods: {
    /**
     * Builds array of options if field metadata contains enum property
     *
     * @param {String} field current field object
     */
    getOptions(field) {
      const options = [];
      field.enum.forEach((enumString, index) => {
        options.push({ text: field.enumNames[index], value: enumString });
      });
      field.options = options;
    },
  },
  mounted() {
    if (!this.field.validation) {
      this.field.validation = '';
    }
    if (this.field.enum) {
      this.getOptions(this.field);
    }
    if ((this.fieldType === 'object') && (this.field.validation.required || this.field.validation.includes('required'))) {
      this.field.validation = {
        minimumRequired: this.field.minItems !== undefined ? this.field.minItems : 1,
        required: true,
      };
    } else if ((this.fieldType === 'tag') && (this.field.validation.required || this.field.validation.includes('required'))) {
      if (this.field.minItems !== undefined) {
        this.field.validation = {
          minimumRequired: this.field.minItems,
          required: true,
        };
      } else {
        this.field.validation = '';
      }
    }
    if (this.field.title === this.field.description) {
      delete this.field.description;
    }
    this.oldField = cloneDeep(this.field);
    this.loading = false;
  },
  filters: {
    /**
     * Capitalize each option
     *
     * @param {String} value to be capitalized
     */
    capitalize,
  },
  watch: {
    /**
     * Runs required check on few remaining field types that have not converted
     * to vee-validate. Also emits out changed value.
     */
    field: {
      handler(newField) {
        if (!isEqual(this.oldField.value, newField.value)) {
          this.inputValue = this.field.value;
          this.oldField = cloneDeep(newField);
        }
      },
      deep: true,
    },
    inputValue: {
      handler(event) {
        this.field.value = event;
        this.$emit('valueChange', this.field.value);
      },
      deep: true,
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-error.floating-label-input {
  margin-bottom: 0 !important;
  border: none !important;

  ::v-deep {
    input:not(.multiselect__input),
    textarea {
      border: 1px solid $danger;

      &:focus {
        box-shadow: 0 0 0 0.0625rem $danger;
      }
    }

    .multiselect {
      border: 1px solid $danger;
    }

    button {
      border: 1px solid $danger !important;
      border-left-color: $input-bg !important;
    }
  }
}
</style>
