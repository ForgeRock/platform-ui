<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="mb-3">
    <div
      :class="[{'form-label-password': reveal}, 'form-label-group', 'mb-0']"
      ref="floatingLabelGroup">
      <textarea
        v-if="inputType === 'textarea'"
        :id="id"
        :rows="rows"
        :cols="cols"
        :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control']"
        :autofocus="autofocus"
        v-model="inputValue"
        :placeholder="label"
        :data-vv-as="label"
        :disabled="disabled"
        @keyup="validator"
        ref="input"
        :name="fieldName" />
      <MultiSelect
        v-else-if="inputType === 'multiselect'"
        v-model="inputValue"
        :name="fieldName"
        label="text"
        track-by="value"
        :disabled="disabled"
        :options="multiselectOptions"
        :show-labels="false"
        :hide-selected="true"
        :multiple="true"
        :close-on-select="false"
        :searchable="multiselectOptions.length > 9"
        @open="floatLabels = true"
        @close="floatLabels = value && value.length"
        :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'h-25': floatLabels || !this.label }, {'no-multiselect-label': !this.label }]"
        placeholder="Type to search">
        <slot name="noResult">
          {{ $t('common.noResult') }}
        </slot>
      </MultiSelect>
      <MultiSelect
        v-else-if="inputType === 'select'"
        v-model="inputValue"
        :name="fieldName"
        label="text"
        track-by="value"
        :disabled="disabled"
        :options="multiselectOptions"
        :show-labels="false"
        :allow-empty="false"
        :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'h-25': floatLabels || !this.label }, {'no-multiselect-label': !this.label }]"
        placeholder="Type to search">
        <slot name="noResult">
          {{ $t('common.noResult') }}
        </slot>
      </MultiSelect>
      <input
        v-else
        :type="showPassword ? 'text' : inputType"
        :id="id"
        :class="[{'polyfill-placeholder': floatLabels, 'is-invalid': errorMessages && errorMessages.length }, 'form-control']"
        :autofocus="autofocus"
        v-model="inputValue"
        :placeholder="label"
        :data-vv-as="label"
        :disabled="disabled"
        @keyup="validator"
        ref="input"
        :name="fieldName">
      <!-- @slot allows buttons to be appended -->
      <slot name="append">
        <div
          v-if="reveal"
          class="input-group-append">
          <button
            @click="revealText"
            class="btn btn-secondary"
            type="button"
            name="revealButton"
            @keyup.enter="$emit('enter')">
            <i class="material-icons material-icons-outlined">
              <template v-if="showPassword">
                visibility_off
              </template>
              <template v-else>
                visibility
              </template>
            </i>
          </button>
        </div>
      </slot>
      <label
        v-if="label"
        :hidden="hideLabel"
        :for="id"
        class="no-pointer-events">
        {{ label }}
      </label>
    </div>
    <!-- @slot Shows validation errors related to input. -->
    <slot name="validationError">
      <FrValidationError
        :validator-errors="errorMessages"
        :field-name="fieldName" />
    </slot>
    <small
      v-if="helpText"
      :id="`${id}_helpText`"
      class="form-text text-muted">
      {{ helpText }}
    </small>
  </div>
</template>

<script>
import {
  delay,
  bind,
  noop,
  has,
  map,
  find,
  isArray,
} from 'lodash';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList/';
import MultiSelect from 'vue-multiselect';
/**
 * Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page).
 * Adds in error display functionality below field in the form of the ValidationErrorList component.
 * */
