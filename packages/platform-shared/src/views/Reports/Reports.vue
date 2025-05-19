<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="fr-reports mt-5">
    <FrHeader
      class="mt-5 mb-4"
      :title="$t('pageTitles.Reports')"
      :subtitle="$t('reports.subtitle')" />

    <BCard
      v-if="reports.length > 0 || loading"
      no-body>
      <BButtonToolbar class="py-3 px-4 justify-content-between">
        <BButton
          v-if="isCustomReportEnabled"
          class="mb-2 mb-lg-0 w-100 w-lg-auto"
          variant="primary"
          @click="$bvModal.show('new-report-modal')">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t('common.newObject', { object: $t('common.report') }) }}
          </FrIcon>
        </BButton>
        <FrSearchInput
          class="w-100 pl-lg-2 fr-search"
          v-model="searchTerm"
          :class="{ 'flex-grow-1' : hasFocus, 'w-lg-auto': isCustomReportEnabled }"
          :placeholder="$t('common.search')"
          @clear="searchTerm = ''"
          @search-input-blur="hasFocus = false"
          @search-input-focus="hasFocus = true"
        />
      </BButtonToolbar>
      <BTable
        class="mb-0"
        fixed
        hover
        responsive
        sort-by="report"
        :busy="loading"
        :fields="tableFields"
        :items="reports"
        :per-page="perPage"
        :current-page="currentPage"
        :filter="searchTerm"
        :filter-function="filterReports"
        :sort-compare="sortCompareReports"
        @filtered="onFiltered"
        @row-clicked="$router.push({ name: 'ReportRun', params: { state: $event.type, template: $event.name.toLowerCase() } })">
        <template #table-busy>
          <div class="text-center text-danger p-3">
            <FrSpinner />
          </div>
        </template>
        <template #cell(report)="{ item }">
          <div :id="`${item.name}-${item.type}`">
            <h2 class="h5 mb-1">
              {{ startCase(item.name.toLowerCase()) }}
            </h2>
            <p class="text-body text-truncate mb-0">
              {{ item.description }}
            </p>
          </div>
          <BTooltip
            v-if="item.description"
            :target="`${item.name}-${item.type}`">
            {{ item.description }}
          </BTooltip>
        </template>
        <template #cell(type)="{ item }">
          <p
            v-if="item.ootb"
            class="text-center m-0">
            --
          </p>
          <BBadge
            v-else
            class="w-100"
            :variant="item.type === 'published' ? 'success' : 'light'">
            {{ item.type === 'published' ? $t('common.published') : $t('common.draft') }}
          </BBadge>
        </template>
        <template #cell(actions)="{ item }">
          <div class="d-flex justify-content-end align-items-center">
            <BButton
              class="pr-3 mr-3"
              variant="outline-primary"
              size="sm"
              @click="$router.push({ name: 'ReportRun', params: { state: item.type, template: item.name.toLowerCase() } })">
              <FrIcon
                icon-class="mr-2"
                name="play_arrow">
                {{ $t('common.run') }}
              </FrIcon>
            </BButton>
            <div class="d-flex justify-content-center">
              <div
                v-if="reportBeingProcessed?.name === item.name && item.type === 'draft' && isPublishing"
                class="w-42 h-42 d-flex justify-content-center align-items-center">
                <BSpinner
                  class="opacity-50"
                  small
                  :label="$t('common.loadingEtc')" />
              </div>
              <FrActionsCell
                v-else
                toggle-class="w-42 h-42"
                wrapper-class="pr-0"
                :delete-option="isCustomReportEnabled && !item.ootb"
                :divider="isCustomReportEnabled && !item.ootb"
                :edit-option="isCustomReportEnabled && !item.ootb"
                :edit-option-text="$t('reports.menu.editTemplate')"
                :duplicate-option="isCustomReportEnabled && !item.ootb"
                @edit-clicked="editTemplate(item.name, item.type)"
                @duplicate-clicked="openDuplicateModal(item)"
                @delete-clicked="confirmDeleteTemplate(item.name, item.type)">
                <template #custom-top-actions>
                  <BDropdownItem
                    @click="$router.push({ name: 'ReportHistory', params: { state: item.type, template: item.name.toLowerCase() } })">
                    <FrIcon
                      icon-class="mr-2"
                      name="list_alt">
                      {{ $t('reports.menu.runHistory') }}
                    </FrIcon>
                  </BDropdownItem>
                  <BDropdownItem
                    v-if="isCustomReportEnabled && !item.ootb && item.type !== 'published'"
                    @click="openAssignViewersModal(item)">
                    <FrIcon
                      icon-class="mr-2"
                      name="person_add">
                      {{ $t('reports.menu.assignReport') }}
                    </FrIcon>
                  </BDropdownItem>
                </template>
                <template #custom-bottom-actions>
                  <BDropdownItem
                    v-if="isCustomReportEnabled && item.type === 'draft'"
                    @click="publishTemplate(item.name, item.type)">
                    <FrIcon
                      icon-class="mr-2"
                      name="published_with_changes">
                      {{ $t('common.publish') }}
                    </FrIcon>
                  </BDropdownItem>
                </template>
              </FrActionsCell>
            </div>
          </div>
        </template>
      </BTable>
      <FrPagination
        v-model="currentPage"
        aria-controls="reportTemplatesGrid"
        :per-page="perPage"
        :total-rows="totalRows"
        @on-page-size-change="perPage = $event" />
    </BCard>
    <FrNoData
      v-else
      icon="web_asset"
      testid="no-data"
      :card="false"
      :subtitle="$t('reports.noData')" />

    <FrNewReportModal
      v-if="isCustomReportEnabled"
      :report-data-for-duplication="reportBeingProcessed"
      :report-is-saving="saveReportPending || reportIsDuplicating"
      :report-names="allReportNames"
      @new-report-save="saveReport"
      @duplicate-report="duplicateTemplate"
      @hidden="reportBeingProcessed = undefined" />
    <FrAssignViewersModal
      :report-viewers="reportBeingProcessed?.viewers"
      :is-saving="savingViewers"
      @hidden="reportBeingProcessed = undefined"
      @save="assignViewersToReport(reportBeingProcessed, $event)" />
    <FrDeleteModal
      :is-deleting="isDeleting"
      :translated-item-type="$t('common.report')"
      @hidden="templateToDelete = undefined"
      @delete-item="deleteTemplate(templateToDelete.name, templateToDelete.status)" />
  </BContainer>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  BButton,
  BButtonToolbar,
  BContainer,
  BTable,
  BCard,
  BDropdownItem,
  BSpinner,
  BBadge,
} from 'bootstrap-vue';
import { startCase } from 'lodash';
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
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrNewReportModal from './modals/NewReportModal';
import useSaveReportTemplate from './composables/SaveReport';
import i18n from '@/i18n';
import store from '@/store';
import FrAssignViewersModal from './modals/AssignViewersModal';

