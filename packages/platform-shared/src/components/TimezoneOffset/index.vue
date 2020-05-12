<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BDropdown
      class="timezone-dropdown w-100"
      menu-class="shadow-lg"
      no-caret
      toggle-class="p-0"
      variant="none">
      <template #button-content>
        <FrField
          class="timezone-field"
          :field="timezone">
          <template #prepend>
            <BInputGroupPrepend>
              <div class="input-group-text inset">
                <i class="material-icons-outlined">
                  location_on
                </i>
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
      {{ $t('timezone.helpText') }}
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

/**
 * Input that allows user to select a timezone offset. Uses BInput with type range.
 * Display values are filtered to a user friendly string, but v-model value is a number.
 */
export default {
  name: 'TimezoneOffset',
  components: {
    BDropdown,
    BFormInput,
    BInputGroupPrepend,
    FrField,
    BLink,
  },
  props: {
    /**
     * v-model value. A string 'GMT +/- hh:mm' representing offset from GMT
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
      timezone: {
        type: 'string',
        value: this.$options.filters.offsetString(this.value),
        title: this.placeholder,
      },
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
      this.timezone.value = this.$options.filters.offsetString(newVal);
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
  /deep/ .dropdown-menu.show {
    min-width: 300px;
    padding: 0.5rem;
  }
}

.timezone-field {
  /deep/ .form-label-group-input {
    margin-left: -10px;

    /deep/ input {
      border-left: none !important;
    }
  }
}
</style>