export default {
  name: 'FloatingLabelInput',
  components: {
    FrValidationError: ValidationErrorList,
    MultiSelect,
  },
  props: {
    /**
     * Placeholder value.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Input type.
     */
    type: {
      type: String,
      default: '',
    },
    /**
     * Autofocus field.
     */
    autofocus: {
      type: String,
      default: '',
    },
    /**
     * Input name.
     */
    fieldName: {
      type: String,
      default: '',
    },
    /**
     * Function used to validate data.
     */
    validator: {
      type: Function,
      default: () => noop,
    },
    /**
     * Determines whether input should have text obfuscation (password).
     */
    reveal: {
      type: Boolean,
      default: false,
    },
    /**
     * List of errors related to input value.
     */
    failedPolicies: {
      type: [Array, Object],
      default: () => {},
    },
    /**
     * specifies the visible height of a text area, in lines.
     */
    rows: {
      type: Number,
      default: 5,
    },
    /**
     * specifies the visible width of a text area.
     */
    cols: {
      type: Number,
      default: 10,
    },
    /**
     * Function called after input value is changed.
     */
    callback: {
      type: Object,
      default: () => {},
      required: false,
    },
    /**
     * Options for select input.
     */
    selectOptions: {
      type: [Array, Object],
      default: () => [],
      required: false,
    },
    /**
     * Related text that displays underneath field.
     */
    helpText: {
      type: String,
      default: '',
    },
    /**
     * if field should be disabled.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Binding to v-model
     */
    value: {
      type: [Object, String, Array, Number],
      default: '',
    },
  },
  data() {
    return {
      inputValue: '',
      id: null,
      floatLabels: false,
      hideLabel: true,
      inputType: this.type,
      showPassword: false,
      errorMessages: [],
    };
  },
  computed: {
    multiselectOptions() {
      if (this.selectOptions.length && has(this.selectOptions[0], 'value')) {
        return this.selectOptions;
      }

      return map(this.selectOptions, (option) => {
        const retVal = {
          text: option,
          value: option,
        };

        return retVal;
      });
    },
  },
  beforeMount() {
    // eslint-disable-next-line no-underscore-dangle
    this.id = `floatingLabelInput${this._uid}`;
  },
  mounted() {
    delay(bind(() => {
      if (navigator.userAgent.includes('Edge')) {
        const element = document.getElementById(`${this.id}`);
        if (element && element.value.length && this.label) {
          this.floatLabels = true;
          this.inputValue = element.value;
        }
      } else if (navigator.userAgent.includes('Chrome')) {
        if (document.querySelectorAll(`#${this.id}:-webkit-autofill`).length > 0 && this.label) {
          this.floatLabels = true;
        }
      }
      this.hideLabel = false;
    }, this), 400);

    this.setInputValue(this.value);

    if (this.failedPolicies) {
      this.errorMessages = this.failedPolicies;
    }

    // Browser consistent focus fix
    if (this.autofocus === 'true') {
      this.$refs.input.focus();
    }
  },
  methods: {
    revealText() {
      this.showPassword = !this.showPassword;
    },
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null) {
        if (this.inputType === 'select') {
          this.inputValue = find(this.multiselectOptions, { value: newVal.toString() });
        } else if (this.inputType === 'multiselect') {
          this.inputValue = map(newVal, (val) => find(this.multiselectOptions, { value: val.toString() }));
        } else {
          this.inputValue = newVal.toString();
        }
      }
    },
  },
  watch: {
    inputValue(newVal) {
      if (newVal !== undefined) {
        this.floatLabels = newVal.length > 0 && this.label;
        if (isArray(newVal)) {
          this.floatLabels = newVal.length > 0 && this.label;
          this.$emit('input', map(newVal, 'value'));
        } else if (newVal === null) {
          this.floatLabels = false;
          this.$emit('input', '');
        } else if (this.inputType === 'select') {
          this.floatLabels = newVal.value.length > 0 && this.label;
          this.$emit('input', newVal.value);
        } else if (this.inputType === 'number') {
          this.$emit('input', parseInt(newVal, 10));
        } else {
          this.$emit('input', newVal);
        }
        if (this.callback && this.callback.setInputValue) {
          this.callback.setInputValue(newVal);
        }
      }
    },
    value(newVal) {
      if (!this.inputValue) {
        this.setInputValue(newVal);
      }
    },
    failedPolicies(newVal) {
      if (newVal) {
        this.errorMessages = newVal;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.form-label-password.form-label-group {
  display: flex;

  .form-control {
    flex-grow: 1;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  .input-group-append {
    flex-grow: 1;

    button {
      padding: 8px 14px;
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
      background-color: $input-bg;
      border-color: $input-border-color;
      color: $input-btn-color;

      .material-icons {
        vertical-align: middle;
      }
    }

    button:hover {
      color: $input-btn-active-color;
    }
  }
}

.form-label-group {
  position: relative;
  margin-bottom: 1rem;
}

//-->
// Bootstrap Floating Labels
// https://getbootstrap.com/docs/4.0/examples/floating-labels/
//-->
.form-label-group > input,
.form-label-group > .input-group > input {
  padding: $input-btn-padding-y;
  text-align: left;
}

.form-label-group > label,
.form-label-group > .input-group > label {
  padding: $input-btn-padding-y;
  text-align: left;
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  margin-bottom: 0; /* Override default `<label>` margin */
  line-height: 1.5;
  color: $label-color;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  transition: all 0.1s ease-in-out;
}

.form-label-group input::placeholder {
  color: transparent;
}

.form-label-group .polyfill-placeholder {
  padding-top: $input-btn-padding-y + $input-btn-padding-y * (2 / 3);
  padding-bottom: $input-btn-padding-y / 3;
  color: $input-color;

  ~ label {
    padding-top: $input-btn-padding-y / 3;
    padding-bottom: 0;
    font-size: 12px;
    color: $label-color;
  }
}

.form-label-group .white-label-background ~ label {
  background-color: $fr-toolbar-background;
  width: calc(100% - 20px);
  margin: 1px;
}

.form-control.is-invalid {
  background-image: none;
}

select,
select.custom-select {
  padding-top: $input-btn-padding-y + $input-btn-padding-y * (2 / 3);
  padding-bottom: $input-btn-padding-y / 3;
  color: $input-color;
}

select,
select.custom-select ~ label {
  padding-top: $input-btn-padding-y / 3;
  padding-bottom: $input-btn-padding-y / 3;
  font-size: 12px;
  color: $label-color;
}

/deep/ {
  .no-pointer-events {
    pointer-events: none;
  }

  .multiselect__tag,
  .multiselect__option--highlight {
    background-color: $light-blue;
    color: #35495e;
    line-height: 1;
  }

  .multiselect__content-wrapper {
    border: 1px solid #e8e8e8;
  }

  .multiselect__tags {
    height: 100%;
    padding: 1.5rem 50px 0 0.75rem;
    font-size: 0.875rem;
    border: none;

    .multiselect__placeholder {
      font-size: 1rem;
      color: $gray-600;
      padding-top: 0;
    }

    .multiselect__tag-icon::after {
      color: $gray-700;
    }

    .multiselect__tag-icon:hover {
      background-color: $light-blue;
    }
  }

  .no-multiselect-label .multiselect__tags {
    padding-top: 1rem !important;
  }

  .multiselect__select {
    width: 50px;
    height: 48px;
    right: 1px;
    padding: 4px 8px;
  }
  // disabled stylings
  .multiselect--disabled {
    opacity: 1;

    .multiselect__single,
    .multiselect__select,
    .multiselect__tags {
      background-color: #f6f8fa;
    }
  }

  .multiselect ~ label {
    width: calc(100% - 40px) !important;
  }

  .multiselect__tag {
    margin-top: 0.25rem;
  }

  .multiselect.multiselect--active ~ label {
    z-index: 51;
  }

  span.multiselect__single {
    margin-left: -5px;
  }
  /* stylelint-disable */
  .multiselect__option--selected {
    background: $light-blue;
    color: inherit;
    font-weight: inherit;
  }

  .multiselect__option--selected::after,
  .multiselect__option.multiselect__option--selected.multiselect__option--highlight::after {
    content: 'done';
    font-family: 'Material Icons Outlined';
    font-weight: normal;
    font-style: normal;
    line-height: 44px;
    font-size: 16px;
    height: 44px;
    color: $success;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }

  .multiselect__option.multiselect__option--selected.multiselect__option--highlight,
  .multiselect__option.multiselect__option--selected.multiselect__option--highlight::after {
    background: $light-blue;
    color: inherit;
  }

  .multiselect__option.multiselect__option--selected.multiselect__option--highlight::after {
    color: $success;
  }

  .multiselect__option.multiselect__option--selected.multiselect__option--highlight::after {
    height: 16px;
  }
  /* stylelint-enable */
}
</style>
