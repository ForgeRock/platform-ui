<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="w-100">
    <div
      :class="[{'form-label-password': reveal}, 'form-label-group', 'mb-0']"
      ref="floatingLabelGroup">
      <!-- @slot Prepend buttons or elements to the input. -->
      <slot name="prepend" />
      <div class="form-label-group-input">
        <slot />
        <label
          v-if="label && isHtml"
          v-html="label"
          :hidden="hideLabel"
          :for="id"
          class="no-pointer-events" />
        <label
          v-else-if="label"
          :hidden="hideLabel"
          :for="id"
          class="no-pointer-events">
          {{ label }}
        </label>
      </div>
      <slot name="revealButton" />
      <!-- @slot Append buttons or elements to the input. -->
      <slot name="append" />
    </div>
    <!-- @slot Shows validation errors related to input. -->
    <small
      v-if="helpText && isHtml"
      :id="`${id}_helpText`"
      v-html="helpText"
      class="form-text text-muted" />
    <small
      v-if="helpText"
      :id="`${id}_helpText`"
      class="form-text text-muted">
      {{ helpText }}
    </small>
  </div>
</template>
<script>
/**
 * Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page).
 * */
export default {
  name: 'InputLayout',
  props: {
    /**
     * Unique id.
     */
    id: {
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
     * Related text that displays underneath field.
     */
    helpText: {
      type: String,
      default: '',
    },
    /**
     * Hide placeholder value.
     */
    hideLabel: {
      type: Boolean,
      default: false,
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
  },
  data() {
    return {};
  },
  computed: {
    reveal() {
      return !!(this.$slots.revealButton || [])[0];
    },
  },
};
</script>

<style lang="scss" scoped>
.form-label-group {
  position: relative;
  margin-bottom: 1rem;
  display: flex;

  > .form-label-group-input {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    margin-bottom: 0;
  }

  button {
    background-color: $input-bg;
    border-color: $input-border-color;
    color: $input-btn-color;

    .material-icons {
      vertical-align: middle;
    }

    &:hover {
      color: $input-btn-active-color;
      background-color: $gray-100;
    }
  }

  .input-group-prepend > *,
  .form-label-group-input > *,
  .input-group-append > * {
    border-radius: 0.25rem;
  }

  .input-group-prepend:not(:first-child) > *,
  .form-label-group-input:not(:first-child) > *,
  .input-group-append > * {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .input-group-prepend > *,
  .form-label-group-input:not(:last-child) > *,
  .input-group-append:not(:last-child) > * {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .input-group-text {
    padding-left: $btn-padding-x;
    padding-right: $btn-padding-x;
  }
}

//-->
// Bootstrap Floating Labels
// https://getbootstrap.com/docs/4.0/examples/floating-labels/
//-->

.form-label-group-input > label {
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
  pointer-events: none;
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

.btn.disabled {
  background-color: $gray-100 !important;
  cursor: default;
}
</style>
