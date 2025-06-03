/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
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
    const [,,, numberParam] = reportParametersContainer.findAll('div > small + div');
    // The number parameter should be displayed as is
    expect(numberParam.text()).toBe('42');
  });
});
