<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <span v-if="!loading">
    <label
      v-if="titlePosition === 'before'"
      class="text-secondary mb-1">
      <span
        :id="`helppopover-${field.key}`"
        class="fr-label-text">
        {{ field.title }}
        <i
          v-if="displayPopover"
          class="material-icons material-icons-outlined">
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
    <span v-if="checkIfFloatingLabel(field)">
      <ValidationProvider
        mode="aggressive"
        :immediate="field.validationImmediate"
        :rules="field.validation"
        v-slot="{ errors }">
        <FrFloatingLabelInput
          v-if="field.enum"
          type="select"
          :field-name="field.key"
          v-model="field.value"
          :help-text="getDescription()"
          :select-options="field.options"
          :label="getLabel()" />
        <FrFloatingLabelInput
          v-else-if="field.type === 'password'"
          class="floating-label-input"
          :class="{'fr-error': errors.length}"
          type="password"
          v-model="field.value"
          :field-name="field.key"
          :reveal="true"
          :help-text="getDescription()"
          :label="getLabel()" />
        <FrFloatingLabelInput
          v-else-if="field.type === 'integer'"
          class="floating-label-input"
          :class="{'fr-error': errors.length}"
          type="number"
          v-model.number="field.value"
          :field-name="field.key"
          :help-text="getDescription()"
          :label="getLabel()" />
        <FrFloatingLabelInput
          v-else
          class="floating-label-input"
          :class="{'fr-error': errors.length}"
          :type="field.type"
          v-model="field.value"
          :field-name="field.key"
          :help-text="getDescription()"
          :label="getLabel()" />
        <FrValidationError
          class="error-message"
          :validator-errors="errors"
          :field-name="field.key" />
      </ValidationProvider>
    </span>
    <ToggleButton
      v-else-if="field.type === 'boolean'"
      :css-colors="true"
      v-model="field.value"
      class="pr-2" />
    <BFormTags
      v-else-if="field.type === 'array'"
      v-model="formTagInput"
      :class="[{'fr-error': errors.length}, 'fr-tags']">
      <template v-slot="{ tags, inputAttrs, inputHandlers, addTag, removeTag }">
        <Draggable
          v-model="formTagInput"
          class="d-flex flex-wrap"
          ghost-class="ghost-tag">
          <div
            class="mt-1 mr-1 fr-tag"
            v-for="tag in tags"
            :key="tag"
            body-class="py-1 pr-2 text-nowrap">
            <span>{{ tag }}</span>
            <span @click="removeTag(tag)">
              <i class="material-icons-outlined">
                close
              </i>
            </span>
          </div>
        </Draggable>
        <input
          v-bind="inputAttrs"
          v-on="inputHandlers"
          :placeholder="`${$t('common.add')} ${field.title}`"
          :class="[{'show': !tags.length}, 'fr-input']">
      </template>
    </BFormTags>
    <FrKeyValueList
      v-else-if="field.type === 'object'"
      v-model="field.value"
      @input="checkRequiredInput(field)"
      :class="{'fr-error': errors.length}" />
    <label
      v-if="titlePosition === 'after'"
      class="text-secondary mb-1">
      <span
        :id="`helppopover-${field.key}`"
        class="fr-label-text">
        {{ field.title }}
      </span>
    </label>
    <small
      v-if="!displayPopover && !checkIfFloatingLabel(field)"
      class="text-muted mb-1 d-block">
      {{ field.description }}
    </small>

    <span v-if="!checkIfFloatingLabel(field)">
      <div
        v-for="(error, key) in errors"
        :key="key"
        class="invalid-feedback d-block">
        {{ error }}
      </div>
    </span>
  </span>
</template>

<script>
import {
  capitalize,
  cloneDeep,
  isArray,
} from 'lodash';
import {
  BPopover,
  BFormTags,
} from 'bootstrap-vue';
import { ValidationProvider } from 'vee-validate';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList';
import { ToggleButton } from 'vue-js-toggle-button';
import FloatingLabelInput from '@forgerock/platform-shared/src/components/FloatingLabelInput';
import KeyValueList from '@forgerock/platform-shared/src/components/KeyValueList';
import Draggable from 'vuedraggable';

