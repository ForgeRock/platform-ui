/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises } from '@vue/test-utils';
import * as TrustedDevicesApi from '@forgerock/platform-shared/src/api/TrustedDevicesApi';
import * as Parse from '../utils/parse';
import * as Format from '../utils/format';
import useFetchTrustedDevices from './FetchTrustedDevicesData';
import { deviceData } from '../testDeviceData';

describe('Fetch Trusted Devices', () => {
  it('Returns the correct loading states', async () => {
    TrustedDevicesApi.loadUserTrustedDevices = jest.fn().mockReturnValue(Promise.resolve([]));

    const { fetchData, isLoading } = useFetchTrustedDevices();
    // Initial loading state
    expect(isLoading.value).toBe(false);

    // Call to fetch; Load pending
    fetchData('testRealm', 'testUser');
    expect(isLoading.value).toBe(true);

    // Loading complete
    await flushPromises();
    expect(isLoading.value).toBe(false);
  });

  it('Returns the correct error state', async () => {
    const testError = new Error('error');
    TrustedDevicesApi.loadUserTrustedDevices = jest.fn().mockReturnValue(Promise.reject(testError));

    const { fetchData, error } = useFetchTrustedDevices();
    // Initial error state
    expect(error.value).toBeUndefined();

    // Call to fetch
    fetchData('testRealm', 'testUser');

    // Error complete
    await flushPromises();
    expect(error.value).toBe(testError);
  });

  it('Returns the correct successful response result', async () => {
    // Test output
    const testResult = [{ test: true }];

    // Function mocks
    const testFetch = jest.fn();
    TrustedDevicesApi.loadUserTrustedDevices = testFetch.mockReturnValue(Promise.resolve(deviceData));
    Parse.parseLocationData = jest.fn().mockReturnValue(Promise.resolve(testResult));
    Format.formatDevices = jest.fn().mockReturnValue(testResult);

    // Call to fetch
    const { fetchData } = useFetchTrustedDevices();
    const result = await fetchData('testRealm', 'testUser');

    // Test function call and results
    await flushPromises();
    expect(testFetch).toHaveBeenCalledWith('testRealm', 'testUser');
    expect(result).toBe(testResult);
  });
});
