<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrHeader
        :title="$t('governance.notifications.title')"
        :subtitle="$t('governance.notifications.subtitle')" />
      <BCard class="mb-4">
        <BRow class="align-items-end">
          <BCol>
            <FrField
              v-model="filterFromDate"
              name="filterFromDate"
              type="datetime"
              :adjust-for-timezone="false"
              :dropleft="false"
              :label="$t('common.from')"
              :placeholder="$t('common.from')"
              :show-seconds="false" />
          </BCol>
          <BCol>
            <FrField
              v-model="filterToDate"
              name="filterToDate"
              type="datetime"
              :adjust-for-timezone="false"
              :dropleft="true"
              :label="$t('common.to')"
              :placeholder="$t('common.to')"
              :show-seconds="false" />
          </BCol>
        </BRow>
        <BRow class="mt-3">
          <BCol>
            <BButton
              class="p-0"
              variant="link"
              aria-controls="advanced-filters-collapse"
              :aria-expanded="advancedExpanded ? 'true' : 'false'"
              @click="advancedExpanded = !advancedExpanded">
              <FrIcon
                :name="advancedExpanded ? 'expand_less' : 'expand_more'"
                icon-class="mr-1" />
              {{ advancedExpanded ? $t('governance.notifications.hideAdvancedFilters') : $t('governance.notifications.showAdvancedFilters') }}
            </BButton>
          </BCol>
        </BRow>
        <BCollapse
          id="advanced-filters-collapse"
          :visible="advancedExpanded">
          <BRow class="mt-3 align-items-end">
            <BCol md="3">
              <FrField
                v-model="filterContextType"
                name="filterContextType"
                type="select"
                :label="$t('governance.notifications.objectType')"
                :options="contextTypeOptions"
                :placeholder="$t('governance.notifications.selectContextType')" />
            </BCol>
            <BCol
              v-if="filterContextType && filterContextType !== 'all'"
              md="4">
              <FrField
                v-model="filterContextId"
                name="filterContextId"
                type="string"
                :label="$t('common.id')"
                :placeholder="$t('governance.notifications.searchContextId', { type: filterContextType })" />
            </BCol>
          </BRow>
        </BCollapse>
      </BCard>
      <BCard
        no-body
        class="card-tabs-vertical">
        <BTabs
          v-model="selectedTab"
          content-class="overflow-hidden position-inherit"
          nav-wrapper-class="d-none d-md-block notification-tabs"
          pills
          vertical
          @activate-tab="tabActivated">
          <BTab
            v-for="(tab, index) in tabItems"
            :key="tab.key"
            :title="tab.displayName"
            class="nav-item">
            <template v-if="selectedTab === index">
              <!-- TODO: grant-type should receive a non-translated identifier string, not a
                   translated label. This matches the existing broken pattern in AgentsDetails
                   (IGA-4213 follow-up). -->
              <FrGovResourceTable
                :fields="notificationTableFields"
                :grant-type="$t('governance.notifications.title')"
                :items="notificationTaskList"
                :allow-search="false"
                :loading="isLoading"
                :total-count="notificationTaskTotalCount"
                show-view-details
                use-field-for-sort
                default-sort-desc
                default-sort-by="createdOn"
                @load-data="onTableLoadData">
                <template #cell(comments)="{ item }">
                  <div
                    v-if="getSystemMessageCount(item)"
                    class="d-flex justify-content-start align-items-center">
                    <BButton
                      class="text-dark position-relative py-0"
                      variant="link"
                      :aria-label="$t('governance.notifications.viewSystemMessages', { count: getSystemMessageCount(item) })"
                      @click="openSystemMessagesModal(item)">
                      <FrIcon
                        icon-class="md-24"
                        name="notes" />
                      <BBadge
                        class="mr-1 position-absolute comments-counter"
                        pill
                        variant="danger">
                        {{ getSystemMessageCount(item) }}
                      </BBadge>
                    </BButton>
                  </div>
                  <span
                    v-else
                    class="text-muted">
                    {{ blankValueIndicator }}
                  </span>
                </template>
                <template #row-details="{ item }">
                  <FrNotificationDetails :task="item" />
                </template>
              </FrGovResourceTable>
            </template>
          </BTab>
        </BTabs>
      </BCard>
      <FrNotificationMessagesModal
        :modal-id="systemMessagesModalId"
        :system-messages="selectedSystemMessages"
        @close-modal="selectedSystemMessages = []" />
    </div>
  </BContainer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { debounce, omit } from 'lodash';
import dayjs from 'dayjs';
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BCollapse,
  BContainer,
  BRow,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getNotificationTasks } from '@forgerock/platform-shared/src/api/governance/NotificationTaskApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNotificationDetails from './NotificationDetails';
import FrNotificationMessagesModal from './NotificationMessagesModal';
import i18n from '@/i18n';

