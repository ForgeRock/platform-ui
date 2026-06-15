<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="computedModalId"
    :visible="show"
    :ok-title="$t('common.apply')"
    :title="title || $t('columnPicker.customizeColumns')"
    :ok-disabled="!pendingColumns.length"
    :hide-footer="moveAndReorderItemOnchange"
    @hidden="onHidden"
    @cancel="onCancel"
    @ok="onApply"
    body-class="p-0"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    ok-variant="primary"
    scrollable
    size="lg">
    <BRow class="m-0">
      <BCol
        class="p-0"
        cols="5">
        <div class="column-picker-header d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <h6 class="mb-0 h5">
            {{ $t('columnPicker.availableColumns') }}
          </h6>
          <BFormRadioGroup
            v-if="allowViewModeToggle"
            v-model="viewMode"
            buttons
            button-variant="outline-secondary"
            size="sm">
            <BFormRadio
              :value="VIEW_MODE_CATEGORIES"
              :aria-label="$t('columnPicker.categories')">
              <span
                aria-hidden="true"
                class="material-icons-outlined"
                :title="$t('columnPicker.categories')">
                view_day
              </span>
            </BFormRadio>
            <BFormRadio
              :value="VIEW_MODE_LIST"
              :aria-label="$t('columnPicker.list')">
              <span
                aria-hidden="true"
                class="material-icons-outlined"
                :title="$t('columnPicker.list')">
                list
              </span>
            </BFormRadio>
          </BFormRadioGroup>
        </div>

        <!-- Category View -->
        <div
          v-if="viewMode === VIEW_MODE_CATEGORIES"
          class="column-list"
        >
          <FrAccordion
            accordion-group="availableColumns"
            header-classes="dropdown-toggle"
            card-classes="border-0"
            :items="accordionItems">
            <template #header="slotData">
              <div class="mb-0 p-0">
                {{ slotData.header }}
              </div>
            </template>
            <template #body="slotData">
              <div
                v-for="item in slotData.items"
                :key="`${item.categoryKey}.${getColumnId(item)}`"
                class="d-flex align-items-center column-row">
                <FrField
                  :value="isColumnActive(item)"
                  :label="item.label || item.selectLabel || item.value || startCase(item.key)"
                  class="column-row__input w-100 p-2 mb-0"
                  type="checkbox"
                  @change="toggleColumn(item, $event)" />
              </div>
            </template>
          </FrAccordion>
        </div>

        <!-- List View -->
        <div
          v-else
        >
          <div class="px-4 my-3">
            <FrSearchInput
              v-model="listSearchQuery"
              :aria-label="$t('common.search')"
              :placeholder="$t('common.search')"
              @clear="listSearchQuery = ''" />
          </div>
          <div class="column-list pl-4">
            <div
              v-for="column in filteredAvailableColumns"
              :key="getColumnId(column)"
              class="d-flex align-items-center column-row">
              <FrField
                :value="isColumnActive(column)"
                :label="column.label || column.selectLabel || column.value || startCase(column.key)"
                class="column-row__input w-100 p-2 mb-0"
                type="checkbox"
                @change="toggleColumn(column, $event)" />
            </div>
          </div>
        </div>
      </BCol>

      <BCol
        class="p-0 border-left"
        cols="7">
        <div class="column-picker-header d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <h6
            ref="activeColumnsHeader"
            class="mb-0 h5"
            tabindex="-1">
            {{ $t('columnPicker.activeColumns') }}
          </h6>
          <BButton
            v-if="defaultColumns.length"
            variant="link"
            size="sm"
            class="text-secondary p-0 d-flex align-items-center"
            @click="resetToDefault">
            {{ $t('columnPicker.reset') }}
            <FrIcon
              aria-hidden="true"
              name="replay"
              class="ml-1" />
          </BButton>
        </div>
        <div class="active-column-list pl-2 pr-4">
          <BTableSimple
            v-if="pendingColumns.length"
            class="active-column-table mb-0 pt-2">
            <caption class="sr-only">
              {{ $t('columnPicker.activeColumnsTableCaption') }}
            </caption>
            <Draggable
              chosen-class="chosen-item"
              drag-class="drag-item"
              ghost-class="draggable-ghost-tag"
              tag="tbody"
              :list="pendingColumns"
              :item-key="(item) => getColumnId(item)"
              @end="onDragChange">
              <template #item="{ element }">
                <BTr class="cursor-pointer d-flex align-items-center">
                  <BTd class="py-2 pl-2 pr-0 border-0 flex-grow-1">
                    <div class="d-flex align-items-center">
                      <FrIcon
                        aria-hidden="true"
                        icon-class="mr-4"
                        name="drag_indicator" />
                      <span>{{ element.label || element.listLabel || element.value || startCase(element.key) }}</span>
                    </div>
                  </BTd>
                  <BTd class="py-2 pl-0 pr-2 border-0 flex-shrink-0">
                    <BButton
                      :aria-label="$t('columnPicker.removeColumn', { columnName: element.label || element.listLabel || element.value || startCase(element.key) })"
                      variant="link"
                      class="text-dark p-0"
                      @click="removeColumn(element)">
                      <FrIcon name="delete" />
                    </BButton>
                  </BTd>
                </BTr>
              </template>
            </Draggable>
          </BTableSimple>
          <div
            v-else
            class="active-column-empty-state d-flex flex-column align-items-center justify-content-center text-muted py-5">
            <FrIcon
              aria-hidden="true"
              icon-class="mb-2"
              name="view_column" />
            <span class="small">{{ $t('columnPicker.noColumnsSelected') }}</span>
          </div>
        </div>
      </BCol>
    </BRow>
  </BModal>
