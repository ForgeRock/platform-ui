/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { flushPromises } from '@vue/test-utils';
import useSaveReport from './SaveReport';

const successVal = { name: 'payloadName', description: 'payloadDescription', viewers: [1, 2, 3] };
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
});
