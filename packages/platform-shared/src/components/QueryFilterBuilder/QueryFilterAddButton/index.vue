<template>
  <BDropdown
    no-caret
    variant="outline-secondary"
    :disabled="disabled">
    <i
      class="material-icons-outlined"
      slot="button-content">
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