export default {
  name: 'FrField',
  components: {
    BPopover,
    BFormTags,
    Draggable,
    FrFloatingLabelInput: FloatingLabelInput,
    FrValidationError: ValidationErrorList,
    FrKeyValueList: KeyValueList,
    ToggleButton,
    ValidationProvider,
  },
  data() {
    return {
      currentValue: '',
      errors: [],
      loading: true,
      formTagInput: [],
    };
  },
  props: {
    field: {
      type: Object,
      default() {
        return {
          type: 'string',
          key: '',
        };
      },
    },
    titlePosition: {
      type: String,
      default: 'before',
    },
    displayPopover: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getOptions(field) {
      const options = [];
      field.enum.forEach((enumString, index) => {
        options.push({ text: field.enumNames[index], value: enumString });
      });
      field.options = options;
    },
    checkIfFloatingLabel(field) {
      const typeMap = {
        integer: true,
        string: true,
        textarea: true,
        password: true,
      };
      return typeMap[field.type];
    },
    /**
     * Validates whether input field is required and filled in
     *
     * @param {{
     *  validation: String|Object,
     *  type: String,
     *  key: String
     *  propertyOrder: Number
     * }} field The field that we are checking for input error
     *
     * @returns {Array<String>} The array 'errors' containing all currently found error strings
     */
    checkRequiredInput(field) {
      if (field.validation && (field.validation.required || field.validation.includes('required'))) {
        this.errors = [];
        if (field.type === 'array') {
          if (!field.value) {
            field.value = [];
          }
          let { minItems } = field;
          if (!minItems) {
            minItems = 0;
          }
          if (field.value.length < minItems) {
            this.errors.push(this.$t('trees.editPanel.minimumRequired', { minItems }));
          }
        } else if (field.type === 'object') {
          if (!Object.keys(field.value).length) {
            this.errors.push(this.$t('trees.editPanel.minimumRequired', { minItems: 1 }));
          }
        } else if (field.type === 'string') {
          if (!field.value) {
            this.errors.push(this.$t('common.required'));
          }
        }
      }
    },
    /**
     * Takes the tree array formatted items and converts them into
     * a format that can be used by tag input
     *
     * @param {Object} fieldValue Current object with edit panel save values
     */
    convertVueTag(fieldValue) {
      let tempValue = cloneDeep(fieldValue);
      if (isArray(tempValue)) {
        tempValue = tempValue.map((string) => {
          if (string.text) {
            return string;
          }
          return { text: string };
        });
      }
      return tempValue;
    },
    /**
     * Returns description to display below field if not shown in popup
     *
     * @returns {String} The description text to display below the field
     */
    getDescription() {
      if (!this.displayPopover) {
        return this.field.description;
      }
      return '';
    },
    /**
     * Returns the field label if we want to see it as a floating label
     *
     * @returns {String} The text to display as a floating label
     */
    getLabel() {
      if (this.titlePosition === 'inner') {
        return this.field.title;
      }
      return '';
    },
    /**
     * Changes password field type to allow value to be seen/hidden
     */
    revealText(field) {
      if (field.type === 'text') {
        field.type = 'password';
        field.show = false;
      } else {
        field.type = 'text';
        field.show = true;
      }
    },
  },
  mounted() {
    this.currentValue = cloneDeep(this.field.value);
    this.checkRequiredInput(this.field);
    this.formTagInput = cloneDeep(this.field.value);
    this.field.value = this.convertVueTag(this.field.value);
    if (!this.field.validation) {
      this.field.validation = '';
    }
    if (this.field.enum) {
      this.getOptions(this.field);
    } else if (this.field.format === 'password') {
      this.field.type = 'password';
    } else if (!this.field.type) {
      this.field.type = 'string';
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
    field: {
      handler(newField) {
        if (this.currentValue !== newField.value) {
          this.currentValue = cloneDeep(newField.value);
          this.checkRequiredInput(newField);
          this.$emit('valueChange', this.field);
        }
      },
      deep: true,
    },
    formTagInput(value) {
      this.field.value = this.convertVueTag(value);
    },
  },
};
</script>
<style lang="scss" scoped>
@import '~vue-multiselect/dist/vue-multiselect.min.css';

.fr-error.floating-label-input {
  margin-bottom: 0 !important;
  border: none !important;

  /deep/ input {
    border: 1px solid $danger;
  }

  /deep/ button {
    border: 1px solid $danger !important;
    border-left-color: $gray-400 !important;
  }
}

.fr-label-text {
  .material-icons {
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

  .fr-tags {
    display: flex;
    flex-wrap: wrap;
    line-height: 1em;
    padding: 10px;
    min-height: 54px;

    .fr-tag {
      border-radius: 2px;
      display: flex;
      padding: 3px 5px;
      margin: 2px;
      font-size: 0.85em;
      background-color: #e4f4fd;
      color: #23282e;
      cursor: move;

      .material-icons-outlined {
        cursor: pointer;
      }
    }

    .ghost-tag {
      opacity: 0.3;
    }

    .fr-input {
      opacity: 0;
      padding: 0;
      height: 0;
      transition: all 0.15s;
      outline: 0;
      width: 100%;
      border: 0;
    }

    &:hover > .fr-input,
    .fr-input:focus,
    .show {
      opacity: 1;
      height: 2rem;
    }
  }
}

.input-group {
  & > .input-group-prepend {
    .input-group-text.inset,
    .btn.inset {
      border-right-color: transparent;
    }
  }

  & > .input-group-append {
    .btn {
      border-color: $gray-400;
    }

    .input-group-text.inset,
    .btn.inset {
      border-left-color: transparent;
    }
  }

  & > .form-control {
    &.inset-left:not(:first-child) {
      border-left-color: transparent;
    }

    &.inset-right:not(:first-child) {
      border-right-color: transparent;
    }
  }

  .btn.clear {
    opacity: 1;
    color: $gray-500;
    background-color: $input-bg;

    &.disabled > i {
      color: transparent;
      border-width: 0;
    }
  }
}

.multiselect {
  color: $input-color;

  .multiselect__placeholder {
    position: relative;
    top: 5px;
    padding-top: 0;
  }

  .multiselect__tags {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .multiselect__select {
    top: 6px;
  }

  .multiselect__option--selected.multiselect__option--highlight {
    background-color: $primary;
  }

  .multiselect__option.multiselect__option--highlight {
    background-color: $light-blue;
    color: $input-color;
  }

  .multiselect__single {
    position: relative;
    top: 4px;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .multiselect__input {
    position: relative;
    top: 3px;
  }
}
</style>
