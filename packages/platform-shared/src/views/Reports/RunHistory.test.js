/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createTooltipContainer, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';

import * as Notifications from '@forgerock/platform-shared/src/utils/notification';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as ReportsApiHelper from './utils/ReportsApiHelper';
import i18n from '@/i18n';
import RunHistory from './RunHistory';
import HistoryStubs from './ReportHistoryStubs';

jest.mock('vue-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useRoute: jest.fn(() => ({ params: { template: 'template-name', state: 'draft' } })),
}));

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

describe('Run History component', () => {
  function setup(props) {
    const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
    useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
    return mount(RunHistory, {
      attachTo: createTooltipContainer(['tooltip-job_0123', 'tooltip-job_1112', 'tooltip-job_4567']),
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  let wrapper;

  describe('@renders', () => {
    it('displays the spinner on mount', async () => {
      wrapper = setup();
      const spinner = wrapper.find('.spinner-large');
      expect(spinner.exists()).toBe(true);
    });

    describe('on data load initial table view', () => {
      beforeEach(() => {
        ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
        wrapper = setup({
          newReportJobId: 'job_0123',
          reportConfig: {},
          templateName: 'template-name',
          templateState: 'published',
        });
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
        wrapper = setup({
          reportConfig: {},
          templateName: 'template-name',
          templateState: 'published',
        });

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
        const actionsDropdown = findByTestId(tableRowProcessing, 'actions-dropdown');
        const ellipseMenu = findByTestId(tableRowProcessing, 'actions-ellipse-menu');

        expect(viewReportButton.exists()).toBe(false);
        expect(actionsDropdown.exists()).toBe(false);
        expect(ellipseMenu.exists()).toBe(false);
      });

      it('hides the view details, action and ellipse dropdown buttons when a report is in an error state', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const tableRowError = tableRows[1];
        const viewReportButton = findByTestId(tableRowError, 'view-report-button');
        const actionsDropdown = findByTestId(tableRowError, 'actions-dropdown');
        const ellipseMenu = findByTestId(tableRowError, 'actions-ellipse-menu');

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

      it('shows available download buttons for a report that is in an expired state', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const tableRowExpired = tableRows[2];

        const CSVDownloadtButton = findByTestId(tableRowExpired, 'CSV-download-button');
        expect(CSVDownloadtButton.exists()).toBe(true);
      });

      it('does not display the "vanity" loading state on the first table entry if there is a missing newReportJobId prop value', async () => {
        ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
        wrapper = setup({
          reportConfig: {},
          templateName: 'template-name',
          templateState: 'published',
        });

        await nextTick();
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const firstTableRow = tableRows[0];
        const tableStatus = firstTableRow.find('.fr-report-history-status');
        expect(tableStatus.text()).toBe('Complete');
      });
    });
  });

  describe('@actions', () => {
    beforeEach(() => {
      ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
      wrapper = setup({
        reportConfig: {},
        templateName: 'template-name',
        templateState: 'published',
      });
    });

    it('changes the route to the "full report view" when the "View Report" button is clicked', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const tableRowComplete = tableRows[3];
      const tableRowViewReportButton = tableRowComplete.find('.fr-view-report').find('button');

      expect(tableRowViewReportButton.exists()).toBe(true);
    });

    it('makes an export request network call when an export button is clicked and ensures that the button state updates from loading to download upon resolution', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows[0];
      const JSONExportButton = findByTestId(job0123, 'JSON-export-button');
      const requestReportResponseStub = [HistoryStubs[0]].map((stub) => ({
        ...stub,
        exportJsonStatus: 'EXPORT_SUCCESS',
      }));

      ReportsApiHelper.requestExport = jest.fn().mockReturnValue(Promise.resolve({ data: { message: '' } }));
      ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(requestReportResponseStub));
      Notifications.displayNotification = jest.fn();
      const requestExportSpy = jest.spyOn(ReportsApiHelper, 'requestExport');
      const requestReportRunsSpy = jest.spyOn(ReportsApiHelper, 'requestReportRuns');

      JSONExportButton.trigger('click');
      await nextTick();
      expect(requestExportSpy).toHaveBeenCalledWith('job_0123', 'export', 'TEMPLATE-NAME', 'jsonl');
      expect(requestReportRunsSpy).toHaveBeenCalledWith({
        name: 'TEMPLATE-NAME',
        runId: 'job_0123',
        templateType: 'published',
        realm: undefined,
      });
      expect(JSONExportButton.text()).toMatch(/(Loading...)/i); // loading (spinner) button state

      await flushPromises();
      const downloadIconAfterResolution = JSONExportButton.find('.material-icons-outlined');
      expect(downloadIconAfterResolution.text()).toBe('file_download');
    });

    it('should only allow one export request at a time for the same report', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const thirdTableRow = tableRows[3];
      const JSONExportButton = findByTestId(thirdTableRow, 'JSON-export-button');
      const CSVExportButton = findByTestId(thirdTableRow, 'CSV-export-button');
      const requestReportResponseStub = [HistoryStubs[1]].map((stub) => ({
        ...stub,
        exportJsonStatus: 'EXPORT_SUCCESS',
      }));

      ReportsApiHelper.requestExport = jest.fn().mockReturnValue(Promise.resolve({ data: { message: '' } }));
      ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(requestReportResponseStub));
      Notifications.displayNotification = jest.fn();

      JSONExportButton.trigger('click');
      await wrapper.vm.$nextTick();
      expect(CSVExportButton.classes()).toContain('disabled');
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

      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows[0];
      const CSVDownloadButton = findByTestId(job0123, 'CSV-download-button');

      const downloadIcon = CSVDownloadButton.find('.material-icons-outlined');
      const requestDownloadSpy = jest.spyOn(AutoApi, 'fetchDownload');

      expect(downloadIcon.text()).toBe('file_download');
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
        text: () => Promise.resolve(jest.fn(() => 'Failure')),
      }));

      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows[0];
      const CSVDownloadButton = findByTestId(job0123, 'CSV-download-button');

      const downloadIcon = CSVDownloadButton.find('.material-icons-outlined');
      const errorSpy = jest.spyOn(Notifications, 'showErrorMessage');

      expect(downloadIcon.text()).toBe('file_download');
      await CSVDownloadButton.trigger('click');
      expect(errorSpy).toHaveBeenCalled();
    });

    it('shows the report summary modal when the "Run Details" option is selected in the ellipses menu', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const firstTableRow = tableRows[0];
      const RunDetailsDropdownOption = firstTableRow.find('[data-testid="view-run-option"]');

      await RunDetailsDropdownOption.trigger('click');
      expect(wrapper.vm.parametersForDetailsModal).toEqual([{ label: 'org_names', value: 'Sales' }]);
      expect(wrapper.vm.showDetailsModal).toEqual(true);
    });
  });
});
