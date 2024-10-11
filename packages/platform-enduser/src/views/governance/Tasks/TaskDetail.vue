<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <template v-if="!isEmpty(item)">
      <!-- Header -->
      <div class="h5 text-muted mb-2">
        {{ $t('common.task') }}
      </div>
      <h1 class="text-truncate mb-2">
        {{ item.details.name }}
      </h1>
      <div class="mb-4">
        <span class="text-muted mr-1">
          {{ capitalize($t('governance.tasks.assignedTo')) }}
        </span>
        <span class="text-dark mr-1">
          {{ item.details.assignee }}
        </span>
        <span>
          {{ $t('common.on').toLowerCase() }}
          {{ item.details.assignedDate }}
        </span>
      </div>

      <!-- Task actions -->
      <FrRequestActions
        v-if="isActive"
        :permissions="permissions"
        :type="detailTypes.FULFILLMENT"
        class="mb-4" />

      <!-- Task details -->
      <BCard
        class="mb-3"
        no-body>
        <FrRequestDetails
          is-approval
          hide-tracking
          :hide-actions="{ comment: !permissions.comment, modify: !permissions.modify }"
          :item="item" />
      </BCard>
    </template>
  </BContainer>
</template>

<script setup>
/**
 * This component displays the details of a specific task.
 * Actions are available based on the task's status and the user's permissions.
 */
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { BCard, BContainer } from 'bootstrap-vue';
import { capitalize, isEmpty } from 'lodash';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { buildTaskDisplay } from '@forgerock/platform-shared/src/utils/governance/fulfillmentTasks';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrRequestActions from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestActions';
import FrRequestDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestDetails';
import { getUserFulfillmentTasks } from '@/api/governance/TasksApi';
import i18n from '@/i18n';

// Composables
const route = useRoute();
const { setBreadcrumb } = useBreadcrumb();

// Data
const { taskId } = route.params;
const isActive = ref(false);
const item = ref({});

// Computed
const userId = computed(() => useUserStore().userId);
const permissions = computed(() => {
  const itemPermissions = item.value?.rawData?.phases?.[0]?.permissions;
  if (itemPermissions) return itemPermissions;
  return {
    fulfill: false,
    deny: false,
    reassign: false,
    comment: false,
    modify: false,
  };
});

/**
 * Get the details of a task based on the provided task ID and status.
 * @param {string} id - The unique identifier of the task.
 * @param {string} status - The current status of the task.
 * @returns {Promise<Object>} A promise that resolves to the task details.
 */
async function getTask(id, status) {
  const params = {
    actorStatus: status,
    _action: 'search',
  };
  const filter = getBasicFilter('EQUALS', 'id', id);
  const { data } = await getUserFulfillmentTasks(userId.value, params, filter);
  if (data?.result?.length) {
    const task = data.result[0];
    return { task, active: status === 'active' };
  }
  return { task: null, active: false };
}

/**
 * Fetches data for a specific task.
 * First, it attempts to retrieve the active task.
 * If no active task is found, it retrieves the inactive task.
 */
async function getTaskData() {
  try {
    let { task, active } = await getTask(taskId, 'active');
    if (!task) ({ task, active } = await getTask(taskId, 'inactive'));

    [item.value] = buildTaskDisplay([task]);
    isActive.value = active;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.tasks.taskLoadError'));
  }
}

setBreadcrumb('/tasks', i18n.global.t('sideMenu.tasks'));
getTaskData();
</script>