/**
 * @description Shows and filter the list of the report templates.
 */

// Composables
const router = useRouter();
const { bvModal } = useBvModal();
const {
  templateData, saveReportError, saveReportPending, saveReport, saveReportReady,
} = useSaveReportTemplate();
const {
  saveReportError: saveViewersError, saveReportPending: savingViewers, saveReport: saveViewers, saveReportReady: saveViewersReady,
} = useSaveReportTemplate();

// Globals
const currentPage = ref(1);
const hasFocus = ref(false);
const loading = ref(true);
const perPage = ref(10);
const totalRows = ref(0);
const searchTerm = ref('');
const reports = ref([]);
const reportBeingProcessed = ref(undefined);
const reportIsDuplicating = ref(false);
const templateToDelete = ref(undefined);
const tableFields = [
  {
    key: 'report',
    label: i18n.global.t('common.report'),
    sortable: true,
  },
  {
    key: 'type',
    label: i18n.global.t('common.status'),
    class: 'd-none d-lg-table-cell w-150px',
  },
  {
    key: 'actions',
    label: '',
    class: 'text-nowrap text-right d-none d-lg-table-cell w-250px',
  },
];
const isCustomReportEnabled = store.state.SharedStore.currentPackage === 'admin' && store.state.SharedStore.autoCustomReportsEnabled;
const isPublishing = ref(false);
const isDeleting = ref(false);

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
 * Call the endpoint to retrieve the list of the report templates.
 * @param {String} params Additional query filters.
 */
async function retrieveReportTemplates(params = null) {
  loading.value = true;
  try {
    const { result } = await getReportTemplates(params);
    reports.value = result;
    totalRows.value = result.length;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.noData'));
  } finally {
    loading.value = false;
  }
}

/**
 * Filters the reports based on the search term, used in the BTable filter function
 * @param {Object} report report object
 * @param {String} filter search term
 */
function filterReports(report, filter) {
  return startCase(report.name).toLowerCase().includes(filter.toLowerCase())
    || report.description.toLowerCase().includes(filter.toLowerCase());
}

/**
 * Updates the total rows count based on the filtered items, used in the BTable filtered event
 * @param {Array} filteredItems filtered items
 */
function onFiltered(filteredItems) {
  totalRows.value = filteredItems.length;
  currentPage.value = 1;
}

