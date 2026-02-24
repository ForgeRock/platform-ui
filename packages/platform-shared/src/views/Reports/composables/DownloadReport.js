/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { downloadFile, getFileNameFromContentDisposition } from '@forgerock/platform-shared/src/utils/downloadFile';
import { downloadReport } from '@forgerock/platform-shared/src/api/AutoApi';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

export default function useDownloadReport() {
  const loadingDownload = ref(false);
  const loadingCsv = ref(false);
  const loadingJson = ref(false);

  /**
   * Calls the endpoint to download a report using _action=downloadreport.
   * @param {String} template The name of the template.
   * @param {String} id The Job ID of the Report Run.
   * @param {String} format The file format (csv or jsonl).
   */
  const fetchDownload = async (template, id, format) => {
    try {
      loadingDownload.value = true;
      if (format === 'csv') {
        loadingCsv.value = true;
      } else {
        loadingJson.value = true;
      }

      const response = await downloadReport(template, id, format);

      if (response.status === 200) {
        const contentDisposition = response.headers.get('content-disposition');
        const fileNameFromHeader = contentDisposition
          ? getFileNameFromContentDisposition(contentDisposition).replace(/\.jsonl$/, '.json')
          : null;

        const fallbackName = `report.${format === 'csv' ? 'csv' : 'json'}`;
        const fileName = fileNameFromHeader || fallbackName;
        const isZip = fileName.includes('.zip');
        let file = '';
        let contentType = '';

        if (isZip) {
          file = await response.arrayBuffer();
          contentType = 'application/zip';
        } else if (format === 'jsonl') {
          file = await response.text();
          contentType = 'application/json;charset=utf-8';
        } else if (format === 'csv') {
          file = await response.text();
          contentType = 'text/csv;charset=utf-8';
        }
        downloadFile(file, contentType, fileName);
        displayNotification('success', i18n.global.t('reports.downloadComplete'));
      } else {
        const errorText = await response.text();
        showErrorMessage(errorText, i18n.global.t('common.error'));
      }
    } catch (err) {
      showErrorMessage(err, i18n.global.t('common.error'));
    } finally {
      if (format === 'csv') {
        loadingCsv.value = false;
      } else {
        loadingJson.value = false;
      }
      loadingDownload.value = loadingCsv.value || loadingJson.value;
    }
  };

  return {
    fetchDownload,
    loadingDownload,
    loadingCsv,
    loadingJson,
  };
}
