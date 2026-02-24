<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

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
      @table-data-ready="$emit('table-data-ready')"
      @view-report="viewReport($event)"
      @view-run-details="viewReportRequestSummary" />
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
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { downloadFile, getFileNameFromContentDisposition } from '@forgerock/platform-shared/src/utils/downloadFile';
import { downloadReport as downloadReportApi } from '@forgerock/platform-shared/src/api/AutoApi';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { requestReportRuns } from './utils/ReportsApiHelper';
import FrRunHistoryTable from './RunHistoryTable';
import FrRunHistoryDetailsModal from './modals/RunHistoryDetailsModal';
import useRunHistoryTable from './composables/RunHistoryTable';
import store from '@/store';
import i18n from '@/i18n';

// Composables
const router = useRouter();
const route = useRoute();

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
const parametersForDetailsModal = ref({});
const reportRuns = ref([]);
const showDetailsModal = ref(false);
const tableItemForDetailsModal = ref({});
const updateSingleTableRow = ref([]);
const {
  getDownloadFormatType,
  reportHistoryTableDataGenerator,
  updateValueInNestedObject,
} = useRunHistoryTable();

/**
 * ACTIONS
 * @description
 * .View report details; route change
 * .View a summary of the original report request in a modal
 * .Updates the status of the download buttons
 * .Download report event
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
 * Receives an existing run table item object, then creates a copy
 * with the updated status value for the intended download button and
 * returns a new object that we then can use to update the table with.
 * @param {Object} item Report run table item
 * @param {String} fileType report type: JSON || CSV
 * @param {String} newStatus New button status
 * @returns {Array}
 */
function updateDownloadButtonStatus(item, fileType, newStatus) {
  return [updateValueInNestedObject(item, `download.${fileType}`, newStatus)];
}

/**
 * Triggers a one-step download report request using _action=downloadreport
 * @param {String} fileType report type: JSON || CSV
 * @param {Object} item Report run table item
 */
async function downloadReport({ fileType, item }) {
  const { runId } = item;

  // update table to show downloading state
  updateSingleTableRow.value = updateDownloadButtonStatus(item, fileType, 'downloading');

  try {
    const fetchResponse = await downloadReportApi(
      props.templateName,
      runId,
      getDownloadFormatType(fileType),
    );

    if (fetchResponse.status === 200) {
      const rawFileName = getFileNameFromContentDisposition(fetchResponse.headers.get('content-disposition'));
      const fileName = rawFileName ? rawFileName.replace(/\.jsonl$/, '.json') : null;
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
    } else {
      const error = await fetchResponse.text();
      showErrorMessage(error, i18n.global.t('reports.tabs.runHistory.errors.errorDownload'));
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.tabs.runHistory.errors.errorDownload'));
  } finally {
    updateSingleTableRow.value = updateDownloadButtonStatus(item, fileType, 'download');
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
