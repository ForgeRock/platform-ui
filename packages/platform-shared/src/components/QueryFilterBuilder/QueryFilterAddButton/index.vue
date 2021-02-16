<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    no-caret
    variant="outline-secondary"
    :disabled="disabled">
    <i
      class="material-icons-outlined"
      slot="button-content"
      aria-hidden="true">
      add
    </i>
    <BDropdownItem @click="$emit('add-rule', 'row')">
      {{ $t('queryFilterBuilder.addRuleButton') }}
    </BDropdownItem>
    <BDropdownItem
      v-if="!hideGroup"
      @click="$emit('add-rule', 'group')">
      {{ $t('queryFilterBuilder.addGroupButton') }}
    </BDropdownItem>
  </BDropdown>
</template>

<script>
import { BDropdown, BDropdownItem } from 'bootstrap-vue';

export default {
  name: 'AddButton',
  components: {
    BDropdown,
    BDropdownItem,
  },
  props: {
    hideGroup: {
      default: false,
      type: Boolean,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
