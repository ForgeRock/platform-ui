<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard body-class="p-0">
    <FrSpinner
      v-if="isLoading"
      class="py-5 my-4" />
    <FrRunHistoryTable
      v-else
      :report-runs="reportRuns"
      :template-state="props.templateState"
      :updated-row="updateSingleTableRow"
      @download-report="downloadReport($event)"
      @export-report="exportReport($event)"
      @table-data-ready="$emit('table-data-ready')"
      @view-report="viewReport($event)"
      @view-run-details="viewReportRequestSummary" />
    <FrReportExportModal
      :file-type="exportModalFileType"
      :data="exportModalData"
      :status="exportModalStatus"
      @download-report="downloadReport($event)"
      @show="exportModalStatus = 'exporting'" />
    <FrRunHistoryDetailsModal
      :table-item="tableItemForDetailsModal"
      :parameters="parametersForDetailsModal"
      :show="showDetailsModal"
      @modal-toggle="showDetailsModal = $event" />
  </BCard>
</template>

<script setup>
/**
 * @description Displays analytics reports history
 */
import { ref, watch, onBeforeUnmount } from 'vue';
import { BCard } from 'bootstrap-vue';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { downloadFile, getFileNameFromContentDisposition } from '@forgerock/platform-shared/src/utils/downloadFile';
import { fetchDownload } from '@forgerock/platform-shared/src/api/AutoApi';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { requestExport, requestReportRuns } from './utils/ReportsApiHelper';
import FrRunHistoryTable from './RunHistoryTable';
import FrReportExportModal from './modals/ReportExportModal';
import FrRunHistoryDetailsModal from './modals/RunHistoryDetailsModal';
import useRunHistoryTable from './composables/RunHistoryTable';
import store from '@/store';
import i18n from '@/i18n';

// Composables
const router = useRouter();
const route = useRoute();
const { bvModal } = useBvModal();

defineEmits(['table-data-ready']);
const props = defineProps({
  newReportJobId: {
    type: String,
    default: null,
  },
  reportConfig: {
    type: Object,
    default: null,
  },
  templateName: {
    type: String,
    default: '',
  },
  templateState: {
    type: String,
    default: '',
  },
});

/**
 * LOCALS
 */
const isLoading = ref(true);

/**
 * GLOBALS
 */
const exportModalFileType = ref('');
const exportModalData = ref({});
const exportModalStatus = ref('exporting');
const exportQueue = [];
const parametersForDetailsModal = ref({});
const reportRuns = ref([]);
const showDetailsModal = ref(false);
const tableItemForDetailsModal = ref({});
const updateSingleTableRow = ref([]);
const {
  getExportFormatType,
  reportHistoryTableDataGenerator,
  updateValueInNestedObject,
} = useRunHistoryTable();

/**
 * ACTIONS
 * @description
 * .View report details; route change
 * .View a summary of the original report request in a modal
 * .Updates export modal state between loading, download and error states
 * .Updates the status of the export / download buttons
 * .Export queue handler
 * .Download report event
 * .Export report event
 * .Sets a visual cue loader on newly requested reports
 */

/**
 * Route change to view the full report details
 * @param {String} runId Report job run ID
 */
function viewReport(runId) {
  router.push({
    name: 'ReportView',
    params: {
      state: route.params.state,
      template: props.templateName,
      id: runId,
    },
  });
}

/**
 * Opens the run details modal that displays the original
 * values that were entered when the report was requested.
 * @param {Object} item Table item object
 */
function viewReportRequestSummary(item) {
  const reportRun = reportRuns.value.find((original) => original.runId === item.runId);
  const reportRunParameters = JSON.parse(reportRun.parameters);
  const reportConfigParameters = JSON.parse(reportRun.reportConfig).parameters;
  const parametersNameAndValue = Object.keys(reportRunParameters).map((key) => {
    let { label } = reportConfigParameters[key];
    let value = reportRunParameters[key];

    if (label === 'Timeframe' && key === 'startDate') {
      label = i18n.global.t('reports.tabs.runReport.timeframe.startDate');
    }
    if (label === 'Timeframe' && key === 'endDate') {
      label = i18n.global.t('reports.tabs.runReport.timeframe.endDate');
    }
    if (Date.parse(value)) {
      value = dayjs(value).format('MM/DD/YYYY');
    }
    if (Array.isArray(value)) {
      value = value.join(', ');
    }

    return { label: (label || key), value };
  });
  parametersForDetailsModal.value = parametersNameAndValue;
  tableItemForDetailsModal.value = item;
  showDetailsModal.value = true;
}

