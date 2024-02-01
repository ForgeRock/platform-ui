<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrBasicInput
    v-bind="$attrs"
    type="string"
    :value="valueToDisplay"
    readonly>
    <template
      #append
      v-if="showClearField">
      <BInputGroupAppend>
        <BButton
          @click="clearField"
          class="clear-btn"
          :aria-label="$t('common.clear')">
          <FrIcon
            name="close"
          />
        </BButton>
      </BInputGroupAppend>
    </template>
  </FrBasicInput>
</template>

<script>
import { getPlaceholderValueToDisplay } from '@forgerock/platform-shared/src/utils/esvUtils';
import FrBasicInput from '@forgerock/platform-shared/src/components/Field/BasicInput';
import { BButton, BInputGroupAppend } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * Input for displaying ESV placeholder values. The values are shown as a readonly string, with a button to clear the placeholder so a new value can be set.
 */
export default {
  name: 'ReadonlyPlaceholderInput',
  components: {
    FrBasicInput,
    FrIcon,
    BButton,
    BInputGroupAppend,
  },
  props: {
    value: {
      type: [Array, Object, Number, String, Boolean],
      default: '',
    },
  },
  inject: {
    showClearField: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      valueToDisplay: getPlaceholderValueToDisplay(this.value),
    };
  },
  methods: {
    /**
    * Resets the field and clears its placeholder value
    */
    clearField() {
      this.$emit('input', '');
    },
  },
};
</script>

<style lang="scss" scoped>
  .clear-btn {
    border-left: none;
    background-color: $gray-100 !important;
  }

  .form-label-group:focus-within {
   .input-buttons:not(:focus-within) .input-group-append .btn {
        border-color: $primary !important;
        clip-path: inset(-1px -1px -1px 0px) !important;
        box-shadow: 0 0 0 0.0625rem $primary !important;
   }
 }
</style>
