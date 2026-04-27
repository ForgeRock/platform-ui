/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import {
  createAppContainer,
  createTooltipContainer,
  findByTestId,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as ReportsApiHelper from './utils/ReportsApiHelper';
import i18n from '@/i18n';
import RunHistory from './RunHistory';
import HistoryStubs from './ReportHistoryStubs';

mockRouter({ params: { template: 'template-name', state: 'draft' } });
mockModal();
jest.mock('@forgerock/platform-shared/src/utils/downloadFile');

// Mock implementations must come after jest.mock()
const { downloadFile, getFileNameFromContentDisposition } = require('@forgerock/platform-shared/src/utils/downloadFile');

downloadFile.mockImplementation((file, fileType, fileName) => ({
  file,
  fileType,
  fileName,
}));

getFileNameFromContentDisposition.mockImplementation(() => 'default-filename.csv');

let showErrorMessage;

describe('Run History component', () => {
  function setup(props) {
    createTooltipContainer(['tooltip-job_0123', 'tooltip-job_1112', 'tooltip-job_4567']);
    ({ showErrorMessage } = mockNotification());
    const wrapper = mount(RunHistory, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
    const domWrapper = new DOMWrapper(document.body);
    return { wrapper, domWrapper };
  }

  let wrapper;
  let domWrapper;

  function getTableRows(wrapperInstance) {
    const table = findByTestId(wrapperInstance, 'run-history-table');
    return table.find('tbody').findAll('tr[role="row"]');
  }

  async function openEllipseMenu(wrapperInstance,
    {
      rowIndex = 0,
      tooltipId,
      testId = 'actions-run-history-export',
      icon,
    } = {}) {
    let row;
    if (tooltipId) {
      row = getTableRows(wrapperInstance).find((r) => r.find(`#${tooltipId}`).exists());
      if (!row) throw new Error(`Row with tooltipId ${tooltipId} not found`);
    } else {
      row = getTableRows(wrapperInstance)[rowIndex];
    }
    const host = findByTestId(row, testId);
    await toggleActionsMenu(host, 0, icon);
  }

  describe('@renders', () => {
    it('displays the spinner on mount', async () => {
      ({ wrapper } = setup());
      const spinner = wrapper.find('.spinner-large');
      expect(spinner.exists()).toBe(true);
    });

    describe('on data load initial table view', () => {
      beforeEach(() => {
        document.body.innerHTML = '';
        ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
        ({ wrapper, domWrapper } = setup({
          newReportJobId: 'job_0123',
          reportConfig: {},
          templateName: 'template-name',
          templateState: 'published',
        }));
      });

      it('displays the table of historical report requests', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        expect(tableRows.length).toBe(4);
      });

      it('displays a "vanity" loading state on the first table entry for a newly created report request', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const firstTableRow = tableRows[0];
        const firstTableRowStatus = firstTableRow.find('[role="status"]');
        expect(firstTableRowStatus.text()).toBe('Loading...');
      });

      it('displays a "running" state on any report that has a status of "RUNNING" until the report returns a state other than "RUNNING"', async () => {
        ReportsApiHelper.requestReportRuns = jest.fn()
          .mockReturnValueOnce(Promise.resolve([{
            createDate: '2024-11-22T20:10:21.901960639Z',
            exportCsvStatus: 'EXPORT_SUCCESS',
            exportJsonStatus: null,
            parameters: '{"org_names":["Sales"],"startDate":"2024-01-12T00:00:00.000Z","endDate":"2025-01-12T00:00:00.000Z"}',
            reportConfig: '{"parameters":{"org_names":{label:"Organization Names"},"startDate":{label:"Timeframe"},"endDate":{label:"Timeframe"}}',
            runId: 'job_0123',
            status: 'RUNNING',
          }]))
          .mockReturnValue(Promise.resolve([{
            createDate: '2024-11-22T20:10:21.901960639Z',
            exportCsvStatus: 'EXPORT_SUCCESS',
            exportJsonStatus: null,
            parameters: '{"org_names":["Sales"],"startDate":"2024-01-12T00:00:00.000Z","endDate":"2025-01-12T00:00:00.000Z"}',
            reportConfig: '{"parameters":{"org_names":{label:"Organization Names"},"startDate":{label:"Timeframe"},"endDate":{label:"Timeframe"}}',
            runId: 'job_0123',
            status: 'COMPLETED_SUCCESS',
          }]));
        jest.useFakeTimers();
        ({ wrapper } = setup({
          reportConfig: {},
          templateName: 'template-name',
          templateState: 'published',
        }));

        // First time around should show the loading state because the report is still running
        await nextTick();
        let table = findByTestId(wrapper, 'run-history-table');
        let tableRows = table.find('tbody').findAll('tr[role="row"]');
        let firstTableRow = tableRows[0];
        const firstTableRowStatus = firstTableRow.find('[role="status"]');
        expect(firstTableRowStatus.text()).toBe('Loading...');

        // Flush promises and run setTimeout to simulate the polling interval
        await flushPromises();
        jest.runAllTimers();
        await nextTick();
        await nextTick();

        // Second time around should show the complete state because the report has finished running
        table = findByTestId(wrapper, 'run-history-table');
        tableRows = table.find('tbody').findAll('tr[role="row"]');
        [firstTableRow] = tableRows;
        const badge = findByTestId(firstTableRow, 'fr-complete-report-badge');
        expect(badge.text()).toBe('Complete');
        jest.useRealTimers();
      });

      it('ensures that on load, table items are sorted by most recently created', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const firstTableRowDate = tableRows[0].find('.fr-report-history-status');
        const secondTableRowDate = tableRows[1].find('.fr-report-history-status');
        const thirdTableRowDate = tableRows[2].find('.fr-report-history-status');
        const fourthTableRowDate = tableRows[3].find('.fr-report-history-status');
        expect(firstTableRowDate.text()).toMatch(/(Loading...)/i);
        expect(secondTableRowDate.text()).toBe('Error');
        expect(thirdTableRowDate.text()).toBe('Expired');
        expect(fourthTableRowDate.text()).toBe('Complete');
      });

      it('hides the view details, action and ellipse dropdown buttons when a report is processing or loading (running)', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const tableRowProcessing = tableRows[0];
        const viewReportButton = findByTestId(tableRowProcessing, 'view-report-button');
        const actionsDropdown = findByTestId(tableRowProcessing, 'actions-run-history-export');
        const ellipseMenu = findByTestId(tableRowProcessing, 'ellipse-menu');

        expect(viewReportButton.exists()).toBe(false);
        expect(actionsDropdown.exists()).toBe(false);
        expect(ellipseMenu.exists()).toBe(false);
      });

      it('hides the view details, action and ellipse dropdown buttons when a report is in an error state', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const tableRowError = tableRows[1];
        const viewReportButton = findByTestId(tableRowError, 'view-report-button');
        const actionsDropdown = findByTestId(tableRowError, 'actions-run-history-export');
        const ellipseMenu = findByTestId(tableRowError, 'ellipse-menu');

        expect(viewReportButton.exists()).toBe(false);
        expect(actionsDropdown.exists()).toBe(false);
        expect(ellipseMenu.exists()).toBe(false);
      });

      it('hides the view details and export buttons for a report that is in an expired state', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const tableRowExpired = tableRows[2];
        const viewReportButton = findByTestId(tableRowExpired, 'view-report-button');

        expect(viewReportButton.exists()).toBe(false);
      });

      it('shows available download buttons for a report that is in an expired state', async () => {
        await openEllipseMenu(wrapper, { rowIndex: 2, testId: 'actions-run-history-export', icon: 'file_download' });
        expect(findByTestId(domWrapper, 'CSV-download-button').exists()).toBe(true);
      });

      it('does not display the "vanity" loading state on the first table entry if there is a missing newReportJobId prop value', async () => {
        ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
        ({ wrapper } = setup({
          reportConfig: {},
          templateName: 'template-name',
          templateState: 'published',
        }));

        await nextTick();
        const firstRow = getTableRows(wrapper)[0];
        expect(firstRow.find('.fr-report-history-status').text()).toBe('Complete');
      });
    });
  });

  describe('@actions', () => {
    beforeEach(() => {
      ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
      ({ wrapper, domWrapper } = setup({
        reportConfig: {},
        templateName: 'template-name',
        templateState: 'published',
      }));
    });

    it('changes the route to the "full report view" when the "View Report" button is clicked', () => {
      const completeRow = getTableRows(wrapper)[3];
      const viewReportButton = completeRow.find('.sticky-right').find('button');
      expect(viewReportButton.exists()).toBe(true);
    });

    it('makes an export request network call when an export button is clicked and ensures that the button state updates from loading to download upon resolution', async () => {
      const requestReportResponseStub = [HistoryStubs[0]].map((stub) => ({
        ...stub,
        exportJsonStatus: 'EXPORT_SUCCESS',
      }));

      ReportsApiHelper.requestExport = jest.fn().mockReturnValue(Promise.resolve({ data: { message: '' } }));
      ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(requestReportResponseStub));
      const requestExportSpy = jest.spyOn(ReportsApiHelper, 'requestExport');
      const requestReportRunsSpy = jest.spyOn(ReportsApiHelper, 'requestReportRuns');

      await openEllipseMenu(wrapper, { rowIndex: 0, testId: 'actions-run-history-export', icon: 'file_download' });
      const JSONExportButton = findByTestId(domWrapper, 'JSON-export-button');
      await JSONExportButton.trigger('click');
      await nextTick();
      expect(requestExportSpy).toHaveBeenCalledWith('job_0123', 'export', 'TEMPLATE-NAME', 'jsonl');
      expect(requestReportRunsSpy).toHaveBeenCalledWith({
        name: 'TEMPLATE-NAME',
        runId: 'job_0123',
        templateType: 'published',
        realm: undefined,
      });

      await flushPromises();
      await openEllipseMenu(wrapper, { rowIndex: 0, testId: 'actions-run-history-export', icon: 'file_download' });
      const JSONDownloadButton = findByTestId(domWrapper, 'JSON-download-button');
      expect(JSONDownloadButton.find('.material-icons-outlined').text()).toBe('file_download');
    });

    it('should only allow one export request at a time for the same report', async () => {
      const requestReportResponseStub = [HistoryStubs[1]].map((stub) => ({
        ...stub,
        exportJsonStatus: 'EXPORT_PENDING',
      }));

      ReportsApiHelper.requestExport = jest.fn().mockReturnValue(Promise.resolve({ data: { message: '' } }));
      ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(requestReportResponseStub));

      await openEllipseMenu(wrapper, { tooltipId: 'tooltip-job_4567', testId: 'actions-run-history-export', icon: '' });
      const JSONExportButton = findByTestId(domWrapper, 'JSON-export-button');
      await JSONExportButton.trigger('click');
      await nextTick();
      await openEllipseMenu(wrapper, { tooltipId: 'tooltip-job_4567', testId: 'actions-run-history-export', icon: '' });
      const refreshedCSVExportButton = findByTestId(domWrapper, 'CSV-export-button');
      const disabledAttr = refreshedCSVExportButton.attributes('disabled')
        || refreshedCSVExportButton.attributes('aria-disabled');
      expect(disabledAttr).toBeTruthy();
    });

    it('makes a download request network call when a download button is clicked', async () => {
      AutoApi.fetchDownload = jest.fn().mockReturnValue(Promise.resolve({
        status: 200,
        headers: {
          get: jest.fn(() => 'filename=my-informative-report.csv'),
        },
        data: '',
        text: jest.fn(() => ''),
      }));

      const requestDownloadSpy = jest.spyOn(AutoApi, 'fetchDownload');

      await openEllipseMenu(wrapper, { rowIndex: 0, testId: 'actions-run-history-export', icon: 'file_download' });
      const CSVDownloadButton = findByTestId(domWrapper, 'CSV-download-button');
      expect(CSVDownloadButton.find('.material-icons-outlined').text()).toBe('file_download');
      await CSVDownloadButton.trigger('click');
      expect(requestDownloadSpy).toHaveBeenCalledWith('job_0123', { _action: 'download', format: 'csv', name: 'template-name' });
    });

    it('shows error if download request fails', async () => {
      AutoApi.fetchDownload = jest.fn().mockReturnValue(Promise.resolve({
        status: 500,
        headers: {
          get: jest.fn(() => 'filename=my-informative-report.csv'),
        },
        data: '',
        text: () => Promise.resolve('Failure'),
      }));

      await openEllipseMenu(wrapper, { rowIndex: 0, testId: 'actions-run-history-export', icon: 'file_download' });

      const CSVDownloadButton = findByTestId(domWrapper, 'CSV-download-button');
      expect(CSVDownloadButton.find('.material-icons-outlined').text()).toBe('file_download');

      await CSVDownloadButton.trigger('click');
      expect(showErrorMessage).toHaveBeenCalled();
    });

    it('shows the report summary modal when the "Run Details" option is selected in the ellipses menu', async () => {
      await openEllipseMenu(wrapper, { rowIndex: 0, testId: 'actions-ellipse-menu' });
      const runDetailsOption = domWrapper.find('[data-testid="view-run-option"]');
      await runDetailsOption.trigger('click');
      expect(wrapper.vm.parametersForDetailsModal).toEqual([{ label: 'org_names', value: 'Sales' }]);
      expect(wrapper.vm.showDetailsModal).toEqual(true);
    });
  });
});
