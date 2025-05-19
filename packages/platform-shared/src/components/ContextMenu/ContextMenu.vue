<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="dropdown-menu position-fixed d-block"
    :style="`top: ${y}px; left: ${x}px`">
    <template
      v-for="(item, index) in menuItems"
      :key="index">
      <BDropdownDivider v-if="item.divider" />
      <BDropdownItem
        v-else
        @click="$emit(item.event, item)">
        <FrIcon
          icon-class="mr-2"
          :name="item.icon">
          {{ item.label }}
        </FrIcon>
      </BDropdownItem>
    </template>
  </div>
</template>

<script setup>
/**
  * Manages showing a panel containing provided buttons/actions.
  */
import { onBeforeUnmount } from 'vue';
import { BDropdownDivider, BDropdownItem } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

defineProps({
  menuItems: {
    type: Array,
    default: () => [{ event: 'delete', icon: 'delete', label: i18n.global.t('common.delete') }],
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close']);

function closeContextMenuOnBlur() {
  emit('close');
}

function closeContextMenuOnEscape(event) {
  if (event.code === 'Escape') {
    emit('close');
  }
}

window.addEventListener('click', closeContextMenuOnBlur);
window.addEventListener('keydown', closeContextMenuOnEscape);

onBeforeUnmount(() => {
  window.removeEventListener('click', closeContextMenuOnBlur);
  window.removeEventListener('keydown', closeContextMenuOnEscape);
});
</script>