const tabItems = computed(() => [
  { key: 'complete', displayName: i18n.global.t('governance.notifications.statuses.complete'), statusFilter: 'status eq "complete"' },
  { key: 'pending', displayName: i18n.global.t('governance.notifications.statuses.pending'), statusFilter: 'status eq "pending"' },
  { key: 'failed', displayName: i18n.global.t('governance.notifications.statuses.failed'), statusFilter: 'status eq "failed"' },
]);

const notificationTaskList = ref([]);
const notificationTaskTotalCount = ref(0);
const isLoading = ref(true);
const selectedSystemMessages = ref([]);
const systemMessagesModalId = 'NotificationMessagesModal';
const { bvModal } = useBvModal();

const selectedTab = ref(0);

const filterFromDate = ref('');
const filterToDate = ref('');
const advancedExpanded = ref(false);
const filterContextType = ref(null);
const filterContextId = ref('');
const lastTableParams = ref({});

const contextTypeOptions = computed(() => [
  { value: 'all', text: i18n.global.t('governance.notifications.contextTypes.all') },
  { value: 'campaign', text: i18n.global.t('governance.notifications.contextTypes.campaign') },
  { value: 'request', text: i18n.global.t('governance.notifications.contextTypes.request') },
  { value: 'violation', text: i18n.global.t('governance.notifications.contextTypes.violation') },
]);

const activeTabKey = computed(() => tabItems.value[selectedTab.value]?.key ?? 'pending');

const notificationTableFields = computed(() => [
  {
    key: 'createdOn',
    label: i18n.global.t('governance.notifications.createdOn'),
    sortable: true,
    class: 'w-200px text-truncate',
  },
  {
    key: 'sendDate',
    label: i18n.global.t('governance.notifications.sendDate'),
    sortable: activeTabKey.value === 'pending' || activeTabKey.value === 'complete',
    class: 'w-200px text-truncate',
  },
  {
    key: 'template',
    label: i18n.global.t('governance.notifications.template'),
    class: 'w-120px text-truncate',
  },
  {
    key: 'recipient',
    label: i18n.global.t('governance.notifications.recipient'),
    class: 'text-truncate',
  },
  {
    key: 'comments',
    label: i18n.global.t('governance.notifications.messages'),
    class: 'w-100px',
  },
  {
    key: 'actions',
    label: '',
    class: 'w-100px col-actions',
  },
]);

/**
 * Formats a date string for display in the table.
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted date or empty string if falsy
 */
function formatDate(dateString) {
  return dateString ? dayjs(dateString).format('MMM DD, YYYY h:mm:ss A') : '';
}

/**
 * Returns the display value for the sendDate column based on task status.
 * Pending tasks use task.date; complete tasks use metadata.modifiedDate;
 * all other statuses show the blank indicator.
 * @param {Object} task - Raw notification task object
 * @returns {string} Formatted send date or blankValueIndicator
 */
function getSendDate(task) {
  if (task.status === 'pending') return formatDate(task.date);
  if (task.status === 'complete') return formatDate(task.metadata?.modifiedDate);
  return blankValueIndicator;
}

/**
 * Flattens a raw API task into a shape suitable for the table, hoisting
 * taskData.template, taskData.to, and computed date fields to the top level.
 * @param {Object} task - Raw notification task from the API
 * @returns {Object} Transformed task with display fields added
 */
function transformNotificationTask(task) {
  return {
    ...task,
    template: task.taskData?.template,
    recipient: task.taskData?.to,
    createdOn: formatDate(task.metadata?.createdDate),
    sendDate: getSendDate(task),
  };
}

/**
 * Returns the number of system messages attached to a task.
 * @param {Object} task - Transformed notification task
 * @returns {number} Count of system messages, or 0 if absent
 */
function getSystemMessageCount(task) {
  return task.systemMessages?.length ?? 0;
}

/**
 * Populates selectedSystemMessages and opens the system messages modal for a task.
 * @param {Object} task - Transformed notification task
 */
function openSystemMessagesModal(task) {
  selectedSystemMessages.value = task.systemMessages ?? [];
  bvModal.value.show(systemMessagesModalId);
}

/**
 * Builds a SCIM-style date range filter clause from the from/to date filter refs.
 * @returns {string} Filter string (e.g. "metadata.createdDate gte '...' and metadata.createdDate lte '...'"), or empty string
 */
function buildDateRangeFilter() {
  const clauses = [];
  if (filterFromDate.value) {
    const from = filterFromDate.value.endsWith('Z') ? filterFromDate.value : `${filterFromDate.value}.000Z`;
    clauses.push(`metadata.createdDate gte '${from}'`);
  }
  if (filterToDate.value) {
    const to = filterToDate.value.endsWith('Z') ? filterToDate.value : `${filterToDate.value}.000Z`;
    clauses.push(`metadata.createdDate lte '${to}'`);
  }
  return clauses.join(' and ');
}

