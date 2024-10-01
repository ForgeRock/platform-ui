<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      :title="$t('governance.tasks.title')"
      :subtitle="$t('governance.tasks.subtitle')" />
    <BCard no-body>
      <FrTaskList
        :is-loading="isLoading"
        :tasks="fulfillmentTasks">
        <template #header>
          <FrRequestToolbar
            :num-filters="numFilters"
            :sort-by-options="sortByOptions"
            :status-options="statusOptions"
            @sort-change="filterHandler({ sortKeys: $event })"
            @sort-direction-change="filterHandler({ sortDir: $event })"
            @status-change="filterHandler({ status: $event })">
            <template #filter>
              <FrTaskFilter
                @filter-count="numFilters = $event"
                @filter-change="filterHandler({ filter: $event })" />
            </template>
          </FrRequestToolbar>
        </template>
        <template #no-data>
          <FrNoData
            :card="false"
            class="mb-4 border-top"
            icon="inbox"
            :subtitle="$t('governance.tasks.noTasks')" />
        </template>
        <template #footer>
          <FrPagination
            v-model="currentPage"
            :per-page="pageSize"
            :total-rows="totalCount"
            @input="filterHandler({ currentPage: $event })"
            @on-page-size-change="filterHandler({ pageSize: $event })" />
        </template>
      </FrTaskList>
    </BCard>
  </BContainer>
</template>

<script setup>
/**
 * View to display fulfillment tasks. Includes the ability to select a status, sort, and filter tasks.
 */
import { ref } from 'vue';
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrRequestToolbar from '@forgerock/platform-shared/src/components/governance/RequestToolbar';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getTaskFilter } from '@forgerock/platform-shared/src/utils/governance/fulfillmentTasks';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrTaskFilter from './TaskFilter';
import FrTaskList from './TaskList';
import { getUserFulfillmentTasks } from '@/api/governance/TasksApi';
import i18n from '@/i18n';
import store from '@/store';

// composables
const { userId } = useUserStore();

// data
const currentPage = ref(1);
const filter = ref({});
const fulfillmentTasks = ref([]);
const isLoading = ref(false);
const numFilters = ref(0);
const pageSize = ref(10);
const sortDir = ref('desc');
const sortKeys = ref('date');
const status = ref('pending');
const totalCount = ref(0);

const componentRefs = new Map([
  ['currentPage', currentPage],
  ['filter', filter],
  ['pageSize', pageSize],
  ['sortDir', sortDir],
  ['sortKeys', sortKeys],
  ['status', status],
  ['totalRows', totalCount],
]);

const statusOptions = [
  {
    text: i18n.global.t('governance.status.pending'),
    value: 'pending',
  },
  {
    text: i18n.global.t('governance.status.complete'),
    value: 'complete',
  },
];

const sortByOptions = [
  {
    value: 'date',
    text: i18n.global.t('governance.tasks.dateAssigned'),
  },
  {
    value: 'assignee',
    text: i18n.global.t('governance.tasks.assignedTo'),
  },
  {
    value: 'priority',
    text: i18n.global.t('common.priority'),
  },
  {
    value: 'id',
    text: i18n.global.t('governance.accessRequest.requestId'),
  },
];

const sortKeysMap = {
  date: 'decision.phases.startDate',
  assignee: 'decision.actors.active.userName',
  priority: 'request.common.priority',
  id: 'metadata.primaryKey',
};

/**
 * Updates the badge with the latest tasks count.
 */
async function updateBadge() {
  const params = {
    pageSize: 0,
    actorStatus: 'active',
  };
  try {
    const { data } = await getUserFulfillmentTasks(userId, params);
    store.commit('setFulfillmentTasksCount', data.totalCount);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.tasks.taskLoadError'));
  }
}

/**
 * Asynchronously loads tasks and optionally navigates to the first page.
 * @param {boolean} goToFirstPage - A flag indicating whether to navigate to the first page after loading tasks.
 */
async function loadTasks(goToFirstPage) {
  isLoading.value = true;

  if (goToFirstPage) currentPage.value = 1;

  const payload = getTaskFilter(filter.value);
  const params = {
    _pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
    _pageSize: pageSize.value,
    _sortKeys: sortKeysMap[sortKeys.value],
    _sortDir: sortDir.value,
    actorStatus: status.value === 'pending' ? 'active' : 'inactive',
  };
  if (sortKeys.value === 'date') params._sortType = 'date';

  try {
    const { data } = await getUserFulfillmentTasks(userId, params, payload);
    fulfillmentTasks.value = data.result;
    totalCount.value = data.totalCount;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.tasks.taskLoadError'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Loads the fulfillment tasks and updates the badge count accordingly.
 * This function is responsible for fetching the latest fulfillment tasks
 * and ensuring that the badge count reflects the current number of tasks.
 */
function loadFulfillmentTasksAndUpdateBadge() {
  loadTasks();
  updateBadge();
}

/**
 * Handles filtering requests as well as updates to pagination
 * @param {Object} property updated property
 */
function filterHandler(property) {
  const [key, value] = Object.entries(property)[0];
  componentRefs.get(key).value = value;
  const resetPaging = (key !== 'currentPage');
  loadTasks(resetPaging);
}

loadFulfillmentTasksAndUpdateBadge();

</script>
