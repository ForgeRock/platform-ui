<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-column h-100 w-100 px-4 pt-5">
    <FrHeader
      :title="$t('governance.tasks.title')"
      :subtitle="$t('governance.tasks.subtitle')" />
    <div class="d-flex flex-wrap flex-grow-1 w-100">
      <FrFilterSidePanel
        v-if="showFilters"
        :title="$t('governance.access.filter.requestFilter')">
        <FrAccessFilter
          :input-fields="accessFilter"
          :input-filter-data="filterData"
        />
      </FrFilterSidePanel>
      <div class="d-flex h-100 table-container fr-table-panel">
        <BCard
          class="h-100 d-flex"
          no-body>
          <div class="d-flex flex-grow-1 table-container">
            <FrTaskList
              :is-loading="isLoading"
              :tasks="fulfillmentTasks"
              @open-detail="viewDetails">
              <template #header>
                <BButtonToolbar
                  class="px-4 py-3 border-bottom-0 justify-content-end">
                  <FrSortDropdown
                    class="px-3"
                    :selected-item="sortField"
                    :hide-labels-on-mobile="true"
                    :sort-by-options="sortByOptions"
                    @sort-field-change="handleSortChange"
                    @sort-direction-change="handleSortDirectionChange" />
                  <BButton
                    @click="showFilters = !showFilters"
                    class="toolbar-link-text"
                    :pressed="showFilters"
                    aria-labelledby="filter-toggle-label"
                    data-testid="filter-toggle"
                    variant="link">
                    <FrIcon
                      icon-class="mr-lg-2"
                      name="filter_list">
                      <span
                        class="d-none d-lg-inline"
                        id="filter-toggle-label">
                        {{ showFilters ? $t('governance.hideFilters') : $t('governance.showFilters') }}
                      </span>
                    </FrIcon>
                    <BBadge
                      v-if="numFilters > 0"
                      pill
                      class="ml-1"
                      data-testid="filter-badge"
                      variant="primary">
                      {{ numFilters }}
                    </BBadge>
                  </BButton>
                </BButtonToolbar>
              </template>
              <template #no-data>
                <FrNoData
                  :card="false"
                  class="mb-4 border-top"
                  icon="inbox"
                  :subtitle="$t('governance.tasks.noTasks')" />
              </template>
              <template #actions="{ item }">
                <FrRequestActionsCell
                  v-if="status === 'pending'"
                  :item="item"
                  :status="status"
                  :type="detailTypes.FULFILLMENT"
                  @action="handleAction($event, item)" />
              </template>
            </FrTaskList>
          </div>
          <FrPagination
            v-model="currentPage"
            :per-page="pageSize"
            :total-rows="totalCount"
            @input="filterHandler({ currentPage: $event })"
            @on-page-size-change="filterHandler({ pageSize: $event })" />
        </BCard>
      </div>
    </div>
    <FrRequestModal
      is-task
      :type="modalType"
      :item="modalItem"
      @modal-closed="modalType = null; modalItem = null"
      @update-list="loadFulfillmentTasksAndUpdateBadge" />
  </div>
</template>

<script setup>
/**
 * View to display fulfillment tasks. Includes the ability to select a status, sort, and filter tasks.
 */
import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import {
  BCard,
  BButtonToolbar,
  BButton,
  BFormRadioGroup,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrRequestActionsCell from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestActionsCell';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrSortDropdown from '@forgerock/platform-shared/src/components/governance/SortDropdown';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
// import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getTaskFilter } from '@forgerock/platform-shared/src/utils/governance/fulfillmentTasks';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
// import FrTaskFilter from './TaskFilter';
import {
  detailTypes,
  getInitialTaskFilterData,
  getNumFilters,
  getTaskFilterConfig,
  sortByOptions,
  sortKeysMap,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrFilterSidePanel from '@forgerock/platform-shared/src/components/governance/FilterSidePanel';
import FrAccessFilter from '@forgerock/platform-shared/src/components/governance/AccessFilter/AccessFilter';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrPriorityFilter from '@forgerock/platform-shared/src/components/governance/PriorityFilter';
import FrTaskList from './TaskList';
import { getUserFulfillmentTasks } from '@/api/governance/TasksApi';
import i18n from '@/i18n';
import store from '@/store';

// composables
const router = useRouter();
const { userId } = useUserStore();
const { bvModal } = useBvModal();

// data
const currentPage = ref(1);
const filter = ref({});
const fulfillmentTasks = ref([]);
const isLoading = ref(false);
// const numFilters = ref(0);
const modalItem = ref({});
const modalType = ref('');
const pageSize = ref(10);
const sortDir = ref('desc');
const sortKeys = ref('date');
const status = ref('pending');
const totalCount = ref(0);
const showFilters = ref(false);

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
  { text: i18n.global.t('governance.status.pending'), value: 'pending' },
  { text: i18n.global.t('governance.status.complete'), value: 'complete' },
];
const sortField = ref('date');
const filterData = ref(getInitialTaskFilterData(statusOptions[0].value));
const numFilters = computed(() => getNumFilters(filterData.value));
const accessFilter = ref(getTaskFilterConfig(
  { BFormRadioGroup, FrPriorityFilter, FrField },
  { statusOptions, filterData: filterData.value },
));

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
 * Debounced handler that syncs filterData values into local state and triggers a fresh task load.
 * Resets pagination to the first page on each filter change.
 */
const syncFilterDataAndReload = debounce(() => {
  const {
    status: statusField, priorities, query, assignee,
  } = filterData.value;
  status.value = statusField.value;
  filter.value = {
    priorities: priorities.value,
    query: query.value || null,
    assignee: assignee.value || null,
  };
  loadTasks(true);
}, 300);

watch(filterData, syncFilterDataAndReload, { deep: true });

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

function handleSortChange(field) {
  sortField.value = field;
  filterHandler({ sortKeys: field });
}

function handleSortDirectionChange(direction) {
  filterHandler({ sortDir: direction });
}

/**
 * Navigate to the task details view.
 * @param {Object} task - The task object.
 */
function viewDetails(task) {
  router.push({
    name: 'TaskDetails',
    params: { taskId: task.details.id },
  });
}

/**
 * Opens a modal based on the provided item and type.
 * @param {Object} item - The item to show in the modal.
 * @param {string} type - The type of modal to open.
 */
function openModal(item, type) {
  modalItem.value = item;
  modalType.value = REQUEST_MODAL_TYPES[type];
  bvModal.value.show('request_modal');
}

/**
 * Handles the specified action for a given item.
 * @param {string} action - The action to be performed.
 * @param {Object} item - The item on which the action is to be performed.
 */
function handleAction(action, item) {
  if (action === 'DETAILS') viewDetails(item);
  else openModal(item, action);
}

loadFulfillmentTasksAndUpdateBadge();

</script>
<style lang="scss" scoped>
.dropdown-padding {
  padding: 0 20px;
}
.table-container {
  flex: 1 1 auto;
  min-width: 0 !important;
  min-height: 300px;

  :deep(> div) {
    width: 100%;
  }
}
.fr-table-panel {
  flex: 1 1 0;
  min-width: 0;
}
.toolbar-link-text {
  color: $gray-900;
}
</style>
