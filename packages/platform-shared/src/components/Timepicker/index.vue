<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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
      <FrIcon
        name="access_time"
      />
    </template>
  </BFormTimepicker>
</template>

<script>
import {
  BFormTimepicker,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * Bootstrap timepicker with custom icons, default values set.
 */
export default {
  name: 'Timepicker',
  components: {
    BFormTimepicker,
    FrIcon,
  },
  props: {
    /**
     * @model String representation of time 'hh:mm:ss'
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
  ::v-deep label {
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
