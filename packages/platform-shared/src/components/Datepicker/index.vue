<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BFormDatepicker
    v-bind="$attrs"
    v-on="$listeners"
    hide-header
    label-help=""
    menu-class="shadow-lg"
    :class="{'input-has-value': value}"
    :label-selected="placeholder"
    :placeholder="placeholder"
    :value="value">
    <template #button-content>
      <i class="material-icons-outlined">
        calendar_today
      </i>
    </template>
    <template #nav-prev-year>
      <i class="material-icons-outlined">
        first_page
      </i>
    </template>
    <template #nav-prev-month>
      <i class="material-icons-outlined">
        chevron_left
      </i>
    </template>
    <template #nav-this-month>
      <i class="material-icons-outlined">
        calendar_today
      </i>
    </template>
    <template #nav-next-month>
      <i class="material-icons-outlined">
        chevron_right
      </i>
    </template>
    <template #nav-next-year>
      <i class="material-icons-outlined">
        last_page
      </i>
    </template>
  </BFormDatepicker>
</template>
<script>
import {
  BFormDatepicker,
} from 'bootstrap-vue';

/**
 * Bootstrap datepicker with custom icons, default values set.
 * v-model value returns 'YYYY-MM-DD'.
 */
export default {
  name: 'Datepicker',
  components: {
    BFormDatepicker,
  },
  props: {
    /**
     * v-model value
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * Text label. Floats when a value is selected.
     */
    placeholder: {
      type: String,
      default: '',
    },
  },
};
</script>
<style lang="scss" scoped>
// floating label support
.input-has-value {
  /deep/ label {
    padding-top: 1.25rem;
    padding-bottom: 0.25rem;
    position: relative;

    .sr-only {
      width: auto;
      height: auto;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      margin: 0;
      overflow: hidden;
      clip: auto;
      top: 0;
      left: 0.25rem;
      font-size: 12px;
      color: $gray-600;
    }
  }
}

// remove blue border of calendar grid
.b-form-datepicker {
  /deep/ .form-control {
    border: none;
    box-shadow: none;
    overflow: hidden;
  }
}

/deep/ .b-calendar-grid-help {
  border-top: none !important;
}

.dropdown {
  padding: 0;
}
</style>
