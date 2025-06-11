/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId, findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as Notifications from '@forgerock/platform-shared/src/utils/notification';
import ReportView from './ReportView';
import { reportTableData, reportTableDataPage2 } from './__mocks__/mocks';

jest.mock('@forgerock/platform-shared/src/utils/notification');
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { id: 'job_123abc', template: 'template-name' } })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('Report View component', () => {
  function setup() {
    return mount(ReportView, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
      mocks: {
        route: {
          params: {
            id: 'job_123abc',
            template: 'template-name',
          },
        },
      },
    });
  }
  let wrapper;

  beforeEach(() => {
    Notifications.displayNotification = jest.fn().mockReturnValue(false);
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve({
      result: [{
        journey_name: 'PasswordGrant',
        journey_result: 'SUCCESSFUL',
        timestamp: '2024-01-12T19:40:36.490Z',
        user_names: 'reportadmin',
        roleStatus: ['active'],
        customParam: 'customValue',
      }],
    }));

    AutoApi.getReportRuns = jest.fn().mockReturnValue(Promise.resolve({
      result: [{
        exportJsonStatus: 'EXPORT_SUCCESS',
        exportCsvStatus: 'EXPORT_SUCCESS',
        createDate: '2024-01-12T19:40:36.490Z',
        name: 'my-report',
        parameters: '{"user_names":"reportadmin","roleStatus":["active"],"customParam":"customValue","integerParam":42}',
        reportConfig: `{
          "parameters":{
            "user_names":{
              "type":"string",
              "label":"Users"
            },
            "roleStatus":{
              "type":"array",
              "items":{
                "type":"string"
              }
            },
            "integerParam":{
              "type":"integer",
              "label":"Integer Parameter"
            },
            "customParam":{
              "type":"string",
              "label":
              "Custom Parameter"
            }
          }
        }`,
      }],
    }));
  });

  it('Does not show table when report is expired', async () => {
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve({ message: 'Report is expired' }));
    wrapper = setup();
    await flushPromises();

    const reportTable = findByTestId(wrapper, 'report-table');
    expect(reportTable.exists()).toBe(false);
    const skeleton = findByTestId(wrapper, 'skeleton-loader');
    expect(skeleton.exists()).toBe(false);

    const noData = findByTestId(wrapper, 'no-data');
    expect(noData.exists()).toBe(true);
  });

  it('Hides No Data component when there is data', async () => {
    wrapper = setup();
    await flushPromises();

    const noData = findByTestId(wrapper, 'no-data');
    expect(noData.exists()).toBe(false);
    const skeleton = findByTestId(wrapper, 'skeleton-loader');
    expect(skeleton.exists()).toBe(false);

    const reportTable = findByTestId(wrapper, 'report-table');
    expect(reportTable.exists()).toBe(true);
  });

  it('Shows skeleton loader when data is fetching', () => {
    wrapper = setup();
    const skeleton = findByTestId(wrapper, 'skeleton-loader');
    expect(skeleton.exists()).toBe(true);
  });

  it('Ensures that the correct report parameter labels are shown based on the expected data', async () => {
    wrapper = setup();
    await flushPromises();

    const [, reportParameters] = wrapper.findAll('.row');
    const reportParametersContainer = reportParameters.find('.flex-row');
    const [usersParam, roleStatusParam, customParam] = reportParametersContainer.findAll('div > small');

    // The reason why this outputs 'Users' is because there is a label
    // property in the reportConfig parameter.
    expect(usersParam.text()).toBe('Users');

    // The reason why this outputs 'roleStatus' is because the reportConfig parameter
    // does not have a label property so it defaults to the parameter key.
    expect(roleStatusParam.text()).toBe('roleStatus');

    // The reason why this outputs 'Custom Parameter' is because there is a label
    // property in the reportConfig parameter.
    expect(customParam.text()).toBe('Custom Parameter');
  });

  it('Ensures that a date is not shown when the parameter is an integer', async () => {
    wrapper = setup();
    await flushPromises();

    const [, reportParameters] = wrapper.findAll('.row');
    const reportParametersContainer = reportParameters.find('.flex-row');
    const [, , , numberParam] = reportParametersContainer.findAll('div > small + div');
    // The number parameter should be displayed as is
    expect(numberParam.text()).toBe('42');
  });

  it('shows the sort icons in the headers when the data comes back sortable', async () => {
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve(reportTableData));
    wrapper = setup();
    await flushPromises();

    // Find the column headers and make sure the sorting markup exists
    const columnHeaders = wrapper.findAll('[role="columnheader"]');
    columnHeaders.forEach((col) => {
      const columnName = col.find('div');
      const sortSpan = col.find('span.sr-only');
      if (!reportTableData.nonSortableColumns.includes(columnName.text())) {
        expect(sortSpan).toBeDefined();
      }
    });
  });

  it('shows the correct initial state when the data is loaded', async () => {
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve(reportTableData));
    wrapper = setup();
    await flushPromises();

    // Expect the table to contain the correct amount of rows
    let body = wrapper.find('tbody[role="rowgroup"]');
    let rows = body.findAll('tr[role="row"]');
    expect(rows.length).toBe(reportTableData.result.length);

    // Expect the first item and last item to be correct
    const firstRow = findByText(rows[0], 'td[role="cell"]', reportTableData.result[0]['Common Name']);
    const lastRow = findByText(rows[rows.length - 1], 'td[role="cell"]', reportTableData.result[reportTableData.result.length - 1]['Common Name']);
    expect(firstRow.exists()).toBe(true);
    expect(lastRow.exists()).toBe(true);

    // Click the next page button
    let paginationNextButton = wrapper.find('button[aria-label="Go to next page"]');
    let paginationPrevButton = wrapper.find('button[aria-label="Go to previous page"]');
    paginationNextButton.trigger('click');
    await flushPromises();

    // On page 2 so next button should not exist, previous page button should exist
    paginationPrevButton = wrapper.find('button[aria-label="Go to previous page"]');
    paginationNextButton = wrapper.find('button[aria-label="Go to next page"]');
    expect(paginationNextButton.exists()).toBe(false);
    expect(paginationPrevButton.exists()).toBe(true);

    // Setup page 2 data
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve(reportTableDataPage2));
    await flushPromises();

    wrapper = setup();
    await flushPromises();
    body = wrapper.find('tbody[role="rowgroup"]');
    rows = body.findAll('tr[role="row"]');
    expect(rows.length).toBe(reportTableDataPage2.result.length);

    // Get and click the column header to sort the data
    const columnHeaders = wrapper.findAll('[role="columnheader"]');
    const columnToClick = columnHeaders[0];
    expect(columnToClick.attributes('aria-sort')).toBe('descending');

    // Click the sort button
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve(reportTableData));
    columnToClick.trigger('click');
    await flushPromises();

    // Back on page 1
    paginationPrevButton = wrapper.find('button[aria-label="Go to previous page"]');
    paginationNextButton = wrapper.find('button[aria-label="Go to next page"]');
    expect(paginationNextButton.exists()).toBe(true);
    expect(paginationPrevButton.exists()).toBe(false);
  });

  it('updates the sort direction when sort button is clicked', async () => {
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve(reportTableData));
    wrapper = setup();
    await flushPromises();

    // Get the initial sort order
    let columnHeaders = wrapper.findAll('[role="columnheader"]');
    let columnToClick = columnHeaders[0];
    expect(columnToClick.attributes('aria-sort')).toBe('descending');

    // Click the sort button
    columnToClick.trigger('click');
    await flushPromises();

    // Get the next sort order
    columnHeaders = wrapper.findAll('[role="columnheader"]');
    [columnToClick] = columnHeaders;
    expect(columnToClick.attributes('aria-sort')).toBe('ascending');
  });
});
