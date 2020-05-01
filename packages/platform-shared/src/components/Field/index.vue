<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    :id="field.key"
    class="fr-field"
    v-if="!loading">
    <label
      v-if="prependTitle"
      class="text-secondary mb-1 w-100">
      <span
        :id="`helppopover-${field.key}`"
        class="fr-label-text">
        {{ field.title || field.description }}
        <i
          v-if="displayPopover"
          class="material-icons-outlined">
          help_outline
        </i>
      </span>
      <BPopover
        v-if="displayPopover"
        :target="`helppopover-${field.key}`"
        boundary="window"
        placement="left"
        :title="field.title">
        <div v-html="field.description" />
      </BPopover>
    </label>
    <ToggleButton
      v-if="field.type === 'boolean'"
      :css-colors="true"
      v-model="inputValue"
      v-on="$listeners"
      :sync="true"
      :height="field.height || 22"
      :width="field.width || 50"
      :disabled="field.disabled"
      class="pr-2" />
    <BFormCheckbox
      v-else-if="field.type === 'checkbox'"
      v-model="inputValue"
      v-on="$listeners"
      :disabled="field.disabled"
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
        v-if="field.type === 'multiselect'"
        class="floating-label-input"
        :field-name="field.key"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="field.disabled"
        :help-text="getDescription()"
        :select-options="field.options"
        :label="getLabel()" />
      <FrSelect
        @input="$emit('valueChange', field.value)"
        v-if="field.type === 'select'"
        class="floating-label-input"
        :field-name="field.key"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="field.disabled"
        :help-text="getDescription()"
        :select-options="field.options"
        :label="getLabel()" />
      <FrBasicInput
        v-else-if="field.type === 'password' || field.type === 'string'"
        :type="field.type"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="field.disabled"
        :field-name="field.key"
        :help-text="getDescription()"
        :label="getLabel()">
        <template slot="prepend">
          <slot name="prepend" />
        </template>
        <template slot="append">
          <slot name="append" />
        </template>
      </FrBasicInput>
      <FrBasicInput
        v-else-if="field.type === 'integer'"
        @input="$emit('valueChange', field.value)"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model.number="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="field.disabled"
        :field-name="field.key"
        :help-text="getDescription()"
        :label="getLabel()">
        <template slot="prepend">
          <slot name="prepend" />
        </template>
        <template slot="append">
          <slot name="append" />
        </template>
      </FrBasicInput>
      <FrKeyValueList
        v-else-if="field.type === 'object'"
        v-model="inputValue"
        v-on="$listeners"
        :disabled="field.disabled"
        :class="{'fr-error': errors.length || failedPolicies.length}" />
      <FrTag
        @input="$emit('valueChange', field.value)"
        v-else-if="field.type === 'tag'"
        v-model="inputValue"
        v-on="$listeners"
        :field-title="field.title"
        :disabled="field.disabled"
        :class="{'fr-error': errors.length || failedPolicies.length}" />
      <FrTextArea
        v-else-if="field.type === 'textarea'"
        :class="[{'fr-error': errors.length || failedPolicies.length}, 'floating-label-input']"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
        :disabled="field.disabled"
        :field-name="field.key"
        :help-text="getDescription()"
        :label="getLabel()" />
      <slot name="validationError">
        <!-- static error display through props  -->
        <FrValidationError
          v-if="failedPolicies.length"
          :validator-errors="failedPolicies"
          :field-name="field.key" />
        <!-- dynamic error display through vee-validate  -->
        <FrValidationError
          v-else
          class="error-messages"
          :validator-errors="errors"
          :field-name="field.key" />
      </slot>
    </ValidationProvider>
    <label
      v-if="!this.prependTitle && (this.field.type === 'boolean' || this.field.type === 'checkbox')"
      class="text-secondary mb-1 align-top">
      <span :id="`helppopover-${field.key}`">
        {{ field.title }}
      </span>
    </label>
  </div>
</template>

