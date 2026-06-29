<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <!-- Standalone filter card: shown in the full-page view -->
    <BCard
      v-if="!hideActorFilter"
      class="mb-4">
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
            :dropleft="false"
            :label="$t('common.to')"
            :placeholder="$t('common.to')"
            :show-seconds="false" />
        </BCol>
      </BRow>
      <BRow class="mt-3 align-items-end">
        <BCol>
          <FrField
            v-model="filterEventType"
            name="filterEventType"
            type="string"
            :label="$t('governance.audit.eventType')"
            :placeholder="$t('governance.audit.filterEventTypePlaceholder')" />
        </BCol>
        <BCol>
          <FrField
            v-model="filterActorType"
            name="filterActorType"
            type="select"
            :label="$t('governance.audit.actor')"
            :options="actorTypeOptions"
            :placeholder="$t('governance.audit.selectActorType')" />
        </BCol>
        <BCol v-if="filterActorType === 'user'">
          <FrGovResourceSelect
            :key="'actor-user'"
            name="filterActorUser"
            :resource-path="userResourcePath"
            :resource-function="getManagedResourceList"
            :option-function="actorOptionFunction"
            :query-param-function="actorQueryParamFunction"
            :label="$t('governance.audit.actorUser')"
            :set-initial-value="false"
            @input="onActorResourceSelected" />
        </BCol>
        <BCol v-else-if="filterActorType === 'admin'">
          <FrGovResourceSelect
            :key="'actor-admin'"
            name="filterActorAdmin"
            :resource-path="adminResourcePath"
            :resource-function="getManagedResourceList"
            :option-function="actorOptionFunction"
            :query-param-function="actorQueryParamFunction"
            :label="$t('governance.audit.actorAdmin')"
            :set-initial-value="false"
            @input="onActorResourceSelected" />
        </BCol>
      </BRow>
    </BCard>
    <FrAuditLogHistogram
      v-if="hideActorFilter"
      class="px-4 pt-4"
      :from-date="filterFromDate"
      :to-date="filterToDate"
      :extra-params="histogramExtraParams"
      @bar-click="onHistogramBarClick" />
    <FrGovResourceTable
      :class="hideActorFilter ? 'pl-4' : ''"
      :fields="auditTableFields"
      :grant-type="$t('governance.audit.logs')"
      :items="auditLogList"
      :allow-search="false"
      :loading="isLoading"
      :total-count="auditLogTotalCount"
      show-view-details
      use-field-for-sort
      default-sort-desc
      @load-data="onTableLoadData">
      <!-- Embedded mode: exports left-aligned, filter toggle right-aligned -->
      <template
        v-if="hideActorFilter"
        #toolbar-left>
        <BButton
          variant="primary"
          :disabled="isExporting"
          @click="exportLogs('xlsx')">
          <FrIcon
            icon-class="mr-1"
            name="download" />
          {{ $t('governance.audit.exportXlsx') }}
        </BButton>
        <BButton
          class="ml-2"
          variant="outline-secondary"
          :disabled="isExporting"
          @click="exportLogs('pdf')">
          <FrIcon
            icon-class="mr-1"
            name="picture_as_pdf" />
          {{ $t('governance.audit.exportPdf') }}
        </BButton>
        <BSpinner
          v-if="isExporting"
          class="ml-2"
          small />
      </template>
      <template #toolbar-actions>
        <!-- Full-page mode: exports right-aligned -->
        <template v-if="!hideActorFilter">
          <BButton
            variant="primary"
            :disabled="isExporting"
            @click="exportLogs('xlsx')">
            <FrIcon
              icon-class="mr-1"
              name="download" />
            {{ $t('governance.audit.exportXlsx') }}
          </BButton>
          <BButton
            class="ml-2"
            variant="outline-secondary"
            :disabled="isExporting"
            @click="exportLogs('pdf')">
            <FrIcon
              icon-class="mr-1"
              name="picture_as_pdf" />
            {{ $t('governance.audit.exportPdf') }}
          </BButton>
          <BSpinner
            v-if="isExporting"
            class="ml-2"
            small />
        </template>
        <!-- Embedded mode: filter toggle right-aligned -->
        <BButton
          v-if="hideActorFilter"
          class="toolbar-link-text"
          :pressed="filtersExpanded"
          variant="link"
          :aria-expanded="filtersExpanded ? 'true' : 'false'"
          aria-controls="audit-table-filter-collapse"
          @click="filtersExpanded = !filtersExpanded">
          <FrIcon
            icon-class="mr-lg-2"
            name="filter_list">
            <span class="d-none d-lg-inline">
              {{ filtersExpanded ? $t('governance.hideFilters') : $t('governance.showFilters') }}
            </span>
          </FrIcon>
        </BButton>
      </template>
      <template
        v-if="hideActorFilter"
        #below-toolbar>
        <BCollapse
          id="audit-table-filter-collapse"
          :visible="filtersExpanded">
          <div class="px-3 pb-3 pt-1 border-bottom">
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
                  :dropleft="false"
                  :label="$t('common.to')"
                  :placeholder="$t('common.to')"
                  :show-seconds="false" />
              </BCol>
              <BCol>
                <FrField
                  v-model="filterEventType"
                  name="filterEventType"
                  type="string"
                  :label="$t('governance.audit.eventType')"
                  :placeholder="$t('governance.audit.filterEventTypePlaceholder')" />
              </BCol>
              <BCol cols="auto">
                <div class="d-flex align-items-center">
                  <small class="text-muted mr-2">
                    {{ $t('governance.audit.filterType') }}
                  </small>
                  <BFormRadioGroup
                    v-model="filterParamMode"
                    :options="filterParamModeOptions"
                    buttons
                    button-variant="outline-secondary"
                    size="sm"
                    name="filterParamMode" />
                </div>
              </BCol>
            </BRow>
          </div>
        </BCollapse>
      </template>
      <template #cell(actor)="{ item }">
        {{ item.actorDisplayName ?? (item.actor === 'system' ? $t('governance.audit.actorTypes.system') : item.actor) ?? blankValueIndicator }}
      </template>
      <template #cell(eventType)="{ item }">
        {{ item.eventType ?? blankValueIndicator }}
      </template>
      <template #row-details="{ item }">
        <FrAuditLogDetails :log="item" />
      </template>
    </FrGovResourceTable>
  </div>
