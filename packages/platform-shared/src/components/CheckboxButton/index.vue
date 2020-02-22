<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <div
    class="btn-group-toggle d-inline-block">
    <label
      class="btn btn-outline-secondary"
      :class="{active: checked}">
      <input
        type="checkbox"
        v-model="checked"
      >
      <!-- @slot Button content. -->
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: 'CheckboxButton',
  props: {
    /**
     * Default checked value for the button.
     */
    defaultChecked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      checked: this.defaultChecked,
    };
  },
  watch: {
    checked(value) {
      /**
       * Change event with boolean state payload.
       *
       * @event change
       * @property {boolean} value boolean state of checkbox button
       */
      this.$emit('change', value);
    },
  },
};
</script>

<style lang="scss" scoped>

.btn-group-toggle {
  > .btn,
  > .btn-group > .btn {
    position: relative;
    padding-left: 3rem;
    border-color: $input-border-color;

    &:hover,
    &:focus {
      background-color: $gray-100;
      color: $input-color;
    }

    &::before {
      position: absolute;
      top: 33.333%;
      left: $btn-padding-x;
      width: 1rem;
      height: 1rem;
      pointer-events: none;
      content: '';
      background-color: $white;

      @include border-radius($custom-checkbox-indicator-border-radius);

      border: $gray-400 solid 1px;
      vertical-align: middle;
      margin-right: 0.5rem;
    }

    &::after {
      position: absolute;
      top: 33.333%;
      left: $btn-padding-x;
      width: 1rem;
      height: 1rem;
      content: '';
      background: no-repeat 50% / 50% 50%;
      vertical-align: middle;
      margin-right: 0.5rem;
    }

    &:not(:disabled):not(.disabled):active,
    &:not(:disabled):not(.disabled).active {
      border-color: $input-focus-border-color;
      background-color: lighten($primary, 45%);
      color: $input-color;

      &::before {
        color: $white;
        border-color: $primary;
        background-color: $primary;
      }

      &::after {
        background-image: $custom-checkbox-indicator-icon-checked;
      }

      &:hover,
      &:focus {
        background-color: lighten($primary, 40%);
      }
    }
  }
}
</style>
