<!-- Copyright (c) 2022-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot
      name="button"
      :show-modal="show"
      :open="open">
      <BButton
        :variant="columnOrganizerKey ? 'link' : 'outline-secondary'"
        :class="columnOrganizerKey ? 'text-dark' : ''"
        @click="open">
        <FrIcon
          icon-class="md-24"
          name="view_column" />
      </BButton>
    </slot>
    <slot name="modal">
      <FrColumnPicker
        v-bind="pickerProps"
        :available-columns="value"
        :modal-id="columnOrganizerKey"
        :title="modalTitle || $t('common.customizeObject', { object: $t('common.columns') })"
        @apply="onApply" />
    </slot>
  </div>
</template>

<script setup>
import { computed, defineOptions } from 'vue';
import { BButton } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrColumnPicker from '@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';

defineOptions({
  name: 'ListOrganizer',
});

/**
 * Component that displays a button which opens a modal allowing for the selection and reordering of items in a list.
 */
const props = defineProps({
  /**
   * Items to display in list. Each object needs to contain a key and enabled property
   */
  value: {
    type: Array,
    default: () => [],
  },
  /**
   * Title to display in the modal header
   */
  modalTitle: {
    type: String,
    default: '',
  },
  /**
   * Key for localStorage persistence
   */
  columnOrganizerKey: {
    type: String,
    default: '',
  },
  /**
   * If true, moves and reorders items on change
   */
  moveAndReorderItemOnchange: {
    type: Boolean,
    default: false,
  },
  /**
   * Default columns used by Reset to Default.
   */
  defaultColumns: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['list-updated']);

const {
  open,
  show,
  activeColumns,
  pickerProps: basePickerProps,
  loadColumns,
  syncWithOriginalList,
} = useColumnPicker(() => props.value, {
  storageKey: () => props.columnOrganizerKey,
  defaultColumns: () => props.defaultColumns,
});

const pickerProps = computed(() => ({
  ...basePickerProps.value,
  moveAndReorderItemOnchange: props.moveAndReorderItemOnchange,
}));

/**
 * Returns true if columnOrganizerKey prop has a truthy value and all columns are unchecked
 */
const allColumnsDisabled = computed(() => {
  if (props.columnOrganizerKey) {
    return activeColumns.value.length === 0;
  }
  return false;
});

/**
 * Handles the apply event from the column picker
 * @param {Array} newActiveColumns - the new set of active columns
 */
function onApply(newActiveColumns) {
  const fullList = syncWithOriginalList(newActiveColumns, props.value, {
    sortDisabledAlphabetically: props.moveAndReorderItemOnchange,
  });
  emit('list-updated', fullList);
}

/**
 * Resets the list to the stored values
 */
function resetList() {
  loadColumns();
}

defineExpose({
  allColumnsDisabled,
  resetList,
});
</script>

<style lang="scss" scoped>
:deep(.list-group-flush .list-group-item:first-child) {
  border-top-width: 0 !important;
}

:deep(.list-group-flush:last-child .list-group-item:last-child) {
  border-bottom-width: 0 !important;
}

.ghost-item {
  opacity: 0.5;
  background-color: $light-blue;
}
</style>