</template>

<script setup>
import {
  ref, computed, watch, onMounted,
} from 'vue';
import {
  debounce, omit, startCase, uniq,
} from 'lodash';
import dayjs from 'dayjs';
import {
  BButton,
  BCard,
  BCol,
  BCollapse,
  BFormRadioGroup,
  BRow,
  BSpinner,
} from 'bootstrap-vue';
import { getAuditLogs, getAllAuditLogs } from '@forgerock/platform-shared/src/api/governance/AuditApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrAuditLogHistogram from './AuditLogHistogram';
import FrAuditLogDetails from './AuditLogDetails';
import i18n from '@/i18n';
import store from '@/store';

const props = defineProps({
  /** Pre-filter to a specific actor (e.g. when embedded in a user profile page) */
  actorId: {
    type: String,
    default: '',
  },
  /** Pre-filter to a specific target object ID */
  objectId: {
    type: String,
    default: '',
  },
  /** Hides the actor type dropdown and typeaheads (use when actorId is already constrained) */
  hideActorFilter: {
    type: Boolean,
    default: false,
  },
  /** ISO date string pushed from histogram bar click to override the from date filter */
  externalFromDate: {
    type: String,
    default: '',
  },
  /** ISO date string pushed from histogram bar click to override the to date filter */
  externalToDate: {
    type: String,
    default: '',
  },
});

const auditLogList = ref([]);
const auditLogTotalCount = ref(0);
const isLoading = ref(true);
const isExporting = ref(false);
const initialLoadDone = ref(false);

const pad = (n) => String(n).padStart(2, '0');
const formatLocalDatetime = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const initNow = new Date();
const filterFromDate = ref(formatLocalDatetime(new Date(initNow.getTime() - 12 * 60 * 60 * 1000)));
const filterToDate = ref(formatLocalDatetime(initNow));

