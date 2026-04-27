/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, mount } from '@vue/test-utils';
import {
  createAppContainer,
  createTooltipContainer,
  findByTestId,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';

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
    createTooltipContainer(['tooltip-job_0123', 'tooltip-job_1112', 'tooltip-job_4567']);
    const domWrapper = new DOMWrapper(document.body);
    const wrapper = mount(RunHistoryTable, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
      },
      props: {
        reportRuns: ReportHistoryStubs,
        ...props,
      },
    });
    return { wrapper, domWrapper };
  }

  function getTableRows(wrapper) {
    const table = findByTestId(wrapper, 'run-history-table');
    return table.find('tbody').findAll('tr[role="row"]');
  }

  async function openEllipseMenu(wrapper, buttonTestId, buttonIcon) {
    const rows = getTableRows(wrapper);
    const firstRow = rows[0];
    const dropDownButtons = findByTestId(firstRow, buttonTestId);
    await toggleActionsMenu(dropDownButtons, 0, buttonIcon);
  }

  let wrapper;
  let domWrapper;

  beforeEach(() => {
    document.body.innerHTML = '';
    ({ wrapper, domWrapper } = setup());
  });

  describe('@renders', () => {
    it('displays the table of historical report requests', () => {
      const tableRows = getTableRows(wrapper);
      expect(tableRows.length).toBe(4);
    });

    describe('@watchers', () => {
      it('updates a table row if the "updatedRow" prop has a new value', async () => {
        const tableRowStubs = reportHistoryTableDataGenerator(ReportHistoryStubs);
        const updated = updateValueInNestedObject(tableRowStubs[0], 'reportStatus', 'processing');
        expect(findByTestId(wrapper, 'fr-complete-report-badge').exists()).toBe(true);
        await wrapper.setProps({ updatedRow: [updated] });

        expect(findByTestId(wrapper, 'fr-report-badge-spinner').exists()).toBe(true);
      });
    });
  });

  describe('@actions', () => {
    it('emits "view-report" when the view report button is clicked in the table', async () => {
      const tableRows = getTableRows(wrapper);
      const job0123 = tableRows[0];
      const viewReportButton = findByTestId(job0123, 'view-report-button');

      await viewReportButton.trigger('click');
      expect(wrapper.emitted()['view-report']?.[0]).toEqual(['job_0123']);
    });

    it('emits "download-report" when a download option is clicked from the export dropdown', async () => {
      await openEllipseMenu(wrapper, 'actions-run-history-export', 'file_download');
      const csvDownloadButton = findByTestId(domWrapper, 'CSV-download-button');
      await csvDownloadButton.trigger('click');

      expect(wrapper.emitted()['download-report']?.[0]).toBeTruthy();
    });

    it('emits "export-report" when an export option is clicked from the export dropdown', async () => {
      await openEllipseMenu(wrapper, 'actions-run-history-export', 'file_download');
      const jsonExportButton = findByTestId(domWrapper, 'JSON-export-button');
      await jsonExportButton.trigger('click');

      expect(wrapper.emitted()['export-report']?.[0]).toBeTruthy();
    });

    it('emits "view-run-details" when the Run Details option is clicked in the ellipse menu', async () => {
      await openEllipseMenu(wrapper, 'actions-ellipse-menu');

      const runDetailsDropdownOption = findByTestId(domWrapper, 'view-run-option');
      await runDetailsDropdownOption.trigger('click');

      expect(wrapper.emitted()['view-run-details']?.[0]).toBeTruthy();
    });
  });
});