<script>
import {
  capitalize,
  cloneDeep,
  isEqual,
} from 'lodash';
import {
  BPopover,
  BFormCheckbox,
} from 'bootstrap-vue';
import { ValidationProvider } from 'vee-validate';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList';
import BasicInput from '@forgerock/platform-shared/src/components/Field/Basic';
import TextArea from '@forgerock/platform-shared/src/components/Field/TextArea';
import Select from '@forgerock/platform-shared/src/components/Field/Select';
import Multiselect from '@forgerock/platform-shared/src/components/Field/Multiselect';
import FrTag from '@forgerock/platform-shared/src/components/Field/Tag';
import { ToggleButton } from 'vue-js-toggle-button';
import KeyValueList from './KeyValueList';

export default {
  name: 'FrField',
  components: {
    BPopover,
    BFormCheckbox,
    FrBasicInput: BasicInput,
    FrTextArea: TextArea,
    FrSelect: Select,
    FrMultiselect: Multiselect,
    FrValidationError: ValidationErrorList,
    FrKeyValueList: KeyValueList,
    FrTag,
    ToggleButton,
    ValidationProvider,
  },
  data() {
    return {
      inputValue: this.field.value,
      attrs: {},
      loading: true,
      oldValue: '',
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
     * Determines whether description should be shown as a popover
     */
    displayPopover: {
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
     * Places title of field above actual field
     */
    prependTitle: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    /**
     * Returns description to display below field if not shown in popup
     *
     * @returns {String} The description text to display below the field
     */
    getDescription() {
      if (this.displayPopover || !this.displayDescription) {
        return '';
      }
      return this.field.description;
    },
    /**
     * Returns the field label if we want to see it as a floating label
     *
     * @returns {String} The text to display as a floating label
     */
    getLabel() {
      if (this.prependTitle) {
        return '';
      }
      return this.field.title;
    },
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
    /**
     * Maps type aliases to known values
     *
     * @property {Object} field current field object
     *
     * @returns {String} Final field type
     */
    mapType(field) {
      if (!field.type) {
        return 'string';
      }
      const typeMap = {
        text: 'string',
        number: 'integer',
        array: 'tag',
      };
      if (typeMap[field.type]) {
        return typeMap[field.type];
      }
      return field.type;
    },
  },
  mounted() {
    this.attrs = { ...this.$options.propsData, ...this.$attrs };
    this.oldValue = cloneDeep(this.field.value);
    this.field.type = this.mapType(this.field);
    if (!this.field.validation) {
      this.field.validation = '';
    }
    if (this.field.enum) {
      this.getOptions(this.field);
    } else if (this.field.format === 'password') {
      this.field.type = 'password';
    }
    if ((this.field.type === 'object') && (this.field.validation.required || this.field.validation.includes('required'))) {
      this.field.validation = {
        minimumRequired: this.field.minItems !== undefined ? this.field.minItems : 1,
        required: true,
      };
    } else if ((this.field.type === 'tag') && (this.field.validation.required || this.field.validation.includes('required'))) {
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
     * Sets field disabled based on disabled property
     */
    disabled: {
      handler(value) {
        this.field.disabled = value;
      },
      immediate: true,
    },
    /**
     * Runs required check on few remaining field types that have not converted
     * to vee-validate. Also emits out changed value.
     */
    field: {
      handler(newField) {
        if (!isEqual(this.oldValue, newField.value)) {
          this.inputValue = this.field.value;
          this.oldValue = cloneDeep(newField.value);
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

  /deep/ {
    input,
    textarea {
      border: 1px solid $danger;

      &:focus {
        box-shadow: 0 0 0 0.0625rem $danger;
      }
    }

    button {
      border: 1px solid $danger !important;
      border-left-color: $gray-400 !important;
    }
  }
}

.fr-label-text {
  .material-icons-outlined {
    font-size: 1rem;
    margin-bottom: 3px;
  }

  &:hover {
    color: $primary;
    cursor: pointer;
  }
}

/deep/ {
  .vue-js-switch {
    .v-switch-core {
      background-color: $gray-400;
    }

    &.toggled {
      .v-switch-core {
        background-color: $primary;
      }
    }
  }
}
</style>