const emit = defineEmits(['filter-change']);
const filterEventType = ref('');
const filterActorType = ref('all');
const filterActorId = ref('');
const filtersExpanded = ref(false);
const filterParamMode = ref('actor');
const lastTableParams = ref({});

const histogramExtraParams = computed(() => {
  if (!props.actorId) return {};
  return filterParamMode.value === 'objectId'
    ? { objectId: props.actorId }
    : { actor: props.actorId };
});

function onHistogramBarClick({ fromDate, toDate }) {
  filterFromDate.value = formatLocalDatetime(new Date(fromDate));
  filterToDate.value = formatLocalDatetime(new Date(toDate));
}

const actorTypeOptions = computed(() => [
  { value: 'all', text: i18n.global.t('governance.audit.actorTypes.all') },
  { value: 'user', text: i18n.global.t('governance.audit.actorTypes.user') },
  { value: 'admin', text: i18n.global.t('governance.audit.actorTypes.admin') },
  { value: 'system', text: i18n.global.t('governance.audit.actorTypes.system') },
]);

const filterParamModeOptions = computed(() => [
  { value: 'actor', text: i18n.global.t('governance.audit.filterByActor') },
  { value: 'objectId', text: i18n.global.t('governance.audit.filterByObject') },
]);

const userResourcePath = computed(() => `${store.state.realm}_user`);
const adminResourcePath = computed(() => store.state.fraasAdminManagedObjectName || 'alpha_adminuser');

function actorOptionFunction(resource) {
  return {
    text: [resource.givenName, resource.sn].filter(Boolean).join(' ') || resource.userName || resource._id,
    value: resource._id,
  };
}

function actorQueryParamFunction(queryString) {
  const params = { pageSize: 10, fields: 'givenName,sn,userName,_id' };
  if (queryString) {
    params.queryFilter = `givenName sw "${queryString}" or sn sw "${queryString}" or userName sw "${queryString}"`;
  } else {
    params.queryFilter = 'true';
  }
  return params;
}

function onActorResourceSelected(resourcePath) {
  filterActorId.value = resourcePath ? resourcePath.split('/').pop() : '';
}

const auditTableFields = computed(() => [
  {
    key: 'timestamp',
    label: i18n.global.t('governance.audit.timestamp'),
    sortable: true,
    class: `${props.hideActorFilter ? 'w-300px' : 'w-250px'} text-truncate`,
  },
  ...(!props.hideActorFilter ? [{
    key: 'actor',
    label: i18n.global.t('governance.audit.actor'),
    class: 'w-200px text-truncate',
  }] : []),
  {
    key: 'eventType',
    label: i18n.global.t('governance.audit.eventType'),
    class: `${props.hideActorFilter ? 'w-250px' : 'w-200px'} text-truncate`,
  },
  {
    key: 'displayName',
    label: i18n.global.t('common.displayName'),
    class: 'w-200px text-truncate',
  },
  {
    key: 'actions',
    label: '',
    class: 'w-100px col-actions',
  },
]);

/**
 * Formats an ISO timestamp string for table display.
 * @param {string} ts - ISO timestamp
 * @returns {string}
 */
function formatTimestamp(ts) {
  return ts ? dayjs(ts).format('MMM DD, YYYY h:mm:ss A') : '';
}

/**
 * Transforms a raw audit record into a display-ready shape.
 * @param {Object} record - Raw API audit record
 * @returns {Object}
 */
function transformAuditRecord(record) {
  return {
    ...record,
    timestamp: formatTimestamp(record.timestamp),
    eventType: record.eventType ? startCase(record.eventType) : null,
  };
}

function formatActorDisplayName(user) {
  return [user.givenName, user.sn].filter(Boolean).join(' ') || user.userName || user._id;
}