/**
 * Builds a SCIM-style context filter from the context type and ID filter refs.
 * Single quotes in the ID are escaped to prevent filter injection.
 * When a type is selected but no ID is entered, co '' matches any record that
 * has a value for that context field, filtering out unrelated notification types.
 * @returns {string} Filter string, or empty string if no type is selected
 */
function buildContextFilter() {
  const type = filterContextType.value;
  if (!type || type === 'all') return '';
  if (!filterContextId.value) return `context.${type} co ''`;
  const id = filterContextId.value.replace(/'/g, "\\'");
  return `context.${type} eq '${id}'`;
}

/**
 * Merges the active tab status filter, date range filter, and context filter
 * into the query params object, ANDing them together with any existing queryFilter.
 * @param {Object} params - Table query params to augment
 * @returns {Object} The same params object with queryFilter updated
 */
function applyCardFilters(params) {
  const tabStatusFilter = tabItems.value[selectedTab.value]?.statusFilter ?? '';
  const allFilters = [buildDateRangeFilter(), tabStatusFilter, buildContextFilter()].filter(Boolean);
  if (!allFilters.length) return { ...params };
  return {
    ...params,
    queryFilter: [params.queryFilter, ...allFilters].filter(Boolean).join(' and '),
  };
}

/**
 * Returns the API field name used to sort the sendDate column for the active tab.
 * Returns null for tabs where sendDate is not sortable (e.g. failed).
 * @returns {string|null} API sort field name, or null
 */
function getSendDateSortKey() {
  if (activeTabKey.value === 'pending') return 'date';
  if (activeTabKey.value === 'complete') return 'metadata.modifiedDate';
  return null;
}

/**
 * Fetches notification tasks from the API with the given query params, mapping
 * UI sort keys to API field names and converting pageNumber to pagedResultsOffset.
 * @param {Object} [params={}] - Query params from GovResourceTable (sortBy, sortDir, pageNumber, pageSize, etc.)
 */
async function queryNotificationTasks(params = {}) {
  lastTableParams.value = params;
  isLoading.value = true;
  const queryParams = { ...params };

  if (queryParams.sortBy) {
    const sendDateKey = getSendDateSortKey();
    const sortKeyMap = { createdOn: 'metadata.createdDate', ...(sendDateKey ? { sendDate: sendDateKey } : {}) };
    const apiSortKey = sortKeyMap[queryParams.sortBy] ?? queryParams.sortBy;
    queryParams.sortKeys = `${queryParams.sortDir !== 'asc' ? '-' : ''}${apiSortKey}`;
    if (['createdOn', 'sendDate'].includes(queryParams.sortBy)) queryParams.sortType = 'date';
  }

  if (queryParams.pageNumber != null && queryParams.pageSize != null) {
    queryParams.pagedResultsOffset = queryParams.pageNumber * queryParams.pageSize;
    delete queryParams.pageNumber;
  }

  const finalQueryParams = omit(queryParams, ['sortBy', 'sortDir', 'grantType', 'paginationPage']);
  try {
    const { data } = await getNotificationTasks(finalQueryParams);
    notificationTaskList.value = data?.result?.map(transformNotificationTask) ?? [];
    notificationTaskTotalCount.value = data?.totalCount ?? 0;
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.notifications.notificationTasksFailedToLoad'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Handler for the GovResourceTable load-data event. Applies card filters before fetching.
 * @param {Object} params - Query params emitted by GovResourceTable
 */
function onTableLoadData(params) {
  queryNotificationTasks(applyCardFilters({ ...params }));
}

/**
 * Debounced handler that re-fetches tasks when any filter field changes,
 * resetting pagination to the first page and dropping any stale queryFilter.
 */
const onFilterChanged = debounce(() => {
  const { queryFilter: _dropped, ...tableParams } = lastTableParams.value;
  queryNotificationTasks(applyCardFilters({ ...tableParams, pageNumber: 0, pagedResultsOffset: 0 }));
}, 400);

/**
 * Handler for the BTabs activate-tab event. Updates the selected tab index so that
 * the v-if on the tab content toggles, unmounting and remounting GovResourceTable.
 * GovResourceTable.mounted() emits load-data, which flows through onTableLoadData
 * and applies the new tab's status filter — no explicit fetch is needed here.
 * @param {number} newTab - Index of the newly activated tab
 */
function tabActivated(newTab) {
  selectedTab.value = newTab;
}

// Single watcher handles all filter fields. When contextType changes, contextId is
// cleared inside the same callback, which triggers the watcher a second time (because
// filterContextId is in the watched array), queuing a second debounce call. The debounce
// collapses both invocations into a single API call.
watch([filterFromDate, filterToDate, filterContextType, filterContextId], ([, , newType], [, , oldType]) => {
  if (newType !== oldType) filterContextId.value = '';
  onFilterChanged();
});
</script>

<style lang="scss" scoped>
.comments-counter {
  right: 0.25rem;
  top: -0.25rem;
}

:deep(.notification-tabs) {
  min-width: 160px;
  max-width: 160px;
}
</style>
