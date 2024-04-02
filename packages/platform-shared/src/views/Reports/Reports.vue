<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

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
      id="reportTemplatesGrid">
      <template v-if="loading">
        <!-- Skeleton Loader -->
        <BCol
          v-for="index in 6"
          class="mb-4"
          lg="4"
          :key="index">
          <FrReportCard />
        </BCol>
      </template>
      <template v-else>
        <BCol
          v-for="report in displayedReports"
          class="mb-4"
          lg="4"
          :key="report.name">
          <FrReportCard
            :report-name-currently-processing="reportBeingProcessed"
            :loading="loading"
            :report="report"
            :show-delete="false"
            :show-edit="false"
            @to-template="toTemplate"
            @delete-template="confirmDeleteTemplate"
            @duplicate-template="duplicateTemplate"
            @edit-template="editTemplate"
            @publish-template="publishTemplate" />
        </BCol>
      </template>
    </BRow>
    <FrNoData
      v-else
      icon="web_asset"
      testid="no-data"
      :card="false"
      :subtitle="$t('reports.noData')" />
    <FrPagination
      v-if="displayedReports.length > 0"
      :value="currentPage"
      @input="currentPage = $event; updateDisplayedReports()"
      aria-controls="reportTemplatesGrid"
      class="border-0"
      :per-page="perPage"
      :total-rows="reports.length"
      @on-page-size-change="pageSizeChange" />
    <FrDeleteModal
      :is-deleting="!!reportBeingProcessed"
      :is-testing="isTesting"
      :translated-item-type="$t('common.report')"
      @delete-item="deleteTemplate(templateToDelete.name, templateToDelete.status)" />
  </BContainer>
</template>

<script setup>
/**
* @description Shows and filter the list of the report templates.
*/
import { ref } from 'vue';
import {
  BButtonToolbar,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import {
  deleteAnalyticsReport,
  duplicateAnalyticsReport,
  getReportTemplates,
  publishAnalyticsReport,
} from '@forgerock/platform-shared/src/api/AutoApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrReportCard from './ReportCard';
import i18n from '@/i18n';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

// Composables
const router = useRouter();
const { bvModal } = useBvModal();

// Globals
const currentPage = ref(1);
const displayedReports = ref([]);
const hasFocus = ref(false);
const loading = ref(true);
const perPage = ref(6);
const reports = ref([]);
const reportBeingProcessed = ref('');
const searchValue = ref('');
const templateToDelete = ref({});

// Functions
/**
 * Opens the delete template confirm modal
 * @param {String} name template name id
 * @param {String} status template status type (published, draft)
 */
function confirmDeleteTemplate(name, status) {
  bvModal.value.show('deleteModal');
  templateToDelete.value = { name, status };
}

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

/**
 * Deletes a report template
 * @param {String} id template name
 * @param {String} status template status type (draft, published)
 */
async function deleteTemplate(id, status) {
  reportBeingProcessed.value = id;
  try {
    await deleteAnalyticsReport(id, status);
    displayNotification('success', i18n.global.t('common.deleteSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorDeleting'));
  }
  retrieveReportTemplates();
  bvModal.value.hide('deleteModal');
  reportBeingProcessed.value = '';
}

/**
 * Duplicates a report template
 * @param {String} id template name
 * @param {String} status template status type (draft, published)
 */
async function duplicateTemplate(id, status) {
  reportBeingProcessed.value = id;
  try {
    await duplicateAnalyticsReport(id, status);
    displayNotification('success', i18n.global.t('common.duplicateSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorDuplicating'));
  }
  retrieveReportTemplates();
  reportBeingProcessed.value = '';
}

/**
 * Routes to the report edit view
 * @param {String} id template name
 */
function editTemplate(id) {
  router.push({ name: 'EditReportTemplate', params: { id } });
}

/**
 * Publishes a report template
 * @param {String} id template name
 */
async function publishTemplate(id) {
  reportBeingProcessed.value = id;
  try {
    await publishAnalyticsReport(id);
    displayNotification('success', i18n.global.t('common.publishSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorPublishing'));
  }
  retrieveReportTemplates();
  reportBeingProcessed.value = '';
}

retrieveReportTemplates();

</script>
<style lang="scss" scoped>
.fr-search {
  transition: all 0.3s ease 0s;
}
</style>
