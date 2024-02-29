/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { createTooltipContainer, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';

import i18n from '@/i18n';
import RunHistoryTable from './RunHistoryTable';
import ReportHistoryStubs from './ReportHistoryStubs';
import useRunHistoryTable from './composables/RunHistoryTable';

const {
  reportHistoryTableDataGenerator,
  updateValueInNestedObject,
} = useRunHistoryTable();

describe('Run History Table component', () => {
  function setup(props) {
    return mount(RunHistoryTable, {
      attachTo: createTooltipContainer(['tooltip-job_0123', 'tooltip-job_1112', 'tooltip-job_4567']),
      global: {
        plugins: [i18n],
      },
      props: {
        reportRuns: ReportHistoryStubs,
        ...props,
      },
    });
  }

  let wrapper;

  describe('@renders', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    describe('on data load initial table view', () => {
      it('displays the table of historical report requests', async () => {
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        expect(tableRows.length).toBe(4);
      });
    });

    describe('@watchers', () => {
      it('updates a table row if the "updatedRow" prop has a new value', async () => {
        const tableRowStubs = reportHistoryTableDataGenerator(ReportHistoryStubs);
        const newTableRowWithUpdatedStatus = updateValueInNestedObject(tableRowStubs[0], 'reportStatus', 'processing');
        const table = findByTestId(wrapper, 'run-history-table');
        const tableRows = table.find('tbody').findAll('tr[role="row"]');
        const job0123 = tableRows[0];
        const reportStatusComplete = findByTestId(job0123, 'fr-complete-report-badge');

        expect(reportStatusComplete.exists()).toBe(true);
        await wrapper.setProps({ updatedRow: [newTableRowWithUpdatedStatus] });

        const reportProcessingState = findByTestId(job0123, 'fr-report-badge-spinner');
        expect(reportProcessingState.exists()).toBe(true);
      });
    });
  });

  describe('@actions', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it('emits "view-report" when the view report button is clicked in the table', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows[0];
      const viewReportButton = findByTestId(job0123, 'view-report-button');

      await viewReportButton.trigger('click');
      expect(wrapper.emitted()['view-report'][0]).toEqual(['job_0123']);
    });

    it('emits "download-report" if status is "download" or "downloading" when the download button is clicked in the table', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows[0];
      const CSVDownloadButton = findByTestId(job0123, 'CSV-download-button');

      await CSVDownloadButton.trigger('click');
      expect(wrapper.emitted()['download-report'][0]).toBeTruthy();
    });

    it('emits "export-report" if status is "export" when the export button is clicked in the table', async () => {
      const table = findByTestId(wrapper, 'run-history-table');
      const tableRows = table.find('tbody').findAll('tr[role="row"]');
      const job0123 = tableRows[0];
      const JSONExportButton = findByTestId(job0123, 'JSON-export-button');

      await JSONExportButton.trigger('click');
      expect(wrapper.emitted()['export-report'][0]).toBeTruthy();
    });

    it('emits "view-run-details" if the "Run Details" button is clicked in the ellipse menu', async () => {
      const RunDetailsDropdownOption = findByTestId(wrapper, 'view-run-option');

      await RunDetailsDropdownOption.trigger('click');
      expect(wrapper.emitted()['view-run-details'][0]).toBeTruthy();
    });
  });
});
