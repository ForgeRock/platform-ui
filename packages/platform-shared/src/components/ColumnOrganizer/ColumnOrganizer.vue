<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    :ok-title="$t('common.apply')"
    :title="$t('common.customizeColumns')"
    @hidden="$emit('hidden')"
    @cancel="resetColumns"
    @ok="applyCustomization()"
    body-class="p-0"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    ok-variant="primary"
    scrollable
    size="lg"
    :static="isTesting">
    <BRow class="m-0">
      <BCol
        class="p-0"
        cols="4">
        <FrAccordion
          accordion-group="availableColumns"
          header-classes="dropdown-toggle"
          card-classes="border-0"
          :items="availableColumnsList">
          <template #accordionHeader>
            <div class="p-4">
              <header class="mb-0 h5">
                {{ $t('common.availableColumns') }}
              </header>
            </div>
          </template>

          <template #header="slotData">
            <div class="mb-0 text-body p-0">
              {{ slotData.header }}
            </div>
          </template>

          <template #body="slotData">
            <div
              v-for="item in slotData.items"
              :key="item.key"
              class="d-flex align-items-center p-2">
              <FrField
                v-model="item.show"
                :name="`columnSelected_${item.key}`"
                type="checkbox"
                @change="changeSelection(item, $event)" />
              <span class="fr-tag-text">
                {{ item.noCategoryLabel || item.label }}
              </span>
            </div>
          </template>
        </FrAccordion>
      </BCol>
      <BCol class="p-0">
        <div class="p-4">
          <header class="mb-0 h5">
            {{ $t('common.activeColumns') }}
          </header>
        </div>
        <BListGroup>
          <Draggable
            class="d-flex flex-column w-100"
            ghost-class="ghost-tag"
            :list="activeColumnsList"
            item-key="key">
            <template #item="{ element }">
              <BListGroupItem
                class="py-1 p-2 justify-content-between cursor-pointer border-bottom-0"
                :class="element.label !== '' ? 'd-flex' : 'd-none'"
                :id="`fr-columns-task-${element.key}`">
                <div
                  class="d-flex align-items-center p-2">
                  <FrIcon
                    icon-class="mr-4"
                    name="drag_indicator">
                    <span class="fr-tag-text">
                      {{ element.label }}
                    </span>
                  </FrIcon>
                </div>
                <BButton
                  variant="link"
                  class="text-dark py-0 px-4"
                  @click="hideColumn(element)">
                  <FrIcon name="delete" />
                </BButton>
              </BListGroupItem>
            </template>
          </Draggable>
        </BListGroup>
      </BCol>
    </BRow>
  </BModal>
</template>

<script setup>
import {
  BListGroup,
  BListGroupItem,
  BModal,
  BRow,
  BCol,
  BButton,
} from 'bootstrap-vue';
import {
  ref,
  watch,
} from 'vue';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import Draggable from 'vuedraggable';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import {
  cloneDeep,
  find,
  findIndex,
} from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';

Draggable.compatConfig = { MODE: 3 };

// Composables
const { bvModal } = useBvModal();

const emit = defineEmits(['update-columns', 'hidden']);

// component props
const props = defineProps({
  activeColumns: {
    type: Array,
    default: () => [],
  },
  availableColumns: {
    type: Array,
    default: () => [],
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  modalId: {
    type: String,
    default: 'ColumnOrganizerModal',
  },
});

// data
const activeColumnsList = ref(cloneDeep(props.activeColumns));
const availableColumnsList = ref(cloneDeep(props.availableColumns));

// watchers
watch(() => props.availableColumns,
  (newVal) => {
    availableColumnsList.value = cloneDeep(newVal);
  });

watch(() => props.activeColumns,
  (newVal) => {
    // filter selector column from list
    const columnList = newVal.filter((col) => col.key !== 'selector');
    activeColumnsList.value = cloneDeep(columnList);
  });

/**
 * Remove the column indicated by key from the list of 'active columns'
 * @param {String} key key property of the column to be removed
 */
function removeColumn(key) {
  const columnIndex = findIndex(activeColumnsList.value, { key });
  if (columnIndex !== -1) {
    activeColumnsList.value.splice(columnIndex, 1);
  }
}

/**
 * Changes the 'show' value of the selected column to hide it from the listing
 * @param {Object} column column to hide from columns list
 * @param {String} category name of category to which the column belongs
 * @param {String} key identifier of the column to modify
 */
function hideColumn({ category, key }) {
  // find the column on the available columns
  const itemToHide = find(availableColumnsList.value, { name: category })
    .items.find((item) => item.key === key);
  // hide the column
  itemToHide.show = false;
  // remove column from the list
  removeColumn(key);
}

/**
 * Resets the active and available columns to their original state
 */
function resetColumns() {
  activeColumnsList.value = cloneDeep(props.activeColumns);
  availableColumnsList.value = cloneDeep(props.availableColumns);
}

/**
 * Change the column selection to correctly reflect the 'active columns' listing
 * @param {Object} column column object to change
 * @param {Boolean} show determines when the column is displayed or hidden
 */
function changeSelection(column, show) {
  if (show) {
    // if the column is displayed it is added to the list of 'active columns'
    const secondToLastPosition = activeColumnsList.value.length - 1;
    activeColumnsList.value.splice(secondToLastPosition, 0, column);
  } else {
    // if it's hidden, it's removed from the list of 'active columns'
    removeColumn(column.key);
  }
}

/**
 * Apply columns customization
 */
function applyCustomization() {
  emit('update-columns', {
    activeColumns: activeColumnsList.value,
    availableColumns: availableColumnsList.value,
  });
  bvModal.value.hide(props.modalId);
}
</script>
