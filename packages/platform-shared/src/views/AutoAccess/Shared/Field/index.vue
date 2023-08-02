<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :id="fieldModel.key"
    :class="[{'d-flex flex-row-reverse': appendTitle}, 'fr-field']"
    v-if="!loading">
    <label
      v-if="displayExternalTitle || appendTitle"
      :class="[{'mb-0 mt-2': fieldModel.type === 'boolean'}, {'mb-1 align-top': fieldModel.type === 'checkbox'}, 'text-secondary w-100']">
      <slot name="title">
        <span
          :id="`helppopover-${fieldModel.key}`"
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
      :ref="fieldModel.key"
      :vid="fieldModel.key"
      :name="fieldModel.title"
      :immediate="fieldModel.validationImmediate"
      :bails="false"
      :rules="fieldModel.validation"
      v-slot="{ errors }">
      <FrMultiselect
        @input="$emit('valueChange', fieldModel.value)"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-if="fieldType === 'multiselect'"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :errors="failedPolicies.concat(errors)"
        :field-name="fieldModel.title || fieldModel.key"
        :disabled="fieldDisabled"
        :help-text="fieldDescription"
        :select-options="fieldModel.options"
        :label="fieldLabel">
        <template
          v-for="(key, slotName) in $scopedSlots"
          #[slotName]="slotData">
          <!-- @slot passthrough slot -->
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
      </FrMultiselect>
      <FrSelectInput
        @input="$emit('valueChange', fieldModel.value)"
        v-if="fieldType === 'select'"
        class="floating-label-input"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :errors="failedPolicies.concat(errors)"
        :field-name="fieldModel.key"
        :disabled="fieldDisabled"
        :help-text="fieldDescription"
        :select-options="fieldModel.options"
        :label="fieldLabel">
        <template
          v-for="(key, slotName) in $scopedSlots"
          #[slotName]="slotData">
          <!-- @slot passthrough slot -->
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
      </FrSelectInput>
      <FrBasicInput
        v-else-if="fieldType === 'password' || fieldType === 'string'"
        :type="fieldType"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="fieldDisabled"
        :errors="failedPolicies.concat(errors)"
        :field-name="fieldModel.key"
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
        @input="$emit('valueChange', fieldModel.value)"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model.number="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="fieldDisabled"
        :errors="failedPolicies.concat(errors)"
        :field-name="fieldModel.key"
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
        @input="$emit('valueChange', fieldModel.value)"
        v-else-if="fieldType === 'tag'"
        v-model="inputValue"
        v-on="$listeners"
        :autofocus="autofocus"
        :errors="failedPolicies.concat(errors)"
        :field-name="fieldModel.title || fieldModel.key"
        :disabled="fieldDisabled" />
      <FrTextArea
        v-else-if="fieldType === 'textarea'"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="fieldDisabled"
        :errors="failedPolicies.concat(errors)"
        :field-name="fieldModel.key"
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
import FrSelectInput from './SelectInput';
import FrMultiselect from './Multiselect';
import FrTag from './Tag';
import FrTextArea from './TextArea';
import FrBasicInput from './Basic';
import FrKeyValueList from './KeyValueList';

export default {
  name: 'FrField',
  components: {
    BFormCheckbox,
    FrBasicInput,
    FrTextArea,
    FrSelectInput,
    FrMultiselect,
    FrKeyValueList,
    FrTag,
    ValidationProvider,
  },
  data() {
    return {
      fieldModel: cloneDeep(this.field),
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
      return this.fieldModel.title || (this.displayDescription ? this.fieldModel.description : '');
    },
    /**
     * Returns description to display below field if not shown in popup
     *
     * @returns {String} The description text to display below the field
     */
    fieldDescription() {
      if (!this.displayDescription || !this.fieldModel.title) {
        return '';
      }
      return this.fieldModel.description;
    },
    fieldDisabled() {
      return this.fieldModel.disabled || this.disabled;
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
      return this.fieldModel.title;
    },
    /**
     * Maps type aliases to known values
     *
     * @returns {String} Final field type
     */
    fieldType() {
      const { type } = this.fieldModel;
      if (!type) {
        return 'string';
      }
      const typeMap = {
        text: 'string',
        array: 'tag',
      };
      if (this.fieldModel.format === 'password') {
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
     * @param {String} fieldModel current field object
     */
    getOptions(fieldModel) {
      const options = [];
      fieldModel.enum.forEach((enumString, index) => {
        options.push({ text: fieldModel.enumNames[index], value: enumString });
      });
      fieldModel.options = options;
    },
  },
  mounted() {
    if (!this.fieldModel.validation) {
      this.fieldModel.validation = '';
    }
    if (this.fieldModel.enum) {
      this.getOptions(this.fieldModel);
    }
    if ((this.fieldType === 'object') && (this.fieldModel.validation.required || this.fieldModel.validation.includes('required'))) {
      this.fieldModel.validation = {
        minimumRequired: this.fieldModel.minItems !== undefined ? this.fieldModel.minItems : 1,
        required: true,
      };
    } else if ((this.fieldType === 'tag') && (this.fieldModel.validation.required || this.fieldModel.validation.includes('required'))) {
      if (this.fieldModel.minItems !== undefined) {
        this.fieldModel.validation = {
          minimumRequired: this.fieldModel.minItems,
          required: true,
        };
      } else {
        this.fieldModel.validation = '';
      }
    }
    if (this.fieldModel.title === this.fieldModel.description) {
      delete this.fieldModel.description;
    }
    this.oldField = cloneDeep(this.fieldModel);
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
          this.fieldModel = cloneDeep(this.field);
          this.inputValue = this.fieldModel.value;
          this.oldField = cloneDeep(newField);
        }
      },
      immediate: true,
      deep: true,
    },
    inputValue: {
      handler(event) {
        this.fieldModel.value = event;
        this.$emit('valueChange', this.fieldModel.value);
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
