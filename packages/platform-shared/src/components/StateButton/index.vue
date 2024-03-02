<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    variant="outline-secondary">
    <template
      v-if="active"
      #button-content>
      <FrIcon
        icon-class="mr-2 text-success"
        name="check_circle">
        {{ $t('common.active') }}
      </FrIcon>
    </template>
    <template
      v-else
      #button-content>
      <span>{{ $t('common.inactive') }}</span>
    </template>

    <template
      v-if="active">
      <BDropdownItem
        @click="changeState(false)">
        <FrIcon
          icon-class="mr-2"
          name="power_settings_new">
          {{ $t('common.deactivate') }}
        </FrIcon>
      </BDropdownItem>
    </template>
    <template
      v-else>
      <BDropdownItem @click="changeState(true)">
        <FrIcon
          icon-class="mr-2 text-success"
          name="check_circle">
          {{ $t('common.activate') }}
        </FrIcon>
      </BDropdownItem>
    </template>
  </BDropdown>
</template>

<script>
import {
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * A button with a dropdown used to toggle between active and inactive states
 * If state is active, dropdown item translation will be 'common.deactivate'
 * If inactive, dropdown item translation will be 'common.activate'
 */
export default {
  name: 'StateButton',
  components: {
    BDropdown,
    BDropdownItem,
    FrIcon,
  },
  props: {
    /**
     * The state.
     */
    active: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    /**
     * Emits the change event with the selected value
     */
    changeState(newValue) {
      /**
       * Triggered whenever an item is selected from the dropdown
       * @property {Boolean} newValue The new state value
       */
      this.$emit('change', newValue);
    },
  },
};
</script>
