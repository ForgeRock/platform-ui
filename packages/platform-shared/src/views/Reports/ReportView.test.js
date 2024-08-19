/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as Notifications from '@forgerock/platform-shared/src/utils/notification';
import ReportView from './ReportView';

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
        parameters: '{"user_names":"reportadmin","roleStatus":["active"],"customParam":"customValue"}',
        reportConfig: '{"parameters":{"user_names":{"type":"string"},"roleStatus":{"type":"array","items":{"type":"string"}},"customParam":{"type":"string","label":"Custom Parameter"}}}',
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

    // The reason why this outputs 'Users' is because the logic to determine the label first looks at the
    // _REPORT_FIELDS_CONTROLLER to see if there is a matching key and uses the label property if it exists.
    expect(usersParam.text()).toBe('Users');

    // The reason why this outputs 'roleStatus' is because there is no matching _REPORT_FIELDS_CONTROLLER
    // and the reportConfig parameter does not have a label property so it defaults to the parameter key.
    expect(roleStatusParam.text()).toBe('roleStatus');

    // The reason why this outputs 'Custom Parameter' is because there is no matching
    // _REPORT_FIELDS_CONTROLLER and the reportConfig parameter has a label property.
    expect(customParam.text()).toBe('Custom Parameter');
  });
});
