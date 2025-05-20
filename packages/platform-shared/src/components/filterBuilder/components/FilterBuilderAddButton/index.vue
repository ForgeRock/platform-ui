<!-- Copyright (c) 2022-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    class="hover-gray"
    no-caret
    variant="link"
    :disabled="disabled"
    @show="checkPreventDefault">
    <span class="sr-only">
      {{ $t('queryFilterBuilder.queryFilterAddDropDown') }}
    </span>
    <template #button-content>
      <FrIcon
        icon-class="text-dark md-24"
        name="add" />
    </template>
    <BDropdownItem @click="$emit('add-rule', 'row')">
      {{ addRuleText }}
    </BDropdownItem>
    <BDropdownItem @click="$emit('add-rule', 'group')">
      {{ $t('queryFilterBuilder.addGroupButton') }}
    </BDropdownItem>
  </BDropdown>
</template>

<script>
import { BDropdown, BDropdownItem } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

export default {
  name: 'FilterBuilderAddButton',
  components: {
    BDropdown,
    BDropdownItem,
    FrIcon,
  },
  props: {
    addRuleText: {
      type: String,
      default: i18n.global.t('queryFilterBuilder.addRuleButton'),
    },
    hideGroup: {
      default: false,
      type: Boolean,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    /**
     * Don't open dropdown if hideGroup is true
     * @param {Event} bvEvent bootstrap vue dropdown open event
     */
    checkPreventDefault(bvEvent) {
      if (this.hideGroup) {
        bvEvent.preventDefault();
        this.$emit('add-rule', 'row');
      }
    },
  },
};
</script>
