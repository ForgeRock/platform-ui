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
    <BButtonToolbar class="justify-content-lg-between mb-4 p-0 border-0">
      <BButton
        v-if="store.state.SharedStore.autoCustomReportsEnabled && store.state.SharedStore.currentPackage === 'admin'"
        class="mb-3 mr-3 mb-md-0"
        variant="primary"
        @click="handleNewReportClick">
        <FrIcon
          icon-class="mr-2"
          name="add" />
        {{ $t('reports.newReport') }}
      </BButton>
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
            :report-currently-processing="reportBeingProcessed"
            :loading="loading"
            :report="report"
            @to-template="toTemplate"
            @delete-template="confirmDeleteTemplate"
            @open-duplicate-modal="openDuplicateModal"
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
      :total-rows="searchValue ? filteredReports.length : reports.length"
      @on-page-size-change="pageSizeChange" />
    <FrDeleteModal
      :is-deleting="!!Object.keys(reportBeingProcessed).length"
      :is-testing="isTesting"
      :translated-item-type="$t('common.report')"
      @delete-item="deleteTemplate(templateToDelete.name, templateToDelete.status)" />
    <FrNewReportModal
      v-if="store.state.SharedStore.autoCustomReportsEnabled && store.state.SharedStore.currentPackage === 'admin'"
      :is-testing="isTesting"
      :report-data-for-duplication="reportBeingProcessed || {}"
      :report-is-saving="saveReportPending || reportIsDuplicating"
      :report-names="allReportNames"
      @new-report-save="handleNewReportSave"
      @duplicate-report="duplicateTemplate"
      @hidden="reportBeingProcessed = {}" />
  </BContainer>
</template>

<script setup>
/**
* @description Shows and filter the list of the report templates.
*/
import { computed, ref, watch } from 'vue';
import {
  BButton,
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
  editAnalyticsReport,
  getReportTemplates,
  publishAnalyticsReport,
} from '@forgerock/platform-shared/src/api/AutoApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrNewReportModal from './modals/NewReportModal';
import useSaveReportTemplate from './composables/SaveReport';
import FrReportCard from './ReportCard';
import i18n from '@/i18n';
import store from '@/store';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

// Composables
const router = useRouter();
const { bvModal } = useBvModal();
const {
  templateData, saveReportError, saveReportPending, saveReport, saveReportReady,
} = useSaveReportTemplate();

// Globals
const currentPage = ref(1);
const displayedReports = ref([]);
const filteredReports = ref([]);
const hasFocus = ref(false);
const loading = ref(true);
const perPage = ref(6);
const reports = ref([]);
const reportBeingProcessed = ref({});
const reportIsDuplicating = ref(false);
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
  const targetReports = searchValue.value !== '' ? filteredReports.value : reports.value;
  displayedReports.value = targetReports.slice(from, to);
}

/**
 * Call the endpoint to retrieve the list of the report templates.
 * @param {String} params Additional query filters.
 */
async function retrieveReportTemplates(params = null) {
  loading.value = true;
  try {
    const { result } = await getReportTemplates(params);
    if (params) {
      filteredReports.value = result;
    } else {
      reports.value = result;
    }
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
 * @param {String} state report state (draft or published).
 */
function toTemplate({ name, toHistory, state }) {
  const component = toHistory ? 'ReportHistory' : 'ReportRun';
  router.push({ name: component, params: { state, template: name.toLowerCase() } });
}

/**
 * Deletes a report template
 * @param {String} id template name
 * @param {String} status template status type (draft, published)
 */
async function deleteTemplate(id, status) {
  reportBeingProcessed.value = { id, status };
  try {
    await deleteAnalyticsReport(id, status);
    displayNotification('success', i18n.global.t('common.deleteSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorDeleting'));
  }

  if (searchValue.value) {
    onSearchChange(searchValue.value);
  } else {
    retrieveReportTemplates();
  }

  bvModal.value.hide('deleteModal');
  reportBeingProcessed.value = {};
}

/**
 * Duplicates a report template
 * @param {Object} payload - {originalReportName, name, description, viewers, status} values from New Report modal
 */
async function duplicateTemplate(payload) {
  reportIsDuplicating.value = true;
  try {
    await duplicateAnalyticsReport(payload);
    retrieveReportTemplates();
    displayNotification('success', i18n.global.t('common.duplicateSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorDuplicating'));
  }
  bvModal.value.hide('new-report-modal');
  reportIsDuplicating.value = false;
}

/**
 * Opens the duplicate report modal
 * @param {Object} report report object
 */
function openDuplicateModal(report) {
  reportBeingProcessed.value = {
    id: report.name,
    description: report.description,
    status: report.type,
    viewers: report.viewers,
  };
  bvModal.value.show('new-report-modal');
}

/**
 * If report is published and is edited, a draft template is created then routes to the new draft
 * report edit view, otherwise, only routes to the currently existing draft report edit view.
 * @param {String} id template name
 * @param {String} status template status type (draft, published)
 */
async function editTemplate(id, status) {
  if (status === 'published') {
    reportBeingProcessed.value = { id, status };
    try {
      await editAnalyticsReport(id);
      displayNotification('success', i18n.global.t('reports.newDraft'));
      router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: id.toLowerCase() } });
    } catch (err) {
      showErrorMessage(err, i18n.global.t('reports.errorEditing'));
    }
    reportBeingProcessed.value = {};
  } else {
    router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: id.toLowerCase() } });
  }
}

/**
 * Opens the New Report modal
 */
function handleNewReportClick() {
  bvModal.value.show('new-report-modal');
}

/**
 * Handles calling the API to create a new Report Template
 * @param {Object} payload - Name, description, and viewers values from New Report modal
 */
function handleNewReportSave(payload) {
  saveReport(payload);
}

/**
 * Publishes a report template
 * @param {String} id template name
 * @param {String} status template status (draft or published).
 */
async function publishTemplate(id, status) {
  reportBeingProcessed.value = { id, status };
  try {
    await publishAnalyticsReport(id, status);
    displayNotification('success', i18n.global.t('common.publishSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorPublishing'));
  }
  retrieveReportTemplates();
  reportBeingProcessed.value = {};
}

// Computed
const allReportNames = computed(() => reports.value.map((report) => report.name));

// Watchers
watch(saveReportError, (newVal) => {
  showErrorMessage(newVal, i18n.global.t('reports.saveError'));
});

watch(saveReportReady, (newVal) => {
  if (newVal) {
    const templateName = templateData.value.data.name.toLowerCase();
    bvModal.value.hide('new-report-modal');
    router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: templateName } });
  }
});

retrieveReportTemplates();
</script>
<style lang="scss" scoped>
.fr-search {
  transition: all 0.3s ease 0s;
}
</style>