/**
 * Compares the report object properties for sorting, used in the BTable sort-compare function
 * @param {Object} aRow report object
 * @param {Object} bRow report object
 * @param {String} key sort key
 * @param {Boolean} sortDesc sort direction
 * @param {Function} formatter formatter function
 * @param {Object} compareOptions compare options
 * @param {String} compareLocale compare locale
 *
 * @see {@link https://bootstrap-vue.org/docs/components/table#sorting}
 */
function sortCompareReports(aRow, bRow, key, sortDesc, formatter, compareOptions, compareLocale) {
  if (key === 'report') {
    return aRow.name.localeCompare(bRow.name, compareLocale, compareOptions);
  }
  return 0;
}

/**
 * Deletes a report template
 * @param {String} name template name
 * @param {String} status template status type (draft, published)
 */
async function deleteTemplate(name, status) {
  isDeleting.value = true;
  try {
    await deleteAnalyticsReport(name, status);
    displayNotification('success', i18n.global.t('common.deleteSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
    retrieveReportTemplates();
    bvModal.value.hide('deleteModal');
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorDeleting'));
  } finally {
    isDeleting.value = false;
  }
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
    bvModal.value.hide('new-report-modal');
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorDuplicating'));
  } finally {
    reportIsDuplicating.value = false;
  }
}

/**
 * Opens the duplicate report modal
 * @param {Object} report report object
 */
function openDuplicateModal(report) {
  reportBeingProcessed.value = {
    name: report.name,
    description: report.description,
    status: report.type,
    viewers: report.viewers,
  };
  bvModal.value.show('new-report-modal');
}

/**
 * If report is published and is edited, a draft template is created then routes to the new draft
 * report edit view, otherwise, only routes to the currently existing draft report edit view.
 * @param {String} name template name
 * @param {String} status template status type (draft, published)
 */
async function editTemplate(name, status) {
  if (status === 'published') {
    reportBeingProcessed.value = { name, status };
    try {
      await editAnalyticsReport(name);
      displayNotification('success', i18n.global.t('reports.newDraft'));
      router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: name.toLowerCase() } });
    } catch (err) {
      showErrorMessage(err, i18n.global.t('reports.errorEditing'));
    } finally {
      reportBeingProcessed.value = undefined;
    }
  } else {
    router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: name.toLowerCase() } });
  }
}

/**
 * Publishes a report template
 * @param {String} name template name
 * @param {String} status template status (draft or published).
 */
async function publishTemplate(name, status) {
  reportBeingProcessed.value = { name, status };
  isPublishing.value = true;
  try {
    await publishAnalyticsReport(name, status);
    displayNotification('success', i18n.global.t('common.publishSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
    retrieveReportTemplates();
  } catch (err) {
    showErrorMessage(err, i18n.global.t('reports.errorPublishing'));
  } finally {
    reportBeingProcessed.value = undefined;
    isPublishing.value = false;
  }
}

/**
 * Opens the assign viewers modal
 * @param {Object} report report object
 */
function openAssignViewersModal(report) {
  reportBeingProcessed.value = report;
  bvModal.value.show('assign-viewers-modal');
}

/**
 * Assigns viewers to a report
 * @param {Object} report report object
 * @param {Array} viewers array of viewers
 */
async function assignViewersToReport(report, viewers) {
  savingViewers.value = true;

  // if the report is published, we need to edit the report to update the viewers
  if (report.type === 'published') {
    try {
      await editAnalyticsReport(report.name);
    } catch (error) {
      showErrorMessage(error, i18n.global.t('reports.saveViewersError'));
      return;
    } finally {
      savingViewers.value = false;
    }
  }

  saveViewers({ ...report, viewers });
}

// Computed
const allReportNames = computed(() => reports.value.map((report) => report.name));

// Watchers
watch(saveReportError, (newVal) => showErrorMessage(newVal, i18n.global.t('reports.saveError')));

watch(saveViewersError, (newVal) => showErrorMessage(newVal, i18n.global.t('reports.saveViewersError')));

watch(saveReportReady, (newVal) => {
  if (newVal) {
    const templateName = templateData.value.data.name.toLowerCase();
    bvModal.value.hide('new-report-modal');
    router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: templateName } });
  }
});

watch(saveViewersReady, (newVal) => {
  if (newVal) {
    bvModal.value.hide('assign-viewers-modal');
    retrieveReportTemplates();
    displayNotification('success', i18n.global.t('reports.saveViewersSuccess'));
  }
});

retrieveReportTemplates();
</script>
<style lang="scss" scoped>
.fr-search {
  transition: all 0.3s ease 0s;
}

:deep() {
  .w-42 {
    width: 42px;
  }
  .h-42 {
    height: 42px;
  }
  .table-hover tbody tr {
    cursor: pointer;
  }
}
</style>
