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

      <select
        v-else-if="inputType === 'select'"
        ref="input"
        :id="id"
        :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control custom-select']"
        v-model="inputValue"
        :name="fieldName"
        :disabled="disabled">
        <option
          v-for="option in selectOptions"
          :key="option.value"
          :value="option.value">
          {{ option.text }}
        </option>
      </select>
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

      <label
        :hidden="hideLabel"
        :for="id">
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
} from 'lodash';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList/';
/**
 * Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page).
 * Adds in error display functionality below field in the form of the ValidationErrorList component.
 * */
export default {
  name: 'FloatingLabelInput',
  components: {
    FrValidationError: ValidationErrorList,
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
     * Value field will start with.
     */
    defaultValue: {
      type: String,
      default: '',
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
      default: () => {},
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

    if (this.defaultValue) {
      this.inputValue = this.defaultValue;
    }

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
  },
  watch: {
    inputValue(newVal) {
      this.floatLabels = newVal.length > 0 && this.label;
      if (this.inputType === 'number') {
        this.$emit('input', parseInt(newVal, 10));
      } else {
        this.$emit('input', newVal);
      }
      if (this.callback && this.callback.setInputValue) {
        this.callback.setInputValue(newVal);
      }
    },
    defaultValue(newVal) {
      if (newVal) {
        this.inputValue = newVal;
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
</style>
