<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="isLoading">
    <FrSpinner />
  </div>
  <div
    v-else
    class="py-3">
    <BRow
      v-if="entities.length === 0">
      <BCol
        sm="12"
        class="text-center">
        {{ $t('governance.agents.details.noAssociatedEntities', { entities: $t(`governance.agents.${type}`) }) }}
      </BCol>
    </BRow>
    <template v-else>
      <BRow
        v-for="entity in entities"
        class="entity-row"
        :key="entity">
        <BCol
          sm="12">
          <div class="d-flex flex-row align-items-center">
            <FrIcon
              :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-3 color-dark${icon.color} bg-light${icon.color} mt-n25`"
              :name="icon.icon" />
            <div>
              <div class="m-0 h5">
                {{ getDisplayInformation(entity).name }}
              </div>
              <small class="text-muted">
                {{ getDisplayInformation(entity).description }}
              </small>
            </div>
          </div>
        </BCol>
      </BRow>
      <div class="mt-4">
        <FrPagination
          v-if="totalEntities > 10"
          :value="currentPage"
          :per-page="entriesPerPage"
          :total-rows="totalEntities"
          @input="pageNumberChange($event)"
          @on-page-size-change="pageSizeChange" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  BRow, BCol,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';

const props = defineProps({
  entities: {
    type: Array,
    default: () => [],
  },
  totalEntities: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  agentProperty: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: 'object',
  },
  icon: {
    type: Object,
    default: () => ({
      icon: 'data_object',
      color: 'blue',
    }),
  },
});

const emit = defineEmits([
  'pagination-change',
]);
const currentPage = ref(1);
const entriesPerPage = ref(10);

/**
 * Handle page size changes
 * @param pageSize number The number of entries per page
 */
function pageSizeChange(pageSize) {
  entriesPerPage.value = pageSize;
  emit('pagination-change', { resource: props.type, pageNumber: currentPage.value - 1, pageSize: entriesPerPage.value });
}

/**
 * Handle page number changes
 * @param pageNumber number The new page number
 */
function pageNumberChange(pageNumber) {
  currentPage.value = pageNumber;
  emit('pagination-change', { resource: props.type, pageNumber: currentPage.value - 1, pageSize: entriesPerPage.value });
}

/**
 * Returns display information for an entity, returns the value at name/descriptionProperty if present AND not null
 * otherwise returns __NAME__ and description by default.
 * @param entity Object to get display information for
 * @returns Object containing name and description
 */
function getDisplayInformation(entity) {
  const nameProperty = props.agentProperty.nameProperty || '__NAME__';
  const descriptionProperty = props.agentProperty.descriptionProperty || 'description';
  const nameValue = entity[nameProperty] || entity.__NAME__;
  const descriptionValue = entity[descriptionProperty] || entity.description;
  return {
    name: nameValue,
    description: descriptionValue,
  };
}

</script>
<style lang="scss" scoped>

.entity-row {
  border: 1px solid;
  border-color: $gray-200;
  margin: .5rem;
  padding: 1rem;
  padding-left: 0rem;
}
</style>
