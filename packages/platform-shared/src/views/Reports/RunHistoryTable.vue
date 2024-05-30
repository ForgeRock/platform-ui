<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BTable
      class="mb-0"
      :current-page="currentPage"
      data-testid="run-history-table"
      :empty-text="$t('common.noRecordsToShow')"
      :fields="tableColumns"
      :items="tableRows"
      no-sort-reset
      :per-page="itemsPerPage"
      responsive
      show-empty
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :thead-class="!tableRows.length ? 'd-none' : ''">
      <template #head()="{ label, field: { key, sortable }}">
        {{ label }}
        <template v-if="sortable && sortBy === key">
          <!-- Custom sort icon -->
          <FrIcon
            icon-class="text-muted"
            :name="sortDesc ? 'arrow_downward' : 'arrow_upward'" />
        </template>
      </template>
      <template #cell(date)="{ item }">
        <div class="fr-report-history-start-date-container d-flex align-items-center">
          {{ dayjs(item.date).format('MM/DD/YYYY h:mm A') }}
        </div>
        <div class="d-lg-none fr-report-badges">
          <FrRunReportBadges :report-status="item.reportStatus" />
        </div>
      </template>
      <template #cell(reportStatus)="{ item }">
        <div class="fr-report-badges">
          <FrRunReportBadges :report-status="item.reportStatus" />
        </div>
      </template>
      <template #cell(view-report)="{ item }">
        <BButton
          v-if="item.reportStatus === 'complete'"
          class="pl-0 pr-0 py-1 my-2"
          data-testid="view-report-button"
          variant="link"
          @click="emit('view-report', item.runId)">
          {{ $t('reports.tabs.runHistory.table.viewReport') }}
        </BButton>
      </template>
      <template #cell(export)="{ item }">
        <template v-if="props.templateState !== 'draft' && (item.reportStatus === 'complete' || item.reportIsExpiredAndHasAtLeastOneDownload())">
          <BTooltip :target="item.tooltipId()">
            {{ item.tooltipLabel() }}
          </BTooltip>
          <BDropdown
            boundary="window"
            class="p-0"
            data-testid="actions-dropdown"
            no-caret
            right
            toggle-class="text-decoration-none p-0"
            variant="link">
            <template #button-content>
              <div
                class="p-2"
                :id="item.tooltipId()">
                <BSpinner
                  v-if="item.hasAnyActiveExports() || item.hasAnyActiveDownloads()"
                  small
                  :label="$t('common.loadingEtc')" />
                <FrIcon
                  v-else
                  :icon-class="`${item.hasAnyErrors() ? 'text-danger' : 'text-dark'} md-24`"
                  :name="item.hasAnyErrors() ? 'error_outline' : 'file_download'" />
              </div>
            </template>
            <BDropdownGroup>
              <template
                v-for="(exportStatus, fileType) in item.export"
                :key="fileType">
                <BDropdownItem
                  v-if="item.reportStatus === 'complete' || item.reportIsExpiredAndFileTypeHasDownload(exportStatus)"
                  class="fr-run-history-table-options"
                  :disabled="exportStatus === 'downloading' || ((exportStatus === 'export' || exportStatus === 'error') && item.hasAnyActiveExports())"
                  :data-testid="`${fileType}-${exportStatus}-button`"
                  @click="exportHandler(fileType, item, exportStatus)">
                  <FrReportExportButtons
                    :file-type="fileType"
                    :export-status="exportStatus"
                    :label="item.statusLabel(exportStatus, fileType)" />
                </BDropdownItem>
              </template>
            </BDropdownGroup>
          </BDropdown>
        </template>
      </template>
      <template #cell(actions)="{ item }">
        <FrActionsCell
          v-if="item.reportStatus === 'complete' || item.reportStatus === 'expired'"
          test-id="ellipse-menu"
          :delete-option="false"
          :divider="false"
          :edit-option="false">
          <template #custom-top-actions>
            <BDropdownGroup>
              <BDropdownItem
                class="d-lg-none"
                @click="emit('view-report', item.runId)">
                <FrIcon
                  data-testid="view-report-option"
                  icon-class="mr-3"
                  name="description">
                  {{ $t('reports.tabs.runHistory.table.viewReport') }}
                </FrIcon>
              </BDropdownItem>
              <BDropdownItem @click="emit('view-run-details', item)">
                <FrIcon
                  data-testid="view-run-option"
                  icon-class="mr-3"
                  name="list_alt">
                  {{ $t('reports.tabs.runHistory.table.runDetails') }}
                </FrIcon>
              </BDropdownItem>
            </BDropdownGroup>
          </template>
        </FrActionsCell>
      </template>
    </BTable>
    <FrPagination
      v-if="tableRows.length"
      v-model="currentPage"
      :per-page="itemsPerPage"
      :total-rows="tableRows.length"
      @input="paginationChange"
      @on-page-size-change="pageSizeChange" />
  </div>