/**
 * Updates the status of the export modal
 * @param {Object} item Report job property
 * @param {String} exportStatus Report status: 'exporting' || 'download' || 'error'
 * @param {String} fileType report type: JSON || CSV
 * @param {Number} asyncTimer Time that it took to resolve requests
 */
async function updateExportModalState(item, exportStatus, fileType, asyncTimer) {
  function setExportModalState() {
    exportModalData.value = item;
    exportModalStatus.value = exportStatus;
    exportModalFileType.value = fileType;
  }

  // If async requests take less than half a second to resolve, we want
  // to manually keep the spinner in the export modal for at least a
  // second, to give the user a visual cue that something is happening
  // before displaying the actual status of the export.
  if (asyncTimer < 500) {
    setTimeout(setExportModalState, 1000);
  } else {
    setExportModalState();
  }
}

/**
 * Receives an existing run table item object, then creates a copy
 * with the updated status value for the intended export button and
 * returns a new object that we then can use to update the table with.
 * @param {Object} item Report run table item
 * @param {String} fileType report type: JSON || CSV
 * @param {String} newStatus New button status
 * @returns {Array}
 */
function updateExportButtonStatus(item, fileType, newStatus) {
  return [updateValueInNestedObject(item, `export.${fileType}`, newStatus)];
}

/**
 * A queue system that keeps track of the state of a report where multiple async
 * events could be happening in parallel.  We reference the queue as the source
 * of truth and use it to update the state of the report as requests resolve.
 * @param {Object} item Report run table item
 * @param {String} fileType report type: JSON || CSV
 * @param {String} newStatus New button status
 * @returns {Object}
 */
function handleExportQueue(item, fileType, newStatus) {
  const currentItemIndexInQueue = exportQueue.findIndex((queue) => queue.runId === item.runId);
  const foundQueueItem = exportQueue[currentItemIndexInQueue];
  const [newItemWithUpdatedStatus] = updateExportButtonStatus(foundQueueItem || item, fileType, newStatus);

  // If a queue item exists, we retrieve it and replace it with the most
  // updated state, otherwise we push the new item object to the queue.
  if (foundQueueItem) {
    exportQueue.splice(currentItemIndexInQueue, 1, newItemWithUpdatedStatus);
  } else {
    exportQueue.push(newItemWithUpdatedStatus);
  }

  return newItemWithUpdatedStatus;
}

/**
 * Triggers a download report request
 * @param {String} fileType report type: JSON || CSV
 * @param {Object} item Report run table item
 * @param {String} exportStatus Report status: 'download' || 'downloading'
 */
async function downloadReport({ fileType, item, exportStatus }) {
  // update globals
  updateSingleTableRow.value = updateExportButtonStatus(item, fileType, 'downloading');
  exportModalStatus.value = 'downloading';

  if (exportStatus !== 'downloading') {
    const { runId } = item;

    const fetchResponse = await fetchDownload(runId, {
      _action: 'download',
      name: props.templateName,
      format: getExportFormatType(fileType),
    });

    if (fetchResponse.status === 200) {
      const fileName = getFileNameFromContentDisposition(fetchResponse.headers.get('content-disposition'));
      const isZip = fileName.includes('.zip');
      let file = '';
      let contentType = '';

      if (isZip) {
        file = await fetchResponse.arrayBuffer();
        contentType = 'application/zip';
      } else if (fileType === 'JSON') {
        file = await fetchResponse.text();
        contentType = 'application/json;charset=utf-8';
      } else if (fileType === 'CSV') {
        file = await fetchResponse.text();
        contentType = 'text/csv;charset=utf-8';
      }
      downloadFile(file, contentType, fileName);
      bvModal.value.hide('export-modal');
    } else {
      fetchResponse.text().then((error) => {
        showErrorMessage(error, i18n.global.t('reports.tabs.runHistory.errors.errorDownload'));
      });
    }

    // We need to reference the queue here since there could be an export request for the
    // same report happening in parallel, which would overwrite the latest export state for
    // this item if we just replace the table row with the supplied item argument directly.
    const newItemWithDownloadStatus = handleExportQueue(item, fileType, 'download');
    updateSingleTableRow.value = [newItemWithDownloadStatus];
  }
}

/**
 * Triggers an export report request
 * @param {String} fileType report type: JSON || CSV
 * @param {Object} item Report run table item
 * @param {String} exportStatus Report status: 'export' || 'exporting' || 'error'
 */
