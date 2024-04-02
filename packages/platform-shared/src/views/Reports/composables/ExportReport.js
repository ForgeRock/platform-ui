/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { downloadFile, getFileNameFromContentDisposition } from '@forgerock/platform-shared/src/utils/downloadFile';
import { exportReport } from '@forgerock/platform-shared/src/api/AutoApi';
import { requestReportRuns } from '@forgerock/platform-shared/src/utils/reportsUtils';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import store from '@/store';
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
      const [fetchReport] = await requestReportRuns({ runId: id, name: template, realm: store.state.realm });
      jsonStatus.value = fetchReport.exportJsonStatus === 'EXPORT_SUCCESS';
      csvStatus.value = fetchReport.exportCsvStatus === 'EXPORT_SUCCESS';
    } catch (err) {
      showErrorMessage(err, i18n.global.t('common.error'));
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
        bvModal.value.show('export-modal');
      } else {
        status.value = 'downloading';
      }
      const response = await exportReport(template, id, action, format);
      const { data } = response;

      await getStatus(template, id);

      if (response.status === 200) {
        if (action === 'download') {
          const fileName = getFileNameFromContentDisposition(response.headers.get('content-disposition'));
          const isZip = fileName.includes('.zip');
          let file = '';
          let contentType = '';

          if (isZip) {
            file = await response.arrayBuffer();
            contentType = 'application/zip';
          } else if (type.value === 'JSON') {
            file = await response.text();
            contentType = 'application/json;charset=utf-8';
          } else if (type.value === 'CSV') {
            file = await response.text();
            contentType = 'text/csv;charset=utf-8';
          }
          downloadFile(file, contentType, fileName);
          displayNotification('success', i18n.global.t('reports.downloadComplete'));
        } else if (action === 'export') {
          displayNotification('success', i18n.global.t('reports.reportExported'));
          isExported.value = true;
        }
        status.value = 'download';
      } else if ('message' in data && !data.message.includes('Export has been initiated')) {
        showErrorMessage(data.message, data.message);
      }
    } catch (err) {
      status.value = 'error';
      showErrorMessage(err, i18n.global.t('common.error'));
    } finally {
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