</template>

<script setup>
/**
 * @description Table for displaying analytics reports history
 */
import { ref, watch } from 'vue';
import {
  BButton,
  BDropdown,
  BDropdownGroup,
  BDropdownItem,
  BSpinner,
  BTable,
  BTooltip,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrReportExportButtons from './RunHistoryExportButtons';
import FrRunReportBadges from './RunReportBadges';
import useRunHistoryTable from './composables/RunHistoryTable';

const props = defineProps({
  exportInProgress: {
    type: Boolean,
    default: false,
  },
  reportRuns: {
    type: Array,
    default: () => [],
  },
  templateState: {
    type: String,
    default: '',
  },
  updatedRow: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'download-report',
  'export-report',
  'table-data-ready',
  'view-report',
  'view-run-details']);

/**
 * GLOBALS
 */
const { reportHistoryTableDataGenerator, tableColumns } = useRunHistoryTable();
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref('date');
const sortDesc = ref(true);
const tableRows = ref([]);

/**
 * ACTIONS
 * @description
 * .Change in how many results to show
 * .Page change
 * .Export request
 * .Updates a single table data row
 * .Updates a complete list of table data
 */

/**
 * Listener for the on-page-size-change event emmited by the
 * pagination component when the size of results is changed.
 * @param {Number} pageSize page size number
 */
function pageSizeChange(pageSize) {
  itemsPerPage.value = pageSize;
}

/**
 * Listener for the input event emmited by the
 * pagination component when the page is changed.
 * @param {Number} page page number
 */
function paginationChange(page) {
  currentPage.value = page;
}

/**
 * Emits a request to export or download a report file.
 * @param {String} fileType report type: JSON || CSV
 * @param {Object} item Report job table item
 * @param {String} exportStatus Report status: 'export' || 'exporting' || 'download' || 'downloading' || 'error'
 */
function exportHandler(fileType, item, exportStatus) {
  if (exportStatus === 'download' || exportStatus === 'downloading') {
    emit('download-report', { fileType, item, exportStatus });
  } else {
    emit('export-report', { fileType, item, exportStatus });
  }
}

/**
 * Replaces a single object in the tableRows array
 * @param {Array} replacementRow new report run row data
 */
function updateTableRow(replacementRow) {
  const tableRowsWithoutRowToReplace = tableRows.value.filter((existingRow) => existingRow.runId !== replacementRow[0].runId);
  tableRows.value = [...tableRowsWithoutRowToReplace, ...replacementRow];
}

/**
 * Sets the table data that displays all report runs
 * @param {Array} reportRuns list of all report runs
 */
function setTableData(reportRuns) {
  const tableData = reportHistoryTableDataGenerator(reportRuns);
  tableRows.value = tableData;
  emit('table-data-ready');
}

/**
 * WATCHERS
 */
watch(() => props.reportRuns, (newRuns) => setTableData(newRuns));
watch(() => props.updatedRow, (newRow) => updateTableRow(newRow));

/**
 * START
 */
(() => setTableData(props.reportRuns))();
</script>

<style lang="scss" scoped>
  :deep(.table-responsive) {
    /* Hide default sort icon */
    .fr-bg-none {
      background: none !important;
    }
    .fr-report-history-start-date {
      width: auto;
      padding-right: 0;
    }
    .fr-report-history-start-date-container {
      @media (min-width: 992px) {
        min-height: 48px;
      }
    }
    .fr-report-history-actions {
      width: 74px;
    }
    .fr-report-history-status {
      width: auto;
    }
    .fr-view-report {
      width: 140px;
    }
    .fr-export-report {
      width: 76px;
    }
    .fr-report-export-button {
      width: 90px;
    }

    .fr-run-history-table-options {
      width: 196px;
    }

    .fr-report-badges {
      width: 104px;
    }
  }
</style>
