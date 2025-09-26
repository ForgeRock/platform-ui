/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';

export default function useRunHistoryTable() {
  /**
   * Determines the format value for an export / download request
   * @param {String} type File type
   * @returns {String}
   */
  function getExportFormatType(type) {
    switch (type) {
      case 'JSON':
        return 'jsonl';
      case 'CSV':
        return 'csv';
      default:
        return '';
    }
  }

  /**
   * Receives a list of report runs for the given template and
   * outputs a friendly data set for <BTable /> consumption.
   * @param {Array} runs list of historical report runs
   * @returns {Array}
   */
  function reportHistoryTableDataGenerator(runs) {
    if (!Array.isArray(runs)) {
      throw new Error('Argument should be an array');
    }

    const reportStatus = {
      RUNNING: 'processing',
      COMPLETED_SUCCESS: 'complete',
      COMPLETED_FAILED: 'error',
      EXPIRED: 'expired',
    };

    const exportStatus = {
      EXPORT_PENDING: 'exporting',
      EXPORT_SUCCESS: 'download',
      EXPORT_FAILED: 'error',
    };

    return runs.map((run) => ({
      date: run.createDate,
      runId: run.runId,
      reportStatus: reportStatus[run.status],
      export: {
        JSON: exportStatus[run.exportJsonStatus] || 'export',
        CSV: exportStatus[run.exportCsvStatus] || 'export',
      },
      canDownload(_exportStatus) {
        return _exportStatus === 'download' || _exportStatus === 'downloading';
      },
      filterByExportStatus(_exportStatus) {
        const allExports = this.export;
        return Object.keys(allExports).filter((fileType) => allExports[fileType] === _exportStatus);
      },
      hasAnyActiveDownloads() {
        return !!this.filterByExportStatus('downloading').length;
      },
      hasAnyActiveExports() {
        return !!this.filterByExportStatus('exporting').length;
      },
      hasAnyDownloads() {
        return !!this.filterByExportStatus('download').length || !!this.filterByExportStatus('downloading').length;
      },
      hasAnyErrors() {
        return !!this.filterByExportStatus('error').length;
      },
      reportIsExpiredAndFileTypeHasDownload(_exportStatus) {
        return this.reportStatus === 'expired' && this.canDownload(_exportStatus);
      },
      reportIsExpiredAndHasAtLeastOneDownload() {
        return this.reportStatus === 'expired' && this.hasAnyDownloads();
      },
      statusLabel(_exportStatus, fileType) {
        switch (_exportStatus) {
          case 'exporting':
            return i18n.global.t('reports.tabs.runHistory.table.exportingFile', { fileType });
          case 'download':
            return i18n.global.t('reports.tabs.runHistory.table.downloadFile', { fileType });
          case 'downloading':
            return i18n.global.t('reports.tabs.runHistory.table.downloadingFile', { fileType });
          default:
            return i18n.global.t('reports.tabs.runHistory.table.exportFile', { fileType });
        }
      },
      tooltipId() {
        return `tooltip-${this.runId.split('-').pop()}`;
      },
      tooltipLabel() {
        if (this.hasAnyActiveExports()) {
          return i18n.global.t('reports.tabs.runHistory.table.exportingFile', { fileType: '' });
        }
        if (this.hasAnyActiveDownloads()) {
          return i18n.global.t('reports.tabs.runHistory.table.downloadingFile', { fileType: '' });
        }
        return i18n.global.t('reports.tabs.runHistory.table.exportFile', { fileType: '' });
      },
    }));
  }

  /**
   * Table columns for the <BTable> component
   */
  const tableColumns = [
    {
      key: 'date',
      label: i18n.global.t('common.started'),
      class: 'fr-report-history-start-date fr-bg-none',
      sortable: true,
    },
    {
      key: 'reportStatus',
      label: i18n.global.t('common.status'),
      class: 'd-none d-lg-table-cell fr-report-history-status fr-bg-none',
      sortable: true,
    },
    {
      key: 'actions',
      label: '',
      class: 'w-200px p-2 pr-3 col-actions sticky-right',
    },
  ];

  /**
    * Traverses through an existing object and updates the target
    * property, while maintaining the rest of the original values
    * (as shallow references) and returning a new object.
    * @param {Object} collection source object
    * @param {String} path target path in period delimeter format: 'export.JSON'
    * @param {*} value replacement value
    * @returns {Object}
    */
  function updateValueInNestedObject(collection, path, value) {
    const pathList = path.split('.');

    // Recursive function that calls itself as many times
    // as the length of the pathList.
    function createDepth(obj, pathIndex) {
      const notTheEndOfThePath = pathIndex !== pathList.length - 1;
      const currentPathKey = pathList[pathIndex];
      return {
        ...obj,
        [currentPathKey]: notTheEndOfThePath
          ? createDepth(obj[currentPathKey], pathIndex + 1)
          : value,
      };
    }

    return createDepth(collection, 0);
  }

  return {
    getExportFormatType,
    reportHistoryTableDataGenerator,
    tableColumns,
    updateValueInNestedObject,
  };
}