async function fetchActorMap(resourceName, ids) {
  if (!ids.length) return {};
  const queryFilter = ids.map((id) => `_id eq "${id}"`).join(' or ');
  try {
    const { data } = await getManagedResourceList(resourceName, {
      queryFilter,
      fields: '_id,givenName,sn,userName',
      pageSize: ids.length,
    });
    return Object.fromEntries((data.result || []).map((u) => [u._id, u]));
  } catch {
    return {};
  }
}

async function enrichActors(records) {
  const extractIds = (prefix) => uniq(
    records.map((r) => r.actor).filter((a) => a?.startsWith(prefix)),
  ).map((a) => a.split('/').pop());

  const adminResourceName = store.state.fraasAdminManagedObjectName || 'alpha_adminuser';
  const adminPrefix = `managed/${adminResourceName}/`;

  const userIds = extractIds('managed/user/');
  const adminIds = extractIds(adminPrefix);

  const [userMap, adminMap] = await Promise.all([
    fetchActorMap(`${store.state.realm}_user`, userIds),
    fetchActorMap(adminResourceName, adminIds),
  ]);

  return records.map((r) => {
    if (r.actor?.startsWith('managed/user/')) {
      const user = userMap[r.actor.split('/').pop()];
      return user ? { ...r, actorDisplayName: formatActorDisplayName(user) } : r;
    }
    if (r.actor?.startsWith(adminPrefix)) {
      const admin = adminMap[r.actor.split('/').pop()];
      return admin ? { ...r, actorDisplayName: formatActorDisplayName(admin) } : r;
    }
    return r;
  });
}

/**
 * Builds a SCIM-style date range filter from the from/to date refs.
 * Appends .000Z to timezone-naive strings emitted by FrField datetime.
 * @returns {string}
 */
function buildDateRangeParams() {
  const params = {};
  if (filterFromDate.value) params.startDate = new Date(filterFromDate.value).toISOString();
  if (filterToDate.value) params.endDate = new Date(filterToDate.value).toISOString();
  return params;
}

/**
 * Merges all active filter params (dates, free-text fields, prop-driven ids).
 * @param {Object} params
 * @returns {Object}
 */
function applyCardFilters(params) {
  const extra = { ...buildDateRangeParams() };
  if (filterEventType.value) extra.eventType = filterEventType.value;
  if (props.actorId) {
    if (filterParamMode.value === 'objectId') {
      extra.objectId = props.actorId;
    } else {
      extra.actor = props.actorId;
    }
  } else if (filterActorType.value === 'system') {
    extra.actor = 'system';
  } else if (filterActorId.value && filterActorType.value === 'user') {
    extra.actor = `managed/user/${filterActorId.value}`;
  } else if (filterActorId.value && filterActorType.value === 'admin') {
    extra.actor = `managed/${adminResourcePath.value}/${filterActorId.value}`;
  }
  if (props.objectId) extra.objectId = props.objectId;
  return { ...params, ...extra };
}

/**
 * Fetches one page of audit logs. Converts GovResourceTable's 0-based pageNumber to the
 * API's 1-based page param.
 * @param {Object} params - Table query params (pageSize, pageNumber, sortBy, sortDir, queryFilter)
 */