</template>

<script setup>
import {
  BModal,
  BRow,
  BCol,
  BTableSimple,
  BTr,
  BTd,
  BButton,
  BFormRadioGroup,
  BFormRadio,
} from 'bootstrap-vue';
import {
  ref,
  watch,
  computed,
  nextTick,
} from 'vue';
import Draggable from 'vuedraggable';
import { cloneDeep, startCase } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import { getColumnId } from './utils';

Draggable.compatConfig = { MODE: 3 };

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  // Unique identifier for the modal. If not provided, a random ID will be used.
  modalId: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  activeColumns: {
    type: Array,
    default: () => [],
  },
  availableColumns: {
    type: Array,
    default: () => [],
  },
  allowViewModeToggle: {
    type: Boolean,
    default: false,
  },
  moveAndReorderItemOnchange: {
    type: Boolean,
    default: false,
  },
  ignoredColumnKeys: {
    type: Array,
    default: () => [],
  },
  defaultColumns: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:activeColumns', 'apply', 'hidden', 'update:show']);

const VIEW_MODE_CATEGORIES = 'categories';
const VIEW_MODE_LIST = 'list';

const isCategorized = computed(() => props.availableColumns.some((col) => Array.isArray(col.children)));
const viewMode = ref(isCategorized.value ? VIEW_MODE_CATEGORIES : VIEW_MODE_LIST);

const pendingColumns = ref([]);
const hiddenColumns = ref([]);
const listSearchQuery = ref('');
const activeColumnsHeader = ref(null);
const computedModalId = props.modalId || `column-picker-${uuidv4()}`;

// Reset search query when view mode changes
watch(viewMode, () => {
  listSearchQuery.value = '';
});

// If availableColumns arrives asynchronously, isCategorized may be false at setup.
// Switch to category view the first time categorized columns appear, unless the user has already toggled manually.
watch(isCategorized, (val) => {
  if (val) viewMode.value = VIEW_MODE_CATEGORIES;
}, { once: true });

// Combine default ignored 'actions' key with any additional ones provided via props, ensuring all are strings for consistent comparison.
const computedIgnoredColumnKeys = computed(() => {
  const additional = props.ignoredColumnKeys || [];
  const keys = Array.isArray(additional) ? additional : [additional];
  return ['actions', ...keys.map((k) => String(k))];
});

/**
 * Filter function to remove the ignored columns from the list as they are handled separately.
 * @param {Object} column - The column object to check.
 * @returns {Boolean} - True if the column is not ignored.
 */
const isIgnored = (column) => computedIgnoredColumnKeys.value.includes(column.key) || computedIgnoredColumnKeys.value.includes(column.value);

/**
 * Single normalisation pass over availableColumns. Produces an array of
 * categories (a single synthetic category for flat lists) where each item
 * carries its canonical `value` and the `categoryKey` it came from. All
 * downstream computeds derive from this so the two views can never disagree.
 */
const normalizedCategories = computed(() => {
  const buildItems = (items, categoryKey) => items
    .filter((opt) => !isIgnored(opt))
    .map((opt) => ({
      ...opt,
      value: getColumnId(opt),
      categoryKey,
    }));

  if (!isCategorized.value) {
    return [{
      categoryKey: null,
      header: null,
      items: buildItems(props.availableColumns, null),
    }];
  }

  return props.availableColumns
    .filter((col) => !isIgnored(col))
    .map((col) => {
      const categoryKey = getColumnId(col);
      return {
        categoryKey,
        header: col.label,
        items: buildItems(col.children || [], categoryKey),
      };
    });
});

/**
 * Items to render in the accordion (categorised view). Same shape as
 * normalizedCategories — same `value` may legitimately appear in more than
 * one category.
 */
const accordionItems = computed(() => normalizedCategories.value);

/**
 * Flat, deduplicated list of available columns. List view has no category
 * context to disambiguate, so we keep first-occurrence dedup by canonical id.
 */
const allAvailableColumns = computed(() => {
  const seen = new Set();
  return normalizedCategories.value
    .flatMap((cat) => cat.items)
    .filter((opt) => {
      if (seen.has(opt.value)) return false;
      seen.add(opt.value);
      return true;
    });
});

/**
 * Filters the flat list of available columns based on the search query.
 */
