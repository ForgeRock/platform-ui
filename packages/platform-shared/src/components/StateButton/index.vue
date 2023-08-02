<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    variant="outline-secondary">
    <template
      v-if="active"
      #button-content>
      <FrIcon
        class="mr-md-2 text-success"
        name="check_circle"
      />

      <span>{{ $t('common.active') }}</span>
    </template>
    <template
      v-else
      #button-content>
      <span>{{ $t('common.inactive') }}</span>
    </template>

    <template
      v-if="active">
      <BDropdownItem
        @click="changeState(false)"
      >
        <FrIcon
          class="mr-md-2"
          name="power_settings_new"
        />
        <span>{{ $t('common.deactivate') }}</span>
      </BDropdownItem>
    </template>
    <template
      v-else>
      <BDropdownItem
        @click="changeState(true)"
      >
        <FrIcon
          class="mr-md-2 text-success"
          name="check_circle"
        />
        <span>{{ $t('common.activate') }}</span>
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
