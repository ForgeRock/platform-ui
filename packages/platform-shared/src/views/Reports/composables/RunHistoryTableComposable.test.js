/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import useRunHistoryTable from './RunHistoryTable';

describe('@useRunHistoryTable', () => {
  const {
    getExportFormatType,
    reportHistoryTableDataGenerator,
    tableColumns,
    updateValueInNestedObject,
  } = useRunHistoryTable();

  const runReportStub = [{
    createDate: '2023-10-22T20:10:16.901960639Z',
    exportCsvStatus: 'EXPORT_SUCCESS',
    exportJsonStatus: null,
    parameters: '{"org_names":["Sales"], "realm": "alpha"}',
    reportConfig: '{"parameters": {"org_names": {}, "realm": {}}}',
    runId: 'job_0123',
    status: 'COMPLETED_SUCCESS',
  }];

  const myTableRowItemStub = {
    date: '2023-10-22T20:10:16.901960639Z',
    runId: 'job_0123',
    reportStatus: 'complete',
    export: {
      JSON: 'export',
      CSV: 'download',
    },
  };

  describe('@unit', () => {
    it('returns the expected format type for a given file type', () => {
      const JSONFormatType = getExportFormatType('JSON');
      expect(JSONFormatType).toEqual('jsonl');

      const CSVFormatType = getExportFormatType('CSV');
      expect(CSVFormatType).toEqual('csv');
    });

    it('expects to update a value in a nested object while keeping the rest of the original object values and returning a new object', () => {
      const newObjectWithUpdatedValue = updateValueInNestedObject(myTableRowItemStub, 'reportStatus', 'processing');
      // make sure original object not mutated
      expect(myTableRowItemStub.reportStatus).toEqual('complete');
      expect(newObjectWithUpdatedValue.reportStatus).toEqual('processing');

      // second level property update test
      const newObjectWithUpdatedNestedValue = updateValueInNestedObject(myTableRowItemStub, 'export.JSON', 'error');
      // make sure original object not mutated
      expect(myTableRowItemStub.export.JSON).toEqual('export');
      expect(newObjectWithUpdatedNestedValue.export.JSON).toEqual('error');
    });

    it('returns the expected table column keys', () => {
      const expectedColumnNames = ['date', 'reportStatus', 'view-report', 'export', 'actions'];
      const tableColumnKeys = tableColumns.map((item) => item.key);

      expect(tableColumnKeys).toEqual(expectedColumnNames);
    });

    it('takes in raw report history data from the api and returns a table ready array of objects', () => {
      const tableReadyArrayOfObjects = reportHistoryTableDataGenerator(runReportStub);
      expect(tableReadyArrayOfObjects.length).toEqual(1);

      // we make sure that the first object output has the expected properties with values.
      expect(tableReadyArrayOfObjects[0].date.length).toBeTruthy();
      expect(tableReadyArrayOfObjects[0].runId.length).toBeTruthy();
      expect(tableReadyArrayOfObjects[0].export.JSON.length).toBeTruthy();
      expect(tableReadyArrayOfObjects[0].export.CSV.length).toBeTruthy();
    });

    it('ensures that the item method, "canDownload", returns true if argument is equal to "download" or "downloading"', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);

      expect(tableReadyObject.canDownload('download')).toEqual(true);
      expect(tableReadyObject.canDownload('downloading')).toEqual(true);
      expect(tableReadyObject.canDownload('error')).toEqual(false);
    });

    it('ensures that the table item method, "hasAnyActiveExports", returns true if any export files, in a table item object, have a state of "exporting"', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);
      const newItemWithFileExporting = updateValueInNestedObject(tableReadyObject, 'export.CSV', 'exporting');

      expect(tableReadyObject.hasAnyActiveExports()).toEqual(false);
      expect(newItemWithFileExporting.hasAnyActiveExports()).toEqual(true);
    });

    it('ensures that the table item method, "reportIsExpiredAndFileTypeHasDownload", returns true if the report is expired and the given file-type has an available download', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);
      const newItemWithExpiredReport = updateValueInNestedObject(tableReadyObject, 'reportStatus', 'expired');

      expect(tableReadyObject.reportIsExpiredAndFileTypeHasDownload(tableReadyObject.export.JSON)).toEqual(false);
      expect(newItemWithExpiredReport.reportIsExpiredAndFileTypeHasDownload(newItemWithExpiredReport.export.CSV)).toEqual(true);
    });

    it('ensures that the table item method, "reportIsExpiredAndHasAtLeastOneDownload", returns true if the report is expired and has at least one available download', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);
      const newItemWithExpiredReport = updateValueInNestedObject(tableReadyObject, 'reportStatus', 'expired');
      const newItemWithExpiredReportAndNoDownloads = updateValueInNestedObject(newItemWithExpiredReport, 'export.CSV', 'export');

      expect(tableReadyObject.reportIsExpiredAndHasAtLeastOneDownload(tableReadyObject.export.JSON)).toEqual(false);
      expect(newItemWithExpiredReport.reportIsExpiredAndHasAtLeastOneDownload(newItemWithExpiredReport.export.CSV)).toEqual(true);
      expect(newItemWithExpiredReportAndNoDownloads.reportIsExpiredAndHasAtLeastOneDownload()).toEqual(false);
    });

    it('ensures that the table item method, "statusLabel", returns the expected label from the given status and file-type', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);

      expect(tableReadyObject.statusLabel('export', 'JSON')).toBe('Export JSON');
      expect(tableReadyObject.statusLabel('exporting', 'JSON')).toBe('Exporting JSON');
      expect(tableReadyObject.statusLabel('download', 'JSON')).toBe('Download JSON');
      expect(tableReadyObject.statusLabel('downloading', 'JSON')).toBe('Downloading JSON');
    });

    it('generates a valid tooltipId for the given file-type', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);

      expect(tableReadyObject.tooltipId('JSON')).toBe('tooltip-job_0123');
    });
  });
});
