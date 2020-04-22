<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BFormTimepicker
    v-bind="$attrs"
    v-on="$listeners"
    menu-class="shadow-lg"
    no-close-button
    :class="{'input-has-value': value}"
    :label-selected="placeholder"
    :placeholder="placeholder"
    :value="value">
    <template #button-content>
      <i class="material-icons-outlined">
        access_time
      </i>
    </template>
  </BFormTimepicker>
</template>

<script>
import {
  BFormTimepicker,
} from 'bootstrap-vue';

/**
 * Bootstrap timepicker with custom icons, default values set.
 * v-model value returns 'hh:mm:ss'.
 */
export default {
  name: 'Timepicker',
  components: {
    BFormTimepicker,
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

.dropdown {
  padding: 0;
}
</style>
