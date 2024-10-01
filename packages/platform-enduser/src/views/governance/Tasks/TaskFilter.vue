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
      <BCol lg="6">
        <FrGovResourceSelect
          v-model="formFields.assignee"
          name="Assignee"
          class="mb-4"
          :first-option="allAssigneeOption"
          :initial-data="{ id: 'all' }"
          :label="$t('governance.tasks.assignee')"
          resource-path="user" />
      </BCol>
      <BCol lg="6">
        <FrField
          v-model="formFields.taskName"
          class="mb-4"
          :label="$t('governance.tasks.taskName')" />
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
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrPriorityFilter from '@forgerock/platform-shared/src/components/governance/PriorityFilter';
import i18n from '@/i18n';

// emits
const emit = defineEmits(['filter-change', 'filter-count']);

// data
const formFields = ref({
  assignee: 'managed/user/all',
  taskName: '',
});
const formPriorities = ref({
  high: true,
  medium: true,
  low: true,
  none: true,
});
const allAssigneeOption = ref({
  text: i18n.global.t('governance.tasks.allAssignees'),
  value: 'all',
});

const numFilters = computed(() => {
  let filters = 0;
  if (!formPriorities.value.high) filters += 1;
  if (!formPriorities.value.medium) filters += 1;
  if (!formPriorities.value.low) filters += 1;
  if (!formPriorities.value.none) filters += 1;
  if (formFields.value.assignee !== 'managed/user/all') filters += 1;
  if (formFields.value.taskName.length) filters += 1;

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
  const assignee = formFields.value.assignee === 'managed/user/all'
    ? null
    : formFields.value.assignee;
  const taskName = formFields.value.taskName.length
    ? formFields.value.taskName
    : null;

  return {
    priorities,
    assignee,
    taskName,
  };
}

watch(() => formPriorities.value, () => {
  emit('filter-count', numFilters.value);
  emit('filter-change', getFilterPayload());
}, { deep: true });

watch(() => formFields.value, () => {
  emit('filter-count', numFilters.value);
  emit('filter-change', getFilterPayload());
}, { deep: true });
</script>
