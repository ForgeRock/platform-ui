/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTooltipContainer, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';

import * as ReportsUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import * as DownloadFile from '@forgerock/platform-shared/src/utils/downloadFile';
import * as Notifications from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';
import RunHistory from './RunHistory';
import HistoryStubs from './ReportHistoryStubs';

describe('Run History component', () => {
  function setup(props) {
    return mount(RunHistory, {
      attachTo: createTooltipContainer(['tooltip-job_0123', 'tooltip-job_1112', 'tooltip-job_4567']),
      i18n,
      propsData: {
        ...props,
      },
      mocks: {
        $router: { push: jest.fn() },
        _bv__modal: {
          hide: jest.fn(),
          show: jest.fn(),
        },
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
        ReportsUtils.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
        wrapper = setup({
          newReportJobId: 'job_0123',
          reportConfig: {},
          templateName: 'template-name',
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
        const firstTableRow = tableRows.at(0);
        const firstTableRowStatus = firstTableRow.find('[role="status"]');
        expect(firstTableRowStatus.text()).toBe('Loading...');
      });

      it('ensures that on load, table items are sorted by most recently created', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const firstTableRowDate = tableRows.at(0).find('.fr-report-history-status');
        const secondTableRowDate = tableRows.at(1).find('.fr-report-history-status');
        const thirdTableRowDate = tableRows.at(2).find('.fr-report-history-status');
        const fourthTableRowDate = tableRows.at(3).find('.fr-report-history-status');
        expect(firstTableRowDate.text()).toMatch(/(Loading...)/i);
        expect(secondTableRowDate.text()).toBe('Error');
        expect(thirdTableRowDate.text()).toBe('Expired');
        expect(fourthTableRowDate.text()).toBe('Complete');
      });

      it('hides the view details, action and ellipse dropdown buttons when a report is processing or loading (running)', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const tableRowProcessing = tableRows.at(0);
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
        const tableRowError = tableRows.at(1);
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
        const tableRowExpired = tableRows.at(2);
        const viewReportButton = findByTestId(tableRowExpired, 'view-report-button');

        expect(viewReportButton.exists()).toBe(false);
      });

      it('shows available download buttons for a report that is in an expired state', () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const tableRowExpired = tableRows.at(2);

        const CSVDownloadtButton = findByTestId(tableRowExpired, 'CSV-download-button');
        expect(CSVDownloadtButton.exists()).toBe(true);
      });

      it('does not display the "vanity" loading state on the first table entry if there is a missing newReportJobId prop value', async () => {
        ReportsUtils.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
        wrapper = setup({
          reportConfig: {},
          templateName: 'template-name',
        });

        await nextTick();
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const firstTableRow = tableRows.at(0);
        const tableStatus = firstTableRow.find('.fr-report-history-status');
        expect(tableStatus.text()).toBe('Complete');
      });
    });
  });

  describe('@actions', () => {
    beforeEach(() => {
      ReportsUtils.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
      wrapper = setup({
        reportConfig: {},
        templateName: 'template-name',
      });
    });

    it('changes the route to the "full report view" when the "View Report" button is clicked', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const tableRowComplete = tableRows.at(3);
      const tableRowViewReportButton = tableRowComplete.find('.fr-view-report').find('button');
      const routerPushSpy = jest.spyOn(wrapper.vm._setupProxy.$router, 'push');

      await tableRowViewReportButton.trigger('click');
      expect(routerPushSpy).toHaveBeenCalledWith({ name: 'ReportView', params: { id: 'job_4567', template: 'template-name' } });
    });

    it('makes an export request network call when an export button is clicked and ensures that the button state updates from loading to download upon resolution', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows.at(0);
      const JSONExportButton = findByTestId(job0123, 'JSON-export-button');
      const requestReportResponseStub = [HistoryStubs[0]].map((stub) => ({
        ...stub,
        exportJsonStatus: 'EXPORT_SUCCESS',
      }));

      ReportsUtils.requestExport = jest.fn().mockReturnValue(Promise.resolve({ data: { message: '' } }));
      ReportsUtils.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(requestReportResponseStub));
      Notifications.displayNotification = jest.fn();
      const requestExportSpy = jest.spyOn(ReportsUtils, 'requestExport');
      const requestReportRunsSpy = jest.spyOn(ReportsUtils, 'requestReportRuns');

      await JSONExportButton.trigger('click');
      expect(requestExportSpy).toHaveBeenCalledWith('job_0123', 'export', 'TEMPLATE-NAME', 'jsonl');
      expect(requestReportRunsSpy).toHaveBeenCalledWith({ name: 'TEMPLATE-NAME', runId: 'job_0123' });
      expect(JSONExportButton.text()).toMatch(/(Loading...)/i); // loading (spinner) button state

      await nextTick();
      const downloadIconAfterResolution = JSONExportButton.find('.material-icons-outlined');
      expect(downloadIconAfterResolution.text()).toBe('file_download');
    });

    it('should only allow one export request at a time for the same report', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const thirdTableRow = tableRows.at(3);
      const JSONExportButton = findByTestId(thirdTableRow, 'JSON-export-button');
      const CSVExportButton = findByTestId(thirdTableRow, 'CSV-export-button');
      const requestReportResponseStub = [HistoryStubs[1]].map((stub) => ({
        ...stub,
        exportJsonStatus: 'EXPORT_SUCCESS',
      }));

      ReportsUtils.requestExport = jest.fn().mockReturnValue(Promise.resolve({ data: { message: '' } }));
      ReportsUtils.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(requestReportResponseStub));
      Notifications.displayNotification = jest.fn();

      await JSONExportButton.trigger('click');
      expect(CSVExportButton.classes()).toContain('disabled');
    });

    it('makes a download request network call when a download button is clicked', async () => {
      ReportsUtils.requestExport = jest.fn().mockReturnValue(Promise.resolve({
        headers: { 'content-disposition': 'filename=my-informative-report.csv' },
        data: 'hello world',
      }));
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows.at(0);
      const CSVDownloadButton = findByTestId(job0123, 'CSV-download-button');

      const downloadIcon = CSVDownloadButton.find('.material-icons-outlined');
      const requestExportSpy = jest.spyOn(ReportsUtils, 'requestExport');
      const downloadFileSpy = jest.spyOn(DownloadFile, 'downloadFile').mockImplementation(() => Promise.resolve());

      expect(downloadIcon.text()).toBe('file_download');
      await CSVDownloadButton.trigger('click');
      expect(requestExportSpy).toHaveBeenCalledWith('job_0123', 'download', 'TEMPLATE-NAME', 'csv');
      expect(downloadFileSpy).toHaveBeenCalledWith('hello world', 'text/csv;charset=utf-8', 'my-informative-report.csv');
    });

    it('shows the report summary modal when the "Run Details" option is selected in the ellipses menu', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const firstTableRow = tableRows.at(0);
      const RunDetailsDropdownOption = firstTableRow.find('[data-testid="view-run-option"]');

      await RunDetailsDropdownOption.trigger('click');
      expect(wrapper.vm._setupProxy.parametersForDetailsModal).toEqual({ org_names: ['Sales'] });
      expect(wrapper.vm._setupProxy.showDetailsModal).toEqual(true);
    });
  });
});
