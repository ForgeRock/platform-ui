/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { downloadFile, getFileNameFromContentDisposition } from '@forgerock/platform-shared/src/utils/downloadFile';
import { getReportRuns, exportReport } from '@forgerock/platform-shared/src/api/AutoApi';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

export default function useExportReport() {
  const { bvModal } = useBvModal();
  const csvStatus = ref(null);
  const isExported = ref(false);
  const jsonStatus = ref(null);
  const loadingExport = ref(false);
  const loadingCsv = ref(false);
  const loadingJson = ref(false);
  const status = ref('exporting');
  const type = ref('');

  /**
   * Calls the endpoint to get the export status from the Report data.
   * @param {String} template The name of the template.
   * @param {String} id The Job ID of the Report Run.
   */
  const getStatus = async (template, id) => {
    try {
      const { result } = await getReportRuns({ name: template });
      const reportInfo = result.find((run) => run.runId === id);
      jsonStatus.value = reportInfo.exportJsonStatus === 'EXPORT_SUCCESS';
      csvStatus.value = reportInfo.exportCsvStatus === 'EXPORT_SUCCESS';
    } catch (err) {
      showErrorMessage(err, i18n.t('reports.error'));
    }
  };

  /**
   * Calls the endpoint to export or download a report.
   * @param {String} template The name of the template.
   * @param {String} id The Job ID of the Report Run.
   * @param {Object} format The object of the Report configuration.
   */
  const fetchExport = async (template, id, format) => {
    try {
      loadingExport.value = true;
      isExported.value = false;
      type.value = format === 'csv' ? 'CSV' : 'JSON';
      format === 'csv' ? loadingCsv.value = true : loadingJson.value = true;
      const fileStatus = format === 'csv' ? csvStatus.value : jsonStatus.value;
      const action = fileStatus ? 'download' : 'export';
      if (action === 'export') {
        status.value = 'exporting';
        bvModal.show('export-modal');
      } else {
        status.value = 'downloading';
      }
      const response = await exportReport(template, id, action, format);
      const { data } = response;

      if (action === 'download') {
        const file = format === 'csv' ? data : JSON.stringify(data, null, 2);
        const fileType = format === 'csv' ? 'text/csv' : 'application/json';
        const fileName = getFileNameFromContentDisposition(response.headers['content-disposition']);
        downloadFile(file, `${fileType};charset=utf-8`, fileName);
        displayNotification('success', i18n.t('reports.downloadComplete'));
      } else if ('message' in data && !data.message.includes('Export has been initiated')) {
        showErrorMessage(data.message, data.message);
      } else {
        displayNotification('success', i18n.t('reports.reportExported'));
        isExported.value = true;
      }
    } catch (err) {
      status.value = 'error';
      showErrorMessage(err, i18n.t('reports.error'));
    } finally {
      await getStatus(template, id);
      status.value = 'download';
      loadingExport.value = false;
      format === 'csv' ? loadingCsv.value = false : loadingJson.value = false;
    }
  };

  return {
    fetchExport,
    loadingExport,
    loadingCsv,
    loadingJson,
    csvStatus,
    jsonStatus,
    type,
    status,
  };
}
