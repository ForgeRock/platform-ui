<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="fr-reports mt-5">
    <FrHeader
      class="mt-5 mb-4"
      :title="$t('pageTitles.Reports')"
      :subtitle="$t('reports.subtitle')"
    />
    <BButtonToolbar class="justify-content-lg-end mb-4 p-0 border-0">
      <FrSearchInput
        :value="searchValue"
        class="fr-search"
        :class="{ 'flex-grow-1' : hasFocus }"
        :placeholder="$t('reports.search')"
        @clear="onSearchClear"
        @input="onSearchChange"
        @search-input-blur="hasFocus = false"
        @search-input-focus="hasFocus = true"
      />
    </BButtonToolbar>
    <BRow
      v-if="displayedReports.length > 0 || loading"
      data-testid="report-templates-grid"
      id="reportTemplatesGrid"
    >
      <template v-if="loading">
        <!-- Skeleton Loader -->
        <BCol
          v-for="index in 6"
          class="mb-4"
          lg="4"
          :key="index"
        >
          <ReportCard />
        </BCol>
      </template>
      <template v-else>
        <BCol
          v-for="report in displayedReports"
          class="mb-4"
          lg="4"
          :key="report.name"
        >
          <ReportCard
            :loading="loading"
            :report="report"
            @to-template="toTemplate"
          />
        </BCol>
      </template>
    </BRow>
    <FrNoData
      v-else
      icon="web_asset"
      testid="no-data"
      :card="false"
      :subtitle="$t('reports.noData')"
    />
    <FrPagination
      v-if="displayedReports.length > 0"
      :value="currentPage"
      @input="currentPage = $event; updateDisplayedReports()"
      aria-controls="reportTemplatesGrid"
      class="border-0"
      :per-page="perPage"
      :total-rows="reports.length"
      @on-page-size-change="pageSizeChange"
    />
  </BContainer>
</template>

<script setup>
/**
* @description Shows and filter the list of the report templates.
*/
import {
  BButtonToolbar,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import { getReportTemplates } from '@forgerock/platform-shared/src/api/AutoApi';
import { ref } from 'vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';
import ReportCard from './ReportCard/ReportCard';

// Composables
const router = useRouter();

const currentPage = ref(1);
const displayedReports = ref([]);
const hasFocus = ref(false);
const loading = ref(false);
const perPage = ref(6);
const reports = ref([]);
const searchValue = ref('');

/**
 * Updates the reports that should be displayed depending on the page that is being focused.
 */
function updateDisplayedReports() {
  const from = (currentPage.value - 1) * perPage.value;
  const to = from + perPage.value;
  displayedReports.value = reports.value.slice(from, to);
}

/**
 * Call the endpoint to retrieve the list of the report templates.
 * @param {String} params Additional query filters.
 */
async function retrieveReportTemplates(params = null) {
  loading.value = true;
  reports.value = [];
  try {
    const { result } = await getReportTemplates(params);
    reports.value = result;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.noData'));
  } finally {
    loading.value = false;
    updateDisplayedReports();
  }
}

const debounceRetrieveReportTemplates = debounce(retrieveReportTemplates, 500);

/**
 * Clears the search parameter.
 */
function onSearchClear() {
  searchValue.value = '';
  retrieveReportTemplates();
}

/**
 * Runs a delayed search of the typed parameter.
 */
function onSearchChange(search) {
  searchValue.value = search;
  currentPage.value = 1;
  const query = searchValue.value !== '' ? { queryFilter: `name sw '${searchValue.value}'` } : null;
  debounceRetrieveReportTemplates.cancel();
  debounceRetrieveReportTemplates(query);
}

/**
 * Changes the number of report templates per page.
 * @param {Number} pageSize The number of report templates to show.
 */
function pageSizeChange(pageSize) {
  perPage.value = pageSize;
  currentPage.value = 1;
  retrieveReportTemplates();
}

/**
 * Routes to the report template path when the child component emits the event.
 * @param {String} name The name of the report template.
 * @param {Boolean} toHistory Validates if it should redirect to the report history path.
 */
function toTemplate({ name, toHistory }) {
  const path = toHistory ? `/reports/${name.toLowerCase()}/history` : `/reports/${name.toLowerCase()}`;
  router.push({ path });
}

retrieveReportTemplates();

</script>
<style lang="scss" scoped>
.fr-search {
  transition: all 0.3s ease 0s;
}
</style>