const filteredAvailableColumns = computed(() => {
  if (!listSearchQuery.value) return allAvailableColumns.value;
  const query = listSearchQuery.value.toLowerCase().replace(/_/g, ' ');
  return allAvailableColumns.value.filter((column) => {
    const label = (column.label || column.selectLabel || column.value || startCase(column.key) || '').toLowerCase();
    return label.includes(query);
  });
});

/**
 * Emits the apply event with the current pending selection and closes the modal.
 */
function onApply() {
  const finalColumns = [...pendingColumns.value, ...hiddenColumns.value];
  emit('update:activeColumns', finalColumns);
  emit('apply', finalColumns);
}

/**
 * Checks if a specific column is currently in the pending (selected) list.
 * @param {Object} column - The column to check.
 * @returns {Boolean} - True if the column is active.
 */
function isColumnActive(column) {
  const id = getColumnId(column);
  return pendingColumns.value.some((c) => getColumnId(c) === id);
}

/**
 * Toggles a column in or out of the pending selection.
 * @param {Object} column - The column to toggle.
 * @param {Boolean} active - Whether the column should be active.
 */
function toggleColumn(column, active) {
  const id = getColumnId(column);
  if (active) {
    const exists = pendingColumns.value.some((c) => getColumnId(c) === id);
    if (!exists) pendingColumns.value.push(cloneDeep(column));
  } else {
    const index = pendingColumns.value.findIndex((c) => getColumnId(c) === id);
    if (index !== -1) pendingColumns.value.splice(index, 1);
  }
  if (props.moveAndReorderItemOnchange) onApply();
}

/**
 * Removes a column from the pending selection.
 * @param {Object} column - The column to remove.
 */
function removeColumn(column) {
  toggleColumn(column, false);
  nextTick(() => activeColumnsHeader.value?.focus());
}

/**
 * Handles the change event from the draggable component.
 */
function onDragChange() {
  if (props.moveAndReorderItemOnchange) onApply();
}

/**
 * Resets the pending columns to the default/initial columns
 */
function resetToDefault() {
  const availableKeys = allAvailableColumns.value.map((c) => getColumnId(c));
  pendingColumns.value = cloneDeep(props.defaultColumns)
    .filter((c) => !isIgnored(c))
    .filter((c) => availableKeys.includes(getColumnId(c)));
  if (props.moveAndReorderItemOnchange) onApply();
}

/**
 * Closes the modal without applying changes.
 */
function onCancel() {
  emit('update:show', false);
}

/**
 * Resets search query and emits hidden event when the modal is closed.
 */
function onHidden() {
  listSearchQuery.value = '';
  emit('update:show', false);
  emit('hidden');
}

/**
 * Watches for the show prop to initialize the pendingColumns from activeColumns when the modal opens.
 */
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    const availableKeys = allAvailableColumns.value.map((c) => getColumnId(c));
    hiddenColumns.value = cloneDeep(props.activeColumns).filter((c) => isIgnored(c));
    pendingColumns.value = cloneDeep(props.activeColumns)
      .filter((c) => !isIgnored(c))
      .filter((c) => availableKeys.includes(getColumnId(c)));
  }
}, { immediate: true });

</script>

<style lang="scss" scoped>
.column-picker-header {
  height: 70px;
}

.column-list {
  max-height: 400px;
  overflow-y: auto;

  :deep(.custom-control),
  :deep(.custom-control-label) {
    cursor: pointer;
  }

  :deep(.accordion) {
    // Prevent double border overlap with column header
    .card > div:first-of-type {
      border-top: none !important;
    }
  }
}

.column-row {
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: var(--input-bg-active);
  }

  :deep(.custom-control) {
    width: 100%;
  }

  :deep(.custom-control-label) {
    width: 100%;
    cursor: pointer;
  }

  .column-row__input {
    &:deep(> div) {
      width: 100%;
    }
  }
}

.active-column-list {
  max-height: 480px;
  overflow-y: auto;

  .active-column-table {
    width: 100%;

    :deep(td) {
      border: none;
      min-width: 0;
      word-break: break-word;
    }

    :deep(tr) {
      &:hover td {
        background-color: var(--input-bg-active);
      }

      &.chosen-item {
        background-color: var(--input-active-bg);
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
      }

      &.drag-item td {
        background-color: $light-blue;
        opacity: 0.8;
      }
    }
  }
}

.active-column-empty-state {
  min-height: 200px;
  color: $gray-500;

  :deep(.material-icons),
  :deep(.material-icons-outlined) {
    font-size: 2rem;
  }
}

.draggable-ghost-tag {
  opacity: 0.5;
  background-color: $light-blue;
}

// Override BootstrapVue button group styles for the view mode toggle
:deep(.btn-group) {
  .btn-outline-secondary {
    &:hover {
      background-color: $gray-100;
      border-color: $gray-500;
      color: $gray-700;
    }

    &.active {
      background-color: $gray-200;
      border-color: $gray-500;
      color: $gray-700;
    }
  }
}
</style>
