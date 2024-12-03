<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BRow>
      <BCol lg="12">
        <FrPriorityFilter
          v-model:value="formPriorities"
          class="mb-4 mt-2" />
      </BCol>
      <BCol lg="12">
        <FrField
          v-model="formFields.query"
          class="mb-4"
          :label="$t('governance.tasks.taskNameOrAssignee')" />
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
/**
 * Component used to filter fulfillment tasks
 */
import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import { debounce } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrPriorityFilter from '@forgerock/platform-shared/src/components/governance/PriorityFilter';

// emits
const emit = defineEmits(['filter-change', 'filter-count']);

// data
const formFields = ref({
  query: '',
});
const formPriorities = ref({
  high: true,
  medium: true,
  low: true,
  none: true,
});

const numFilters = computed(() => {
  let filters = 0;
  if (!formPriorities.value.high) filters += 1;
  if (!formPriorities.value.medium) filters += 1;
  if (!formPriorities.value.low) filters += 1;
  if (!formPriorities.value.none) filters += 1;
  if (formFields.value.query.length) filters += 1;

  return filters;
});

/**
 * Get an object representing the current filter properties
 */
function getFilterPayload() {
  const priorities = {
    high: formPriorities.value.high,
    medium: formPriorities.value.medium,
    low: formPriorities.value.low,
    none: formPriorities.value.none,
  };
  const query = formFields.value.query.length
    ? formFields.value.query
    : null;

  return {
    count: numFilters.value,
    filter: {
      priorities,
      query,
    },
  };
}

const emitFilterChange = debounce(() => {
  emit('filter-change', getFilterPayload());
}, 500);

watch(() => formPriorities.value, () => {
  emit('filter-change', getFilterPayload());
}, { deep: true });

watch(() => formFields.value, () => {
  emitFilterChange();
}, { deep: true });
</script>
