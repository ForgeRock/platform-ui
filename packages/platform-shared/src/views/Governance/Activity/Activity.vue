<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard class="mb-4">
      <BRow class="align-items-end">
        <BCol>
          <label class="text-muted mb-1">
            {{ $t('common.from') }}
          </label>
          <FrField
            v-model="filterFromDate"
            name="filterFromDate"
            type="datetime"
            :adjust-for-timezone="false"
            :dropleft="false"
            :placeholder="$t('common.from')"
            :show-seconds="false" />
        </BCol>
        <BCol>
          <label class="text-muted mb-1">
            {{ $t('common.to') }}
          </label>
          <FrField
            v-model="filterToDate"
            name="filterToDate"
            type="datetime"
            :adjust-for-timezone="false"
            :dropleft="false"
            :placeholder="$t('common.to')"
            :show-seconds="false" />
        </BCol>
        <BCol>
          <FrTimezoneOffset
            v-model="filterTimezoneOffset"
            :display-help-text="false"
            :placeholder="$t('common.placeholders.timeZoneOffset')" />
        </BCol>
      </BRow>
      <BRow class="mt-3">
        <BCol>
          <FrSearchInput
            v-model="filterSearchQuery"
            :placeholder="$t('common.search')"
            @clear="onSearchClear" />
        </BCol>
      </BRow>
    </BCard>
    <FrGovResourceTable
      :fields="activityTableFields"
      :grant-type="$t('governance.activity.logs')"
      :items="activityLogList"
      :parent-resource-name="parentResourceName"
      show-view-details
      use-field-for-sort
      default-sort-desc
      :allow-search="false"
      :loading="activityIsLoading"
      :total-count="activityLogTotalCount"
      @load-data="onTableLoadData">
      <template #cell(actor)="{ item }">
        <p class="mb-0">
          {{ item.actor?.display_name }} <span class="text-muted">({{ item.actor?.actor_type }})</span>
        </p>
        <small class="text-muted">{{ item.environment?.source_ip }}</small>
      </template>
      <template #cell(event_type)="{ item }">
        {{ startCase(item.event_type) }}
      </template>
      <template #cell(outcome)="{ item }">
        <BBadge :variant="getOutcomeVariant(item.outcome)">
          {{ capitalize(item.outcome) }}
        </BBadge>
      </template>
      <template #row-details="{ item }">
        <FrActivityLogDetails :log="item" />
      </template>
    </FrGovResourceTable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  capitalize,
  debounce,
  omit,
  startCase,
} from 'lodash';
import dayjs from 'dayjs';
import {
  BBadge,
  BCard,
  BCol,
  BRow,
} from 'bootstrap-vue';
import { getActivityLogs } from '@forgerock/platform-shared/src/api/governance/ActivityApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrTimezoneOffset from '@forgerock/platform-shared/src/components/TimezoneOffset';
import FrActivityLogDetails from './ActivityLogDetails';
import activityConstants from './activityConstants';
import i18n from '@/i18n';

const props = defineProps({
  objectId: {
    type: String,
    default: '',
  },
  objectTypes: {
    type: Array,
    default: () => [],
  },
  parentResourceName: {
    type: String,
    default: '',
  },
});

const activityLogList = ref([]);
const activityLogTotalCount = ref(0);
const activityIsLoading = ref(true);

const filterFromDate = ref('');
const filterToDate = ref('');
const filterTimezoneOffset = ref(0);
const filterSearchQuery = ref('');
const lastTableParams = ref({});

const activityTableFields = [
  {
    key: 'event_time',
    label: i18n.global.t('common.time'),
    sortable: true,
    class: 'w-25',
  },
  {
    key: 'actor',
    label: i18n.global.t('governance.activity.user'),
    sortable: true,
    class: 'w-25',
  },
  {
    key: 'event_type',
    label: i18n.global.t('governance.activity.eventType'),
    class: 'w-25',
  },
  {
    key: 'outcome',
    label: i18n.global.t('common.outcome'),
    class: 'w-25',
  },
  {
    key: 'actions',
    label: '',
    class: 'col-actions',
  },
];

/**
 * Returns the Bootstrap badge variant for a given outcome value.
 * @param {string} outcome - The outcome string from the activity log
 * @returns {string} Bootstrap variant name
 */
function getOutcomeVariant(outcome) {
  const normalizedOutcome = outcome?.toLowerCase();
  const match = Object.keys(activityConstants.OUTCOME_VARIANT)
    .find((variant) => activityConstants.OUTCOME_VARIANT[variant].includes(normalizedOutcome));
  return match || 'light';
}

/**
 * Formats the event_time field of an activity log entry to a human-readable string.
 * @param {Object} log - Raw activity log entry from the API
 * @returns {Object} The log entry with event_time formatted as 'MMM DD, YYYY h:mm:ss A'
 */
function transformActivityLog(log) {
  return {
    ...log,
    event_time: dayjs(log.event_time).format('MMM DD, YYYY h:mm:ss A'),
  };
}

/**
 * Converts a table field key to the corresponding API sort key.
 * @param {string} fieldKey - The field key from the table column definition
 * @returns {string} The API sort key for the given field
 */
function convertSortKey(fieldKey) {
  const sortKeyMap = {
    event_time: 'event_time',
    actor: 'actor.display_name',
  };
  return sortKeyMap[fieldKey] ?? fieldKey;
}

/**
 * Converts a table field key to the corresponding API sort key.
 * @param {string} fieldKey - The field key from the table column definition
 * @returns {boolean} True if the field should be sorted as a date, false otherwise
 */
function isSortByDate(fieldKey) {
  const dateFields = ['event_time'];
  return dateFields.includes(fieldKey);
}

