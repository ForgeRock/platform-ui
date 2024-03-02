<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    ref="modal"
    :id="modalId"
    :ok-disabled="!anySelected"
    ok-variant="primary"
    cancel-variant="link"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('autoAccess.access.normalView.filterModal.title')">
    <BListGroup>
      <Draggable
        class="d-flex flex-column w-100"
        ghost-class="ghost-tag"
        :list="pendingFilters"
        item-key="text">
          <template #item="{ element }">
            <BListGroupItem
              class="py-1 p-2 justify-content-between align-items-center"
              :class="element !== '' ? 'd-flex' : 'd-none'"
              :key="element.text"
              :id="`fr-columns-task-${element.text}`">
              <div class="d-flex align-items-center p-2">
                <FrField
                  v-model="element.show"
                  name="filter"
                  type="checkbox" />
                <span class="fr-tag-text">
                  {{ element.title }}
                </span>
              </div>
              <FrIcon
                icon-class="pl-2"
                name="drag_indicator" />
            </BListGroupItem>
        </template>
      </Draggable>
    </BListGroup>
    <template #modal-footer="{ cancel }">
      <div class="d-flex justify-content-end">
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          class="apply-button"
          variant="primary"
          @click="applyCustomization">
          {{ $t('common.apply') }}
        </BButton>
      </div>
    </template>
  </BModal>
</template>

<script setup>
import {
  BButton,
  BModal,
  BListGroupItem,
  BListGroup,
} from 'bootstrap-vue';
import Draggable from 'vuedraggable';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { computed, ref, watch } from 'vue';
import { cloneDeep } from 'lodash';

Draggable.compatConfig = { MODE: 3 };

const emit = defineEmits(['update']);
const pendingFilters = ref([]);
const modal = ref(null);

const prop = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Array,
    default: () => [],
  },
  modalId: {
    type: String,
    default: 'FilterFeaturesModal',
  },
});

/**
 * Emits selected options and closes the modal
 */
function applyCustomization() {
  modal.value.hide();
  emit('update', pendingFilters.value);
}

/**
 * Determine if one or more checkboxes are selected
 *
 * @return {boolean} True if any are selected, false if none are selected
 */
const anySelected = computed(() => pendingFilters.value.find((filter) => filter.show));

/**
 * When new filter data is passed in, update the pendingFilters state
 */
watch(
  () => prop.filters,
  (newVal) => {
    pendingFilters.value = cloneDeep(newVal);
  }, { immediate: true },
);
</script>
