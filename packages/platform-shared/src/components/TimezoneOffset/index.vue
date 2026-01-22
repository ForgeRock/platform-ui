<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div ref="timezoneTarget">
      <FrField
        class="timezone-field"
        v-bind="$attrs"
        v-model="timezone"
        :label="placeholder"
        :name="`timezoneOffset_${_uid}`"
        readonly>
        <template #prepend>
          <BInputGroupPrepend>
            <div :class="[{'disabled': $attrs.disabled}, 'input-group-text inset']">
              <FrIcon
                ref="inputPrependIcon"
                icon-class="btn"
                name="location_on"
                tabindex="-1" />
            </div>
          </BInputGroupPrepend>
        </template>
      </FrField>
    </div>
    <BPopover
      class="timezone-dropdown w-100"
      custom-class="timezone-popover"
      :offset="-225"
      v-bind="$attrs"
      placement="bottomleft"
      :target="getTargetElement"
      triggers="click blur"
      v-model:show="popoverShow"
      @shown="onPopoverShown"
      @hidden="onPopoverHidden">
      <output class="timezone-output form-control form-control-sm text-center">
        {{ offsetString }}
      </output>
      <div class="pt-3 pb-0">
        <div class="marker" />
        <BFormInput
          ref="rangeInput"
          v-model="offset"
          type="range"
          min="-12"
          max="14"
          step="0.25" />
      </div>
      <div class="d-flex justify-content-between">
        <span>
          <small>-12</small>
        </span>
        <span>
          <small>+14</small>
        </span>
      </div>
    </BPopover>
    <BFormText v-if="displayHelpText">
      {{ $t('timezone.description') }}
      <BLink
        href="https://www.timeanddate.com/time/zones/"
        target="_blank">
        {{ $t('timezone.linkText') }}
      </BLink>
    </BFormText>
  </div>
</template>

<script>
import {
  BFormInput,
  BFormText,
  BInputGroupPrepend,
  BLink,
  BPopover,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * Input that allows user to select a timezone offset. Uses BInput with type range.
 * Display values are filtered to a user friendly string, but v-model value is a number.
 * Example string: 'GMT +/- hh:mm'
 */
export default {
  name: 'TimezoneOffset',
  components: {
    BFormInput,
    BFormText,
    BInputGroupPrepend,
    FrField,
    FrIcon,
    BLink,
    BPopover,
  },
  props: {
    displayHelpText: {
      type: Boolean,
      default: true,
    },
    /**
     * @model Number representation of offset
     */
    value: {
      type: Number,
      default: 0,
    },
    /**
     * Text label. Floats when a value is selected.
     */
    placeholder: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      offset: this.value,
      popoverShow: false,
      timezone: this.offsetToString(this.value),
    };
  },
  methods: {
    getTargetElement() {
      const element = this.$refs.timezoneTarget;
      return element?.$el || element;
    },
    /**
     * Converts numerical offset in hours to string 'GMT +/- hh:mm'
     * @param {Number} value offset from GMT in hours
     * @returns {String} offset from GMT
     */
    offsetToString(value) {
      const numberVal = parseFloat(value);
      const isPositive = numberVal >= 0;
      const hours = parseInt(Math.abs(numberVal), 10);
      let minutes = (Math.abs(numberVal) % 1) * 60;
      if (minutes < 10) {
        minutes = `0${minutes.toString()}`;
      }
      const timeString = isPositive ? `GMT + ${hours}:${minutes}` : `GMT - ${hours}:${minutes}`;
      return timeString;
    },
  },
  computed: {
    offsetString() {
      return this.offsetToString(this.offset);
    },
  },
  watch: {
    offset(newVal) {
      this.timezone = this.offsetToString(newVal);
      /**
       * triggered whenever the offset is changed.
       * @property {Number} newVal new offset value
       */
      this.$emit('input', Number(newVal));
    },
    value(newVal) {
      this.offset = newVal;
    },
  },
};
</script>
<style lang="scss" scoped>
// Styles to match with Bootstrap's date and time pickers inputs
.timezone-field {
  :first-child:focus-visible {
    outline: 0;
  }
  transition: border-color 0.15s ease-in-out,
  box-shadow 0.15s ease-in-out,
  border-radius 0.15s ease-in-out;
  &:focus-within {
    border: 1px solid $input-focus-border-color;
    box-shadow: 0 0 0 0.2rem rgba($input-focus-border-color, 0.25);
    border-radius: 0.3rem;
    outline: none;
    :deep(.form-label-group) {
      .input-group-prepend {
        outline-offset: 2px;
        outline: 2px solid $input-focus-border-color;
        border-radius: 0.3rem;
        z-index: 2;
      }
      .input-group-text {
        border-right: 0;
      }
    }
  }
  &:focus-visible {
    border: 1px solid $input-focus-border-color;
    box-shadow: 0 0 0 0.2rem rgba($input-focus-border-color, 0.25);
    border-radius: 0.3rem;
    outline: none;
    :deep(.form-label-group) {
      .input-group-prepend {
        outline-offset: 2px;
        outline: 2px solid $input-focus-border-color;
        border-radius: 0.3rem;
        z-index: 2;
      }
      .input-group-text {
        border-right: 0;
      }
    }
  }
  :deep(.form-control[readonly]) {
    background-color: $white;
    cursor: pointer;
    &:focus {
      border-color: $input-border-color;
      box-shadow: none;
    }
  }
  :deep(.form-control) {
    &:focus {
      border-color: $input-border-color;
      box-shadow: none;
    }
  }

  :deep(.form-label-group) {
    .input-group-prepend {
      margin-right: -5px;
      .input-group-text {
        padding: 0;
      }
    }
    .form-label-group-input {
      label {
        padding-left: 0.1rem;
      }
      input.form-control {
        padding-left: 0.25rem;
        &::selection {
          background-color: transparent; // prevent blue highlight
        }
      }
    }
  }
}

.input-group-prepend .disabled {
  background-color: $gray-100;
}
</style>
<style lang="scss">
.timezone-popover {
  min-width: 300px;
  padding: 0.5rem;
  .popover-body {
    padding: 0;
    .custom-range {
      &:focus-visible {
        outline: none;
      }
      &:focus {
        outline: 2px solid $input-focus-border-color;
        outline-offset: 1px;
      }
    }
  }
  .arrow {
    display: none;
  }
  &.bs-popover-bottom {
    margin-top: 1px !important;
  }
}
</style>