/**
 * Fetches activity logs from the API, applying filters for objectId and objectTypes if provided.
 * Handles search, sort, and pagination params passed from GovResourceTable.
 * @param {Object} params - Query parameters from the table component
 * @param {string} [params.queryFilter] - Additional filter clause to AND with the object/type conditions
 * @param {string} [params.sortBy] - Field name to sort by
 * @param {string} [params.sortDir] - Sort direction ('asc' or 'desc')
 * @param {number} [params.pageSize] - Number of results per page
 * @param {number} [params.pageNumber] - Zero-based page number
 */
async function queryActivity(params = {}) {
  lastTableParams.value = params;
  activityIsLoading.value = true;
  const queryParams = { ...params };
  const conditions = [];
  if (props.objectId) {
    conditions.push(`object_id eq "${props.objectId}"`);
  }
  if (props.objectTypes.length === 1) {
    conditions.push(`object_type eq "${props.objectTypes[0]}"`);
  } else if (props.objectTypes.length > 1) {
    const typeConditions = props.objectTypes.map((t) => `object_type eq "${t}"`).join(' or ');
    conditions.push(`(${typeConditions})`);
  }

  const allConditions = [
    conditions.length ? `(${conditions.join(' and ')})` : null,
    queryParams.queryFilter || null,
  ].filter(Boolean);

  if (allConditions.length) {
    queryParams.queryFilter = allConditions.join(' and ');
  }

  if (queryParams.sortBy) {
    if (isSortByDate(queryParams.sortBy)) {
      queryParams.sortType = 'date';
    }
    queryParams.sortKeys = `${queryParams.sortDir !== 'asc' ? '-' : ''}${convertSortKey(queryParams.sortBy)}`;
  }

  if (queryParams.pageNumber != null && queryParams.pageSize != null) {
    queryParams.pagedResultsOffset = queryParams.pageNumber * queryParams.pageSize;
    delete queryParams.pageNumber;
  }

  const finalQueryParams = omit(queryParams, ['sortBy', 'sortDir', 'grantType', 'paginationPage']);
  try {
    const { data } = await getActivityLogs(finalQueryParams);
    activityLogList.value = data?.result?.map(transformActivityLog);
    activityLogTotalCount.value = data?.totalCount;
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.activity.activityLogsFailedToLoad'));
  } finally {
    activityIsLoading.value = false;
  }
}

/**
 * Converts a local datetime string to a UTC ISO string by subtracting the given timezone offset.
 * @param {string} localDatetime - Local datetime string without timezone info (e.g. '2026-05-01T09:00:00')
 * @param {number} offsetHours - Timezone offset in hours relative to UTC (e.g. -5, 5.5)
 * @returns {string} UTC ISO string (e.g. '2026-05-01T14:00:00.000Z')
 */
function toUtcString(localDatetime, offsetHours) {
  return new Date(dayjs(localDatetime).subtract(offsetHours, 'hour').valueOf()).toISOString();
}

/**
 * Builds a queryFilter string from the current date range inputs, applying the selected timezone
 * offset to convert local times to UTC before querying event_time.
 * @returns {string} One or two filter clauses joined by ' and ', or an empty string if no dates are set
 */
function buildDateRangeFilter() {
  const clauses = [];
  if (filterFromDate.value) {
    clauses.push(`event_time gte '${toUtcString(filterFromDate.value, filterTimezoneOffset.value)}'`);
  }
  if (filterToDate.value) {
    clauses.push(`event_time lte '${toUtcString(filterToDate.value, filterTimezoneOffset.value)}'`);
  }
  return clauses.join(' and ');
}

/**
 * Builds a queryFilter clause from the current search query, matching against
 * actor.display_name, actor.email, and event_type using OR.
 * @returns {string} Filter clause string, or empty string if no search query is set
 */
function buildSearchFilter() {
  if (!filterSearchQuery.value) return '';
  const q = filterSearchQuery.value.replace(/'/g, "\\'");
  return `(actor.display_name co '${q}' or actor.email co '${q}' or event_type co '${q}')`;
}

/**
 * Merges the current card filter values (date range + search) into the given params object.
 * @param {Object} params - Base query params to merge filters into
 * @returns {Object} Params with queryFilter set to the combined filter string
 */
function applyCardFilters(params) {
  const allFilters = [buildDateRangeFilter(), buildSearchFilter()].filter(Boolean);
  if (allFilters.length) {
    params.queryFilter = [params.queryFilter, ...allFilters].filter(Boolean).join(' and ');
  }
  return params;
}

/**
 * Handler for the table's load-data event. Merges card filter state into the table's
 * params so pagination and sort changes respect the active filters.
 * @param {Object} params - Query parameters from the table component
 */
function onTableLoadData(params) {
  queryActivity(applyCardFilters({ ...params }));
}

/**
 * Called whenever any filter input changes (date, time, timezone, or search).
 * Rebuilds the date range and search filters and re-runs the query from page 1, preserving current sort state.
 * Debounced to prevent excessive API calls when dragging the timezone slider.
 */
const onFilterChanged = debounce(() => {
  const { queryFilter: _dropped, ...tableParams } = lastTableParams.value;
  queryActivity(applyCardFilters({ ...tableParams, pageNumber: 0, pagedResultsOffset: 0 }));
}, 400);

/**
 * Clears the search query and re-runs the filter so the table reflects the cleared state.
 */
function onSearchClear() {
  filterSearchQuery.value = '';
  onFilterChanged();
}

watch([filterFromDate, filterToDate, filterTimezoneOffset, filterSearchQuery], onFilterChanged);
</script>
