/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import useRunHistoryTable from './RunHistoryTable';

describe('@useRunHistoryTable', () => {
  const {
    getDownloadFormatType,
    reportHistoryTableDataGenerator,
    tableColumns,
    updateValueInNestedObject,
  } = useRunHistoryTable();

  const runReportStub = [{
    createDate: '2023-10-22T20:10:16.901960639Z',
    exportCsvStatus: 'EXPORT_SUCCESS',
    exportJsonStatus: null,
    parameters: '{"org_names":["Sales"]}',
    reportConfig: '{"parameters": {"org_names": {}}}',
    runId: 'job_0123',
    status: 'COMPLETED_SUCCESS',
  }];

  const myTableRowItemStub = {
    date: '2023-10-22T20:10:16.901960639Z',
    runId: 'job_0123',
    reportStatus: 'complete',
    download: {
      JSON: 'download',
      CSV: 'download',
    },
  };

  describe('@unit', () => {
    it('returns the expected format type for a given file type', () => {
      const JSONFormatType = getDownloadFormatType('JSON');
      expect(JSONFormatType).toEqual('jsonl');

      const CSVFormatType = getDownloadFormatType('CSV');
      expect(CSVFormatType).toEqual('csv');
    });

    it('expects to update a value in a nested object while keeping the rest of the original object values and returning a new object', () => {
      const newObjectWithUpdatedValue = updateValueInNestedObject(myTableRowItemStub, 'reportStatus', 'processing');
      // make sure original object not mutated
      expect(myTableRowItemStub.reportStatus).toEqual('complete');
      expect(newObjectWithUpdatedValue.reportStatus).toEqual('processing');

      // second level property update test
      const newObjectWithUpdatedNestedValue = updateValueInNestedObject(myTableRowItemStub, 'download.JSON', 'downloading');
      // make sure original object not mutated
      expect(myTableRowItemStub.download.JSON).toEqual('download');
      expect(newObjectWithUpdatedNestedValue.download.JSON).toEqual('downloading');
    });

    it('returns the expected table column keys', () => {
      const expectedColumnNames = ['date', 'reportStatus', 'actions'];
      const tableColumnKeys = tableColumns.map((item) => item.key);

      expect(tableColumnKeys).toEqual(expectedColumnNames);
    });

    it('takes in raw report history data from the api and returns a table ready array of objects', () => {
      const tableReadyArrayOfObjects = reportHistoryTableDataGenerator(runReportStub);
      expect(tableReadyArrayOfObjects.length).toEqual(1);

      // we make sure that the first object output has the expected properties with values.
      expect(tableReadyArrayOfObjects[0].date.length).toBeTruthy();
      expect(tableReadyArrayOfObjects[0].runId.length).toBeTruthy();
      expect(tableReadyArrayOfObjects[0].download.JSON.length).toBeTruthy();
      expect(tableReadyArrayOfObjects[0].download.CSV.length).toBeTruthy();
    });

    it('ensures that the table item method, "hasAnyActiveDownloads", returns true if any files have a state of "downloading"', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);
      const newItemWithFileDownloading = updateValueInNestedObject(tableReadyObject, 'download.CSV', 'downloading');

      expect(tableReadyObject.hasAnyActiveDownloads()).toEqual(false);
      expect(newItemWithFileDownloading.hasAnyActiveDownloads()).toEqual(true);
    });

    it('ensures that the table item method, "statusLabel", returns the expected label from the given status and file-type', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);

      expect(tableReadyObject.statusLabel('download', 'JSON')).toBe('Download JSON');
      expect(tableReadyObject.statusLabel('downloading', 'JSON')).toBe('Downloading JSON');
    });

    it('generates a valid tooltipId for the given file-type', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);

      expect(tableReadyObject.tooltipId('JSON')).toBe('tooltip-job_0123');
    });

    it('ensures that the initial download status defaults to "download"', () => {
      const [tableReadyObject] = reportHistoryTableDataGenerator(runReportStub);

      expect(tableReadyObject.download.JSON).toBe('download');
      expect(tableReadyObject.download.CSV).toBe('download');
    });
  });
});
