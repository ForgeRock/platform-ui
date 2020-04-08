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
      v-model="field.value"
      :disabled="field.disabled"
      class="pr-2" />
    <BFormCheckbox
      v-else-if="field.type === 'checkbox'"
      v-model="field.value"
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
      <FrFloatingLabelInput
        v-if="field.type === 'select' || field.type === 'multiselect'"
        :type="field.type"
        class="floating-label-input"
        :field-name="field.key"
        v-model="field.value"
        v-bind="$props"
        :disabled="field.disabled"
        :help-text="getDescription()"
        :select-options="field.options"
        :label="getLabel()" />
      <FrFloatingLabelInput
        v-else-if="field.type === 'password'"
        type="password"
        :class="[{'fr-error': errors.length}, 'floating-label-input']"
        v-model="field.value"
        v-bind="$props"
        :disabled="field.disabled"
        :field-name="field.key"
        :reveal="true"
        :help-text="getDescription()"
        :label="getLabel()" />
      <FrFloatingLabelInput
        v-else-if="field.type === 'integer'"
        type="number"
        :class="[{'fr-error': errors.length}, 'floating-label-input']"
        v-model.number="field.value"
        v-bind="$props"
        :disabled="field.disabled"
        :field-name="field.key"
        :help-text="getDescription()"
        :label="getLabel()" />
      <FrKeyValueList
        v-else-if="field.type === 'object'"
        v-model="field.value"
        :disabled="field.disabled"
        :class="{'fr-error': errors.length}" />
      <FrTag
        v-else-if="field.type === 'tag'"
        v-model="field.value"
        :field-title="field.title"
        :disabled="field.disabled"
        :class="{'fr-error': errors.length}" />
      <FrFloatingLabelInput
        v-else
        :type="field.type"
        :class="[{'fr-error': errors.length}, 'floating-label-input']"
        v-model="field.value"
        v-bind="$props"
        :disabled="field.disabled"
        :field-name="field.key"
        :help-text="getDescription()"
        :label="getLabel()">
        <!-- @slot allows buttons to be appended -->
        <template slot="append">
          <slot name="append" />
        </template>
      </FrFloatingLabelInput>
      <!-- @slot allows different error displays -->
      <slot name="validationError">
        <FrValidationError
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
} from 'lodash';
import {
  BPopover,
  BFormCheckbox,
} from 'bootstrap-vue';
import { ValidationProvider } from 'vee-validate';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList';
import FrTag from '@forgerock/platform-shared/src/components/Field/Tag';
import { ToggleButton } from 'vue-js-toggle-button';
import FloatingLabelInput from './FloatingLabelInput';
import KeyValueList from './KeyValueList';

export default {
  name: 'FrField',
  components: {
    BPopover,
    BFormCheckbox,
    FrFloatingLabelInput: FloatingLabelInput,
    FrValidationError: ValidationErrorList,
    FrKeyValueList: KeyValueList,
    FrTag,
    ToggleButton,
    ValidationProvider,
  },
  data() {
    return {
      oldValue: '',
      loading: true,
    };
  },
  props: {
    /**
     * Function called after input value is changed (used in callback components)
     */
    callback: {
      type: Object,
      default: () => {},
      required: false,
    },
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
      type: [Array, Object],
      default: () => {},
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
    /**
     * Function used to validate data (used in callback components)
     */
    validator: {
      type: Function,
      default: () => undefined,
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
        if (this.oldValue !== newField.value) {
          this.oldValue = cloneDeep(newField.value);
          this.$emit('valueChange', this.field);
        }
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
