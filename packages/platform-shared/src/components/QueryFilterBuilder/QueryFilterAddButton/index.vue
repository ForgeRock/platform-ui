<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    no-caret
    variant="outline-secondary"
    :disabled="disabled">
    <span class="sr-only">
      {{ $t('queryFilterBuilder.queryFilterAddDropDown') }}
    </span>
    <FrIcon
      slot="button-content"
      name="add"
    />
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
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'AddButton',
  components: {
    BDropdown,
    BDropdownItem,
    FrIcon,
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