async function queryAuditLogs(params = {}) {
  lastTableParams.value = params;
  isLoading.value = true;

  const queryParams = { ...params };

  if (queryParams.sortBy) {
    queryParams.sortKeys = `${queryParams.sortDir !== 'asc' ? '-' : ''}${queryParams.sortBy}`;
    if (queryParams.sortBy === 'timestamp') queryParams.sortType = 'date';
  }

  // GovResourceTable emits 0-based pageNumber; API expects 1-based page
  if (queryParams.pageNumber != null) {
    queryParams.page = queryParams.pageNumber + 1;
  }

  const finalParams = omit(queryParams, ['sortBy', 'sortDir', 'grantType', 'paginationPage', 'pageNumber', 'pagedResultsOffset']);

  try {
    const { data } = await getAuditLogs(finalParams);
    const transformed = data?.result?.map(transformAuditRecord) ?? [];
    auditLogList.value = await enrichActors(transformed);
    auditLogTotalCount.value = data?.totalCount ?? 0;
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.audit.auditLogsFailedToLoad'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * GovResourceTable load-data event handler. Deferred until onMounted completes the
 * first load so GovResourceTable's own mounted load-data is ignored.
 * @param {Object} params
 */
function onTableLoadData(params) {
  if (!initialLoadDone.value) return;
  const { queryFilter: _drop, ...cleanParams } = params;
  queryAuditLogs(applyCardFilters({ ...cleanParams }));
}

/**
 * Debounced filter-change handler. Resets to page 1 when any filter changes.
 */
const onFilterChanged = debounce(() => {
  const tableParams = omit(lastTableParams.value, ['queryFilter', 'startDate', 'endDate', 'actor', 'eventType', 'objectId']);
  queryAuditLogs(applyCardFilters({ ...tableParams, pageNumber: 0 }));
}, 400);

/**
 * Fetches up to 10k records with current filters and triggers a file download.
 * @param {'xlsx'|'pdf'} format
 */
async function exportLogs(format) {
  isExporting.value = true;
  try {
    const tableParams = omit(lastTableParams.value, ['queryFilter', 'startDate', 'endDate', 'actor', 'eventType', 'objectId']);
    const exportParams = applyCardFilters({ ...tableParams });
    const finalParams = omit(exportParams, ['sortBy', 'sortDir', 'grantType', 'paginationPage', 'pageNumber', 'pagedResultsOffset', 'pageSize']);

    const maxRows = format === 'pdf' ? 1000 : 10000;
    const rawRecords = await getAllAuditLogs(finalParams, maxRows);
    const records = await enrichActors(rawRecords.map(transformAuditRecord));

    const rows = records.map((r) => ({
      [i18n.global.t('governance.audit.timestamp')]: r.timestamp,
      [i18n.global.t('governance.audit.actor')]: r.actorDisplayName ?? r.actor ?? '',
      [i18n.global.t('governance.audit.eventType')]: r.eventType ?? '',
      [i18n.global.t('common.displayName')]: r.displayName ?? '',
      [i18n.global.t('governance.audit.details.fields.path')]: r.objectDisplayName ?? '',
      [i18n.global.t('governance.audit.details.fields.objectType')]: r.objectType ?? '',
      [i18n.global.t('governance.audit.details.fields.action')]: r.action ?? '',
    }));

    const title = i18n.global.t('governance.audit.exportTitle');
    downloadAsType(rows, format, `${title}.${format}`, title);
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.audit.exportFailed'));
  } finally {
    isExporting.value = false;
  }
}

watch([() => props.externalFromDate, () => props.externalToDate], ([newFrom, newTo]) => {
  if (newFrom) filterFromDate.value = formatLocalDatetime(new Date(newFrom));
  if (newTo) filterToDate.value = formatLocalDatetime(new Date(newTo));
});

// When actorType changes, clear the selected actor ID so stale filters don't carry over
watch(filterActorType, () => { filterActorId.value = ''; });

function buildFilterChangePayload() {
  const payload = { fromDate: filterFromDate.value, toDate: filterToDate.value };
  if (filterActorType.value === 'system') {
    payload.extraParams = { actor: 'system' };
  } else if (filterActorId.value && filterActorType.value === 'user') {
    payload.extraParams = { actor: `managed/user/${filterActorId.value}` };
  } else if (filterActorId.value && filterActorType.value === 'admin') {
    payload.extraParams = { actor: `managed/${adminResourcePath.value}/${filterActorId.value}` };
  } else {
    payload.extraParams = {};
  }
  return payload;
}

watch([filterFromDate, filterToDate, filterEventType, filterActorType, filterActorId, filterParamMode], () => {
  emit('filter-change', buildFilterChangePayload());
  if (initialLoadDone.value) onFilterChanged();
});

onMounted(async () => {
  emit('filter-change', buildFilterChangePayload());
  await queryAuditLogs(applyCardFilters({
    pageSize: 10, pageNumber: 0, sortBy: 'timestamp', sortDir: 'desc',
  }));
  initialLoadDone.value = true;
});
</script>

<style lang="scss" scoped>
.toolbar-link-text {
  color: $gray-900;
}
</style>
