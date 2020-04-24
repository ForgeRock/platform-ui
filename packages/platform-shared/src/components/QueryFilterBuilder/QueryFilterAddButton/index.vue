<template>
  <BDropdown
    no-caret
    class="{context.data.staticClass}"
    text="Dropdown Button"
    variant="outline-secondary">
    <i
      class="material-icons-outlined"
      slot="button-content">
      add
    </i>
    <BDropdownItem @click="$emit('add-rule')">
      {{ $t('queryFilterBuilder.addRuleButton') }}
    </BDropdownItem>
    <BDropdownItem @click="$emit('add-group')">
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
      required: false,
      type: Boolean,
    },
  },
};
</script>
