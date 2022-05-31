<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BDropdown
      class="timezone-dropdown w-100"
      menu-class="shadow-lg"
      no-caret
      toggle-class="p-0"
      variant="none"
      v-bind="$attrs">
      <template #button-content>
        <FrField
          v-bind="$attrs"
          v-model="timezone"
          class="timezone-field"
          :label="placeholder">
          <template #prepend>
            <BInputGroupPrepend>
              <div :class="[{'disabled': $attrs.disabled}, 'input-group-text inset']">
                <FrIcon
                  name="location_on"
                />
              </div>
            </BInputGroupPrepend>
          </template>
        </FrField>
      </template>
      <output class="timezone-output form-control form-control-sm text-center">
        {{ offset | offsetString }}
      </output>
      <div class="pt-3 pb-0">
        <div class="marker" />
        <BFormInput
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
    </BDropdown>
    <small class="form-text">
      {{ $t('timezone.description') }}
      <BLink
        href="https://www.timeanddate.com/time/zones/"
        target="_blank">
        {{ $t('timezone.linkText') }}
      </BLink>
    </small>
  </div>
</template>

<script>
import {
  BDropdown,
  BFormInput,
  BInputGroupPrepend,
  BLink,
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
    BDropdown,
    BFormInput,
    BInputGroupPrepend,
    FrField,
    FrIcon,
    BLink,
  },
  props: {
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
      timezone: this.$options.filters.offsetString(this.value),
    };
  },
  filters: {
    /**
     * Converts numerical offset in hours to string 'GMT +/- hh:mm'
     * @param {Number} value offset from GMT in hours
     * @returns {String} offset from GMT
     */
    offsetString(value) {
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
  watch: {
    offset(newVal) {
      this.timezone = this.$options.filters.offsetString(newVal);
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
.timezone-dropdown {
  ::v-deep .dropdown-menu.show {
    min-width: 300px;
    padding: 0.5rem;
  }
}

.timezone-field {
  ::v-deep .form-label-group-input {
    margin-left: -10px;

    ::v-deep input {
      border-left: none !important;
    }
  }
}

.input-group-prepend .disabled {
  background-color: $gray-100;
}
</style>
