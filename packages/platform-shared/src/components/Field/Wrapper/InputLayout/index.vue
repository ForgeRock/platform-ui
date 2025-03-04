<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="w-100">
    <div
      :class="[{'fr-field-error': errors.length, 'floating-label': floatingLabel}, 'form-label-group']">
      <!-- @slot Prepend buttons or elements to the input. -->
      <slot name="prepend" />
      <div
        v-if="floatingLabel"
        class="form-label-group-input">
        <label
          v-if="label && isHtml"
          v-html="labelTranslation"
          ref="inputLabel"
          :id="labelId"
          :for="id"
          :class="['pe-none full-width', {'overflow-hidden text-nowrap': !labelHeight, 'readonly-label': readonlyLabel}]" />
        <label
          v-else-if="label"
          ref="inputLabel"
          :id="labelId"
          :for="id"
          :class="['pe-none', {'overflow-hidden text-nowrap': !labelHeight, 'readonly-label': readonlyLabel}]">
          {{ labelTranslation }}
        </label>
        <slot :label-height="labelHeight" />
      </div>
      <div
        v-else
        class="form-label-group-input">
        <label
          v-if="label && isHtml"
          v-html="labelTranslation"
          :id="labelId"
          :for="id"
          class="pe-none overflow-hidden text-nowrap full-width" />
        <label
          v-else-if="label"
          :id="labelId"
          :for="id"
          class="pe-none overflow-hidden text-nowrap">
          {{ labelTranslation }}
        </label>
        <slot />
      </div>
      <span
        class="d-flex input-buttons"
        v-if="$slots.prependButton || $slots.defaultButtons || $slots.append">
        <div
          class="prepend-button"
          v-if="$slots.prependButton">
          <slot name="prependButton" />
        </div>
        <slot name="defaultButtons" />
        <!-- slot appends  buttons or elements to the input -->
        <slot name="append" />
      </span>
    </div>
    <div
      v-if="showLengthCount"
      class="d-flex">
      <!-- slot shows validation errors related to input -->
      <FrValidationError
        class="error-messages flex-grow-1"
        :validator-errors="errors"
        :field-name="name" />
      <small :class="[{'text-danger': currentLength > maxLength}, 'form-text float-right']">
        {{ `${currentLength} / ${maxLength}` }}
      </small>
    </div>
    <!-- slot shows validation errors related to input -->
    <FrValidationError
      v-else
      class="error-messages"
      :validator-errors="errors"
      :field-name="name" />
    <template v-if="description">
      <small
        v-if="isHtml"
        :id="`${id}_helpText`"
        v-html="descriptionTranslation"
        class="form-text text-muted" />
      <small
        v-else
        :id="`${id}_helpText`"
        class="form-text text-muted">
        {{ descriptionTranslation }}
      </small>
    </template>
  </div>
</template>
<script>
import FrValidationError from '@forgerock/platform-shared/src/components/ValidationErrorList';
import { getTranslation } from '@forgerock/platform-shared/src/utils/translations';
// eslint-disable-next-line import/extensions
import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';

/**
 * Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page).
 */
export default {
  name: 'InputLayout',
  components: {
    FrValidationError,
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
     * Boolean to show a floating label or above label on controls
     */
    floatingLabel: {
      type: Boolean,
      default: true,
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
     * Boolean to apply readonly styles to labels.
     */
    readonlyLabel: {
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
  data() {
    return {
      labelId: `${this.id}-label`, // stores the label id
    };
  },
  setup() {
    // The "useElementSize" composable establishes an observer on the "inputLabel" element to monitor its size changes, specifically we are interested on the height.
    // The observed height information is then forwarded as a "slot prop" to components that are utilizing this layout component, particularly those with floating labels.
    // For example, within the "BasicInput" component, this height is used for calculate the height of the input field element.
    const inputLabel = ref(null);
    const { height: labelHeight } = useElementSize(inputLabel, { height: 0 }, { box: 'border-box' });

    return {
      inputLabel,
      labelHeight,
    };
  },
  computed: {
    labelTranslation() {
      return getTranslation(this.label);
    },
    descriptionTranslation() {
      return getTranslation(this.description);
    },
  },
};
</script>

<style lang="scss" scoped>

:deep(.form-label-group) {
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
      border-color: $danger !important;
      border: 1px solid $danger;
    }

    button:not(.btn-sm) {
      border-left: none;
      border-radius: 0 !important;
    }
  }

  &.floating-label {
    label {
      z-index: 1;
      padding: $input-btn-padding-y;
      position: absolute;
      top: 0;
      left: 0;
      margin-bottom: 0; /* Override default `<label>` margin */
      border: 1px solid transparent;
      border-radius: 0.25rem;
      pointer-events: none;
      transform-origin: 0 0;
      transition: transform .1s ease-in-out;
      width: unset;
      max-height: none;
      display: inline-block;
      background-color: transparent;

      .pe-none {
        pointer-events: none;
      }
    }

    label:has(~ textarea) {
      transform: none !important;
      right: 0;
      transition: font-size 0.1s ease, padding 0.1s ease;
      margin: 1px 0.75rem 1px 1px;
      padding-right: 0;
      padding-bottom: 3px;
      background-color: white;
    }

    textarea::placeholder,
    input::placeholder,
    .multiselect__placeholder {
      color: transparent !important;
    }

    label:has(~ .multiselect--disabled) {
      background-color: transparent !important;
    }

    label:has(~ .multiselect--active) {
      z-index: 51;
    }
  }
  .form-label-group-input {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    min-width: 80px;

    /* stylelint-disable */
    .polyfill-placeholder,
    input:not(:placeholder-shown)
    input:focus,
    input:autofill {

      /*
       * if there is no placeholder, we do not need to apply padding to move
       * the users input below the placeholder/label
      */
      &:not([placeholder=""]) {
        padding-top: $input-btn-padding-y + $input-btn-padding-y * calc(2 / 3);
        padding-bottom: calc($input-btn-padding-y / 3);
      }
    }

    label:has(~ .polyfill-placeholder,
      ~ input:not(:placeholder-shown) input:focus,
      ~ input:autofill) {
        &:not([placeholder=""]) {
          transform: scale(.85) translateY(-0.5rem) translateX(0.15rem);
        }
    }

    label:has(~ textarea.polyfill-placeholder:not([placeholder=""])) {
      transition: font-size 0.1s ease, padding 0.1s ease;
      font-size: 13px;
      padding-top: 3px;
      padding-left: 10px;
    }

    textarea.polyfill-placeholder {
      &:not([placeholder=""]) {
        padding-top: 1.50rem;
        padding-bottom: 0;
      }
    }
    /* stylelint-enable */

    label {
      text-align: left;
      display: block;
      line-height: 1.5;
      color: $label-color;
    }

    label:has(~ .white-label-background) {
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

.readonly-label {
  background: #f6f8fa !important;
}
</style>
