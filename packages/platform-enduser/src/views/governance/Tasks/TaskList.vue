<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot name="header" />
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <BTable
      v-else-if="items.length"
      class="border-top mb-0"
      hover
      tbody-tr-class="cursor-pointer"
      :fields="fields"
      :items="items"
      @row-clicked="$emit('open-detail', $event);">
      <template #cell(details)="{ item }">
        <BMedia
          v-if="item.details"
          class="align-items-center">
          <BMediaBody class="align-self-center text-truncate">
            <h2 class="h5 mb-2">
              {{ item.details.name }}
            </h2>
            <div class="mb-1">
              <span class="text-muted mr-1">
                {{ capitalize($t('governance.tasks.assignedTo')) }}
              </span>
              <span class="text-dark mr-3">
                {{ item.details.assignee }}
              </span>
            </div>
            <div>
              <small
                class="text-muted">
                {{ $t('governance.accessRequest.idLabel', { id: item.details.id }) }}
              </small>
              <BImg
                class="ml-2"
                height="24"
                :src="getPriorityImageSrc(item.details.priority)" />
            </div>
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(date)="{ item }">
        <small class="text-muted">
          {{ item.details.assignedDate }}
        </small>
      </template>
      <template #cell(actions)="{ item }">
        <slot
          name="actions"
          :item="item" />
      </template>
    </BTable>
    <template v-else>
      <slot name="no-data" />
    </template>
    <slot name="footer" />
  </div>
</template>

<script setup>
/**
 * Displays the list of tasks.
 */
import {
  BImg,
  BMedia,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { capitalize } from 'lodash';
import { ref, watch } from 'vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { buildTaskDisplay } from '@forgerock/platform-shared/src/utils/governance/fulfillmentTasks';
import { getPriorityImageSrc } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';

const prop = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  tasks: {
    type: Array,
    default: () => [],
  },
});

// emits
defineEmits(['open-detail']);

// data
const fields = [
  {
    key: 'details',
    label: i18n.global.t('governance.tasks.task'),
    class: 'w-65',
  },
  {
    key: 'date',
    label: i18n.global.t('governance.tasks.dateAssigned'),
  },
  {
    key: 'actions',
    label: '',
  },
];
const items = ref([]);

watch(() => prop.tasks, (newTasks) => {
  items.value = buildTaskDisplay(newTasks);
}, { immediate: true, deep: true });

</script>
<style lang="scss" scoped>
.w-200px {
  width: 200px;
}

:deep(.w-65) {
  width: 65% !important;
}
</style>
