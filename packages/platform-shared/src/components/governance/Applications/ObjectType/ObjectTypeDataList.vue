<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center px-4 py-2 border-bottom">
      <FrSearchInput
        v-model="searchValue"
        class="w-300px"
        :placeholder="$t('common.search')"
        @input="onSearch" />
      <FrListOrganizer
        v-model="availableColumns"
        :column-organizer-key="columnOrganizerKey"
        @list-updated="onColumnsUpdated" />
    </div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <template v-else>
      <div
        v-if="tableData.length"
        class="table-responsive">
        <BTable
          class="mb-0"
          :fields="activeFields"
          :items="tableData"
          :sort-by="sortBy"
          :sort-desc="sortDesc"
          hover
          no-local-sorting
          no-sort-reset
          @sort-changed="onSortChanged" />
      </div>
      <FrNoData
        v-else
        :card="false"
        class="mb-4"
        icon="inbox"
        :subtitle="$t('common.noRecordsFound')" />
      <FrPagination
        v-if="tableData.length || currentPage > 1"
        :value="currentPage"
        :per-page="pageSize"
        :total-rows="totalRows"
        :page-sizes="pageSizes"
        @input="onPageChange"
        @on-page-size-change="onPageSizeChange" />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { debounce } from 'lodash';
import { BTable } from 'bootstrap-vue';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrListOrganizer from '@forgerock/platform-shared/src/components/ListOrganizer';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import {
  getApplicationAccounts,
  getApplicationResources,
} from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import i18n from '@/i18n';

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  /**
   * The objectType id used in the _queryFilter (e.g. "User", "Roles")
   */
  objectTypeId: {
    type: String,
    required: true,
  },
  objectTypeName: {
    type: String,
    default: '',
  },
  /**
   * The properties map from the objectType definition, keyed by field name.
   * Each entry may have a displayName used as the column header label.
   */
  properties: {
    type: Object,
    default: () => ({}),
  },
  /**
   * Determines which API to call.
   * 'account' -> GET iga/governance/application/:id/accounts
   * 'resource' -> GET iga/governance/application/:id/resources
   */
  objectTypeCategory: {
    type: String,
    default: 'account',
    validator: (v) => ['account', 'resource'].includes(v),
  },
  minimumPageSize: {
    type: Number,
    default: 10,
  },
});

const availableColumns = ref([]);
const currentPage = ref(1);
const isLoading = ref(true);
const pageSize = ref(props.minimumPageSize);
const searchValue = ref('');
const sortBy = ref('displayName');
const sortDesc = ref(false);
const tableData = ref([]);
const totalRows = ref(0);

const columnOrganizerKey = computed(() => `${props.applicationId}_${props.objectTypeId}_columns`);

const pageSizes = computed(() => [...new Set([props.minimumPageSize, 10, 20, 50, 100])].filter((s) => s >= props.minimumPageSize).sort((a, b) => a - b));

const allColumns = computed(() => {
  const pinnedOrder = ['id', 'displayName'];
  const entries = Object.entries(props.properties);
  const pinned = pinnedOrder
    .map((pin) => entries.find(([key]) => key === pin))
    .filter(Boolean);
  const rest = entries.filter(([key]) => !pinnedOrder.includes(key));
  const sortableKeys = ['id', 'displayName'];
  return [...pinned, ...rest].map(([key, prop]) => ({
    key,
    label: prop.displayName || key,
    sortable: sortableKeys.includes(key),
    enabled: true,
  }));
});

const activeFields = computed(() => availableColumns.value.filter((col) => col.enabled));

function buildQueryParams(page, size) {
  const filters = [`objectType eq "${props.objectTypeId}"`];
  if (searchValue.value) {
    filters.push(`displayName co '${searchValue.value.replace(/'/g, "\\'")}'`);
  }
  return {
    pageSize: size,
    pagedResultsOffset: (page - 1) * size,
    _queryFilter: filters.join(' and '),
    _sortKeys: sortBy.value,
    _sortDir: sortDesc.value ? 'desc' : 'asc',
  };
}

function fetchData(params) {
  return props.objectTypeCategory === 'account'
    ? getApplicationAccounts(props.applicationId, params)
    : getApplicationResources(props.applicationId, params);
}

function loadPage(page, size) {
  isLoading.value = true;
  const params = buildQueryParams(page, size);

  fetchData(params).then(({ data }) => {
    const results = data.result || [];
    tableData.value = results.map((item) => item.sourceObject || {});
    currentPage.value = page;
    totalRows.value = data.totalCount || 0;
  }).catch((err) => {
    showErrorMessage(err, i18n.global.t('errors.errorRetrievingResources', { resource: props.objectTypeName }));
    tableData.value = [];
    totalRows.value = 0;
  }).finally(() => {
    isLoading.value = false;
  });
}

const onSearch = debounce(() => {
  loadPage(1, pageSize.value);
}, 500);

function onColumnsUpdated(updatedList) {
  availableColumns.value = updatedList;
}

function onPageChange(page) {
  loadPage(page, pageSize.value);
}

function onPageSizeChange(size) {
  pageSize.value = size;
  loadPage(1, size);
}

function onSortChanged({ sortBy: newSortBy, sortDesc: newSortDesc }) {
  sortBy.value = newSortBy;
  sortDesc.value = newSortDesc;
  loadPage(1, pageSize.value);
}

onMounted(() => {
  availableColumns.value = allColumns.value;
  loadPage(1, pageSize.value);
});
</script>

<style lang="scss" scoped>
:deep(.table) {
  table-layout: auto;
  white-space: nowrap;
}
</style>
