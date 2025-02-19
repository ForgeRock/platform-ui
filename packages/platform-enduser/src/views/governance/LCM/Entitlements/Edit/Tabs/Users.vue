<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <BCardHeader class="p-0 border-bottom-0 flex-column flex-lg-row">
      <BButtonToolbar class="justify-content-between">
        <FrSearchInput
          v-model="searchValue"
          class="ml-auto"
          @clear="search('')"
          @search="search(searchValue)" />
      </BButtonToolbar>
    </BCardHeader>
    <BTable
      class="mb-0"
      responsive
      show-empty
      :busy="isLoading"
      :empty-text="$t('common.noObjectFound', { object: $t('common.users') })"
      :fields="columns"
      :items="items">
      <template #table-busy>
        <div class="text-center text-danger p-3">
          <FrSpinner />
        </div>
      </template>
      <template #cell(name)="{ item }">
        <FrUserBasicInfo
          v-if="item.user"
          :pic-dimension="28"
          :user="item.user" />
        <template v-else>
          {{ blankValueIndicator }}
        </template>
      </template>
      <template #cell(account)="{ item }">
        {{ item.descriptor?.idx?.['/account']?.displayName || blankValueIndicator }}
      </template>
    </BTable>
    <FrPagination
      :value="currentPage"
      :per-page="currentPageSize"
      :total-rows="totalRows"
      @input="pageChange($event)"
      @on-page-size-change="pageSizeChange($event)" />
  </BCard>
</template>

<script setup>
import {
  ref,
} from 'vue';
import {
  BButtonToolbar,
  BCard,
  BCardHeader,
  BTable,
} from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getEntitlementUsers } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import i18n from '@/i18n';

const props = defineProps({
  entitlementId: {
    type: String,
    required: true,
  },
});

const currentPage = ref(1);
const currentPageSize = ref(10);
const isLoading = ref(false);
const items = ref([]);
const queryFields = ['user.givenName', 'user.sn', 'user.userName', 'descriptor.idx./account.displayName'];
const searchValue = ref('');
const totalRows = ref(0);
const columns = [
  {
    key: 'name',
    label: i18n.global.t('common.name'),
  },
  {
    key: 'account',
    label: i18n.global.t('common.account'),
  },
];

/**
 * Retrieves query parameters for a given query string, page number, and page size.
 * @param {string} queryString - The query string to be parsed.
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of items per page.
 * @returns {Object} An object containing the parsed query parameters.
 */
function getQueryParams(queryString, page, pageSize) {
  const queryParams = {};
  queryParams.pageSize = pageSize;
  queryParams.pagedResultsOffset = (page - 1) * pageSize;
  queryParams.queryFilter = queryString
    ? queryFields.map((field) => `${field} co "${queryString}"`).join(' or ')
    : true;
  return queryParams;
}

/**
 * Load the list of users for an entitlement
 */
async function loadUsers() {
  isLoading.value = true;
  try {
    const { data } = await getEntitlementUsers(props.entitlementId, getQueryParams(searchValue.value, currentPage.value, currentPageSize.value));
    items.value = data.result;
    totalRows.value = data.totalCount;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.errorRetrievingResources', { resource: i18n.global.t('common.users') }));
    items.value = [];
    totalRows.value = 0;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Searches for users based on the provided query.
 * @param {string} query - The search query to filter resources.
 */
function search(query) {
  searchValue.value = query;
  loadUsers();
}

/**
 * Handles the change in page
 * @param {number} pageNum - The new page number selected by the user.
 */
function pageChange(pageNum) {
  currentPage.value = pageNum;
  loadUsers();
}

/**
 * Handles the change in page size
 * @param {number} size - The new page size selected by the user.
 */
function pageSizeChange(size) {
  currentPageSize.value = size;
  loadUsers();
}

loadUsers();
</script>
