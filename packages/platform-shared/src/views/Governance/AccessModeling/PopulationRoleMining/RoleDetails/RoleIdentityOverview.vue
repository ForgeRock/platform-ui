<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard no-body>
      <FrSpinner
        v-if="isLoadingIdentities"
        class="py-5"
        testid="identities-spinner" />
      <BTable
        v-else
        v-resizable-table="{ persistKey: RESIZE_PERSIST_KEY }"
        class="mb-0"
        responsive
        :fields="MEMBER_FIELDS"
        :items="identities"
        :empty-text="$t('governance.accessModeling.populationRoleMining.roleDetailsPage.noIdentities')"
        show-empty>
        <template #cell(userName)="{ item }">
          {{ item.userName || blankValueIndicator }}
        </template>
        <template #cell(givenName)="{ item }">
          {{ item.givenName || blankValueIndicator }}
        </template>
        <template #cell(sn)="{ item }">
          {{ item.sn || blankValueIndicator }}
        </template>
        <template #cell(mail)="{ item }">
          {{ item.mail || blankValueIndicator }}
        </template>
        <template #cell(accountStatus)="{ item }">
          <BBadge
            class="pl-2 pr-2 font-weight-normal"
            :variant="item.accountStatus === 'active' ? 'success' : 'light'">
            {{ item.accountStatus || blankValueIndicator }}
          </BBadge>
        </template>
      </BTable>
      <FrPagination
        v-if="totalHits"
        class="p-3"
        :value="currentPage"
        :per-page="pageSize"
        :total-rows="totalHits"
        @input="handlePageChange"
        @on-page-size-change="handlePageSizeChange" />
    </BCard>
  </div>
</template>

<script setup>
import {
  BBadge,
  BCard,
  BTable,
} from 'bootstrap-vue';
import { onMounted, ref } from 'vue';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getRoleDataById } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

/**
 * Table of the identities that make up a mined role's membership. Members are fetched
 * server-side from the candidate role's members endpoint, one page per request.
 * @component RoleIdentityOverview
 */

const roleDetailsPage = 'governance.accessModeling.populationRoleMining.roleDetailsPage';

const RESIZE_PERSIST_KEY = 'population_role_mining_identities';
const MEMBER_FIELDS = [
  { key: 'userName', label: i18n.global.t('common.user.userName') },
  { key: 'givenName', label: i18n.global.t('common.user.givenName') },
  { key: 'sn', label: i18n.global.t('common.user.sn') },
  { key: 'mail', label: i18n.global.t('common.email') },
  { key: 'accountStatus', label: i18n.global.t('common.user.accountStatus') },
];

const props = defineProps({
  roleId: {
    type: String,
    default: '',
  },
});

const identities = ref([]);
const isLoadingIdentities = ref(false);
const totalHits = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

/**
 * Fetch the current page of members. The IGA user search matches on `id` (not `_id`) -
 * see getUserById in CommonsApi.
 * @param {Object} params pagination params (currentPage, pageSize) from the table
 */
async function loadIdentities(params = {}) {
  if (params.currentPage) currentPage.value = params.currentPage;
  if (params.pageSize) pageSize.value = params.pageSize;
  if (!props.roleId) return;
  isLoadingIdentities.value = true;
  try {
    const { data } = await getRoleDataById(props.roleId, 'candidate', 'members', {
      // only the fields backing the table's columns
      _fields: MEMBER_FIELDS.map((field) => field.key).join(','),
      _pageSize: pageSize.value,
      _pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
    });
    identities.value = data?.result ?? [];
    totalHits.value = data?.totalHits ?? 0;
  } catch (error) {
    showErrorMessage(error, i18n.global.t(`${roleDetailsPage}.failedGettingIdentities`));
    identities.value = [];
  } finally {
    isLoadingIdentities.value = false;
  }
}

/**
 * Change the page and re-fetch
 * @param {Number} page the page to display
 */
function handlePageChange(page) {
  currentPage.value = page;
  loadIdentities();
}

/**
 * Change the page size and re-fetch from the first page
 * @param {Number} size the new page size
 */
function handlePageSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1;
  loadIdentities();
}

onMounted(() => {
  loadIdentities();
});
</script>