async function exportReport({ fileType, item, exportStatus }) {
  const { runId } = item;
  const templateName = props.templateName.toUpperCase();
  const startTimer = Date.now();
  let endTimer = Date.now();

  // updates globals
  updateExportModalState(item, 'exporting', fileType, endTimer);
  bvModal.value.show('export-modal');

  if (exportStatus !== 'exporting') {
    const newItemWithExportingStatus = handleExportQueue(item, fileType, 'exporting');
    updateSingleTableRow.value = [newItemWithExportingStatus];

    const exportResponse = await requestExport(runId, 'export', templateName, getExportFormatType(fileType));
    if (exportResponse !== 'Error') {
      // We want to fetch the current report, which should have an updated
      // export status so we can update the export buttons with the latest state.
      const fetchReport = await requestReportRuns({
        runId,
        name: templateName,
        realm: store.state.realm,
        templateType: props.templateState,
      });
      const [newTableItemReport] = reportHistoryTableDataGenerator(fetchReport);
      const newExportStatus = newTableItemReport.export[fileType];
      const newItemWithFetchedStatus = handleExportQueue(newTableItemReport, fileType, newExportStatus);

      updateSingleTableRow.value = [newItemWithFetchedStatus];
      endTimer = Date.now();
      if (newExportStatus !== 'error') {
        displayNotification('success', i18n.global.t('reports.tabs.runHistory.downloadReady'));
      }
    } else {
      const newItemWithErrorStatus = handleExportQueue(item, fileType, 'error');
      updateSingleTableRow.value = [newItemWithErrorStatus];
    }

    if (exportModalData.value.runId === updateSingleTableRow.value[0].runId) {
      // We only want to update the modal state with the data
      // that corresponds with the current modal view data.
      const asyncTimer = endTimer - startTimer;
      const currentReportStatus = updateSingleTableRow.value[0].export[fileType];
      updateExportModalState(item, currentReportStatus, fileType, asyncTimer);
    }
  }
}

/**
 * Continuously polls the API for a report with a status of "RUNNING"
 * until the status property returns anything other than "RUNNING".
 * @param {String} runId Run ID of the report
 * @param {String} templateName template name
 * @param {Number} interval milliseconds
 */
let statusPollTimeout; // used for clearing on component unmount
function reportStatusPoll(runId, templateName, interval = 1500) {
  statusPollTimeout = setTimeout(async () => {
    const [report] = await requestReportRuns({
      runId,
      name: templateName,
      realm: store.state.realm,
      templateType: props.templateState,
    });

    if (report?.status === 'RUNNING') {
      reportStatusPoll(runId, templateName, 5000);
    } else if (report) {
      updateSingleTableRow.value = reportHistoryTableDataGenerator([report]);
    }
  }, interval);
}

/**
 * Sets a temporary "RUNNING" status on a newly created report for 1.5
 * seconds to give the user a visual cue as to where the new report lives
 * in the table. It then continuously polls all reports with a status of
 * "RUNNING" until the status property returns anything other than "RUNNING".
 * @param {Array} reportRunsData Raw list of all run reports from API.
 * @param {String} templateName template name
 * @param {String} latestReportJobId new report job id
 */
async function handleRunningStateForNewAndExistingReports(reportRunsData, templateName, latestReportJobId) {
  const newReportFromList = reportRunsData.find((run) => run.runId === latestReportJobId);

  if (newReportFromList) {
    const newReportWithVanityStatus = [updateValueInNestedObject(newReportFromList, 'status', 'RUNNING')];
    const listExcludingOldReport = reportRunsData.filter((run) => run.runId !== latestReportJobId);
    const vanityRunList = [...listExcludingOldReport, ...newReportWithVanityStatus];
    reportRuns.value = vanityRunList;
  } else {
    // If for some strange reason we can't find the new report, just set
    // the table with the original reports data that we get from the API.
    reportRuns.value = reportRunsData;
  }

  // Polls the API for all reports that have a status of "RUNNING" until the status changes
  // to a completed, failed or expired state, then updates the table with the new data.
  reportRuns.value.forEach((report) => {
    if (report.status === 'RUNNING') {
      reportStatusPoll(report.runId, templateName);
    }
  });
}

/**
 * INITIALIZE COMPONENT
 * @decription
 * Fetches all report runs and handles the running state for new and existing reports
 */
async function initialize() {
  const templateName = props.templateName.toUpperCase();
  const allReportRuns = await requestReportRuns({
    name: templateName,
    realm: store.state.realm,
    templateType: props.templateState,
  });

  handleRunningStateForNewAndExistingReports(allReportRuns, templateName, props.newReportJobId);
  isLoading.value = false;
}

/**
 * WATCHERS
 */
watch(() => props.reportConfig, (config) => {
  if (config) {
    initialize();
  }
});

/**
 * START
 */
(() => {
  if (props.reportConfig) {
    initialize();
  }
})();

onBeforeUnmount(() => clearTimeout(statusPollTimeout));
</script>
