/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { flushPromises } from '@vue/test-utils';
import useSaveReport from './SaveReport';

const successVal = {
  name: '', displayName: 'payloadName', description: 'payloadDescription', viewers: [1, 2, 3],
};
const rejectValue = 'rejected';

describe('@composable', () => {
  it('sets the correct status values during a successful request', async () => {
    // Mock save report success response
    axios.create = jest.fn().mockReturnValue({
      post: () => (successVal),
    });

    // Use the composable
    const {
      templateData, saveReport, saveReportError, saveReportPending, saveReportReady,
    } = useSaveReport();

    // Call the save function
    saveReport(successVal);
    await flushPromises();

    // Get the expected values
    expect(templateData.value).toStrictEqual(successVal);
    expect(saveReportError.value).toBe(undefined);
    expect(saveReportPending.value).toBe(false);
    expect(saveReportReady.value).toBe(true);
  });

  it('sets the correct status values during an error request ', async () => {
    // Mock save report success response
    jest.spyOn(axios, 'post').mockRejectedValue(new Error(rejectValue));
    axios.create = jest.fn().mockReturnValue({
      post: () => Promise.reject(new Error(rejectValue)),
    });

    // Use the composable
    const {
      templateData, saveReport, saveReportError, saveReportPending, saveReportReady,
    } = useSaveReport();

    // Call the save function
    saveReport(successVal);
    await flushPromises();

    // Get the expected values
    expect(templateData.value).toBeFalsy();
    expect(saveReportError.value.message).toBe(rejectValue);
    expect(saveReportPending.value).toBe(false);
    expect(saveReportReady.value).toBe(false);
  });

  it('should save report with the correct payload', async () => {
    // Mock save report success response
    axios.create = jest.fn().mockReturnValue({
      post: jest.fn(() => (successVal)),
    });

    // Use the composable
    const {
      saveReport,
    } = useSaveReport();

    // Call the save function
    const reportConfig = '{"version":"v2","entities":[{"entity":"users"}],"fields":[{"label":"Given Name","value":"users.givenName"},{"label":"Account Status","value":"users.accountStatus"},{"label":"City","value":"users.city"}]}';
    saveReport({
      name: '', displayName: 'payloadName', description: 'payloadDescription', viewers: [1, 2, 3], reportConfig,
    });
    await flushPromises();

    // Get the expected values
    expect(axios.create).toHaveBeenCalled();
    expect(axios.create().post).toHaveBeenCalledWith('templates?_action=create&templateType=draft', {
      reportTemplate: {
        description: 'payloadDescription', displayName: 'payloadName', reportConfig: '{"version":"v2","entities":[{"entity":"users"}],"fields":[{"label":"Given Name","value":"users.givenName"},{"label":"Account Status","value":"users.accountStatus"},{"label":"City","value":"users.city"}]}', viewers: [1, 2, 3],
      },
    });
  });
});
