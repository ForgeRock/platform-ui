<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="props.applications.length"
    class="mr-3">
    <BTable
      data-testid="applications-table"
      responsive
      role="table"
      :fields="applicationsFields"
      :items="props.applications"
      :per-page="pageSize"
      :current-page="currentPage"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc">
      <template #head()="{ label, field: { key, sortable }}">
        {{ label }}
        <template v-if="sortable && sortBy === key">
          <!-- Custom sort icon -->
          <FrIcon
            icon-class="text-muted"
            :name="sortDesc ? 'arrow_downward' : 'arrow_upward'" />
        </template>
      </template>
      <template #cell(name)="{ item }">
        <BMedia
          class="align-items-center"
          no-body>
          <img
            class="mr-3"
            width="28"
            height="33"
            :onerror="onImageError"
            :src="getApplicationLogo(item)"
            :alt="$t('common.logo')">
          <BMediaBody class="overflow-hidden d-flex flex-column">
            <span class="text-truncate">
              {{ item.name }}
            </span>
            <span
              class="mb-0 text-muted text-truncate">
              {{ item.description }}
            </span>
          </BMediaBody>
        </BMedia>
      </template>
    </BTable>
    <FrPagination
      v-if="props.applications.length"
      v-model="currentPage"
      :per-page="pageSize"
      :total-rows="props.applications.length"
      @input="paginationChange"
      @on-page-size-change="pageSizeChange" />
  </div>
  <FrNoData
    v-else
    :card="false"
    class="mb-4"
    icon="list"
    :subtitle="$t('governance.certificationDetails.noApplications')" />
</template>

<script setup>
/**
 * @description Application Tab used to display the applications attached to an specific role
 */
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import {
  ref,
} from 'vue';
import {
  BMedia,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import i18n from '@/i18n';

const props = defineProps({
  applications: {
    type: Array,
    required: true,
  },
});

const applicationsFields = [
  {
    key: 'name',
    label: i18n.global.t('common.application'),
    class: 'fr-bg-none',
    sortable: true,
  },
];

const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('name');
const sortDesc = ref(false);

/**
 * Listener for the input event emmited by the
 * pagination component when the page is changed.
 * @param {Number} page page number
 */
function paginationChange(page) {
  currentPage.value = page;
}

/**
 * Listener for the on-page-size-change event emmited by the
 * pagination component when the size of results is changed.
 * @param {Number} pageSize page size number
 */
function pageSizeChange(pageSizeValue) {
  pageSize.value = pageSizeValue;
}
</script>

<style lang="scss" scoped>
  :deep(.table-responsive) {
    /* Hide default sort icon */
    .fr-bg-none {
      background: none !important;
    }
  }
</style>
