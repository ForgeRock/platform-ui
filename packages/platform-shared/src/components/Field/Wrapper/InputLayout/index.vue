<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationProvider
    v-slot="validationObject"
    mode="aggressive"
    :bails="false"
    :immediate="validationImmediate"
    :name="name"
    :ref="name"
    :rules="validation"
    :vid="name">
    <div class="w-100">
      <div
        :class="[{'fr-field-error': errors.concat(validationObject.errors).length}, 'form-label-group']"
        ref="floatingLabelGroup">
        <!-- @slot Prepend buttons or elements to the input. -->
        <slot name="prepend" />
        <div class="form-label-group-input">
          <slot />
          <label
            v-if="label && isHtml"
            v-html="label"
            :for="id"
            class="pe-none overflow-hidden text-nowrap full-width" />
          <label
            v-else-if="label"
            :for="id"
            class="pe-none overflow-hidden text-nowrap">
            {{ getTranslation(label) }}
          </label>
        </div>
        <slot name="defaultButtons" />
        <!-- slot appends buttons or elements to the input -->
        <slot name="append" />
      </div>
      <div
        v-if="showLengthCount"
        class="d-flex">
        <!-- slot shows validation errors related to input -->
        <FrValidationError
          class="error-messages flex-grow-1"
          :validator-errors="errors.concat(validationObject.errors)"
          :field-name="name" />
        <small :class="[{'text-danger': currentLength > maxLength}, 'form-text float-right']">
          {{ `${currentLength} / ${maxLength}` }}
        </small>
      </div>
      <!-- slot shows validation errors related to input -->
      <FrValidationError
        v-else
        class="error-messages"
        :validator-errors="errors.concat(validationObject.errors)"
        :field-name="name" />
      <template v-if="description">
        <small
          v-if="isHtml"
          :id="`${id}_helpText`"
          v-html="description"
          class="form-text text-muted" />
        <small
          v-else
          :id="`${id}_helpText`"
          class="form-text text-muted">
          {{ getTranslation(description) }}
        </small>
      </template>
    </div>
  </ValidationProvider>
</template>
<script>
import { ValidationProvider } from 'vee-validate';
import FrValidationError from '@forgerock/platform-shared/src/components/ValidationErrorList';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
/**
 * Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page).
 */
export default {
  name: 'InputLayout',
  mixins: [
    TranslationMixin,
  ],
  components: {
    FrValidationError,
    ValidationProvider,
  },
  props: {
    /**
     * Unique id.
     */
    id: {
      type: String,
      default: '',
    },
    errors: {
      type: Array,
      default: () => [],
    },
    /**
     * Input name.
     */
    name: {
      type: String,
      default: '',
    },
    /**
     * Related text that displays underneath field.
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * Boolean to render label and help text as html.
     */
    isHtml: {
      type: Boolean,
      default: false,
    },
    /**
     * Placeholder value.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Vee-validate validation types to check against
     */
    validation: {
      type: [String, Object],
      default: '',
    },
    /**
     * Whether error validation should happen when this component renders
     */
    validationImmediate: {
      type: Boolean,
      default: false,
    },
    /**
     * Specifies whether to show an input length count under the input
     */
    showLengthCount: {
      type: Boolean,
      default: false,
    },
    /**
     * Specifies the current length to show in the input count
     */
    currentLength: {
      type: Number,
      default: 0,
    },
    /**
     * Specifies the max length to show in the input count
     */
    maxLength: {
      type: Number,
      default: 500,
    },
  },
};
</script>

<style lang="scss" scoped>

::v-deep .form-label-group {
  position: relative;
  display: flex;

  &.fr-field-error {
    margin-bottom: 0 !important;
    border: none !important;

    input:not(.multiselect__input):not(.fr-tag-input),
    textarea,
    button:not(.btn-sm),
    .multiselect,
    .b-form-tags {
      border: 1px solid $danger;
    }

    button:not(.btn-sm) {
      border-left: none;
      border-radius: 0 !important;
    }
  }

  .form-label-group-input {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    min-width: 80px;

    /* stylelint-disable */
    .polyfill-placeholder,
    input:focus,
    input:not(:placeholder-shown) {
      padding-top: $input-btn-padding-y + $input-btn-padding-y * calc(2 / 3);
      padding-bottom: calc($input-btn-padding-y / 3);

      ~ label {
        padding-top: calc($input-btn-padding-y / 3);
        padding-bottom: 0;
        font-size: 12px;
      }
    }
    /* stylelint-enable */

    label {
      padding: $input-btn-padding-y;
      max-height: calc(100% - 2px);
      text-align: left;
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      margin-bottom: 0; /* Override default `<label>` margin */
      line-height: 1.5;
      color: $label-color;
      border: 1px solid transparent;
      pointer-events: none;
      border-radius: 0.25rem;
      transition: all 0.1s ease-in-out;
      width: calc(100% - 40px);

      .pe-none {
        pointer-events: none;
      }
    }

    .white-label-background ~ label {
      background-color: $fr-toolbar-background;
      margin: 1px;
    }

    .form-control {
      box-shadow: none;
    }
  }

  button {
    background-color: $input-bg;
    border-color: $input-border-color;
    color: $input-btn-color;

    &:active {
      background-color: $input-bg !important;
      border-color: $input-border-color !important;
    }

    &:hover {
      background-color: #dde5ec;
      color: $input-btn-active-color;
    }

    .material-icons {
      vertical-align: middle;
    }
  }

  textarea::placeholder,
  input::placeholder {
    color: transparent;
  }

  .multiselect--active input::placeholder {
    color: initial;
  }

  .input-group-prepend > *,
  .form-label-group-input > *,
  .input-group-append > * {
    border-radius: 0.25rem;
  }

  .input-group-append > *,
  .input-group-prepend:not(:first-child) > *,
  .form-label-group-input:not(:first-child) > * {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .input-group-prepend > *,
  .form-label-group-input:not(:last-child) > *,
  .input-group-append:not(:last-child) > * {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .input-group-prepend ~ .form-label-group-input input {
    border-left: none;
  }
}

.btn.disabled {
  background-color: $input-disabled-bg !important;
  border-left: 1px solid $input-disabled-bg;
  cursor: default;
  opacity: 1;

  &:hover {
    color: $input-btn-color;
    pointer-events: none;
  }
}
</style>
