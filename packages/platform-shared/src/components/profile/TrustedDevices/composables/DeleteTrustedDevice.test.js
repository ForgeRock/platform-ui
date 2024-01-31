/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises } from '@vue/test-utils';
import * as TrustedDevicesApi from '@forgerock/platform-shared/src/api/TrustedDevicesApi';
import useDeleteTrustedDevice from './DeleteTrustedDevice';

describe('Delete Trusted Devices', () => {
  it('Returns the correct deleting states', async () => {
    TrustedDevicesApi.deleteTrustedDevice = jest.fn().mockReturnValue(Promise.resolve([]));

    const { deleteData, isDeleting } = useDeleteTrustedDevice();
    // Initial deleting state
    expect(isDeleting.value).toBe(false);

    // Call to delete; Delete pending
    deleteData('testRealm', 'testUser', 'testdevice');
    expect(isDeleting.value).toBe(true);

    // Delete complete
    await flushPromises();
    expect(isDeleting.value).toBe(false);
  });

  it('Returns the correct error state', async () => {
    const testError = new Error('error');
    TrustedDevicesApi.deleteTrustedDevice = jest.fn().mockReturnValue(Promise.reject(testError));

    const { deleteData, error } = useDeleteTrustedDevice();
    // Initial error state
    expect(error.value).toBeUndefined();

    // Call to delete
    deleteData('testRealm', 'testUser', 'deviceId');

    // Error complete
    await flushPromises();
    expect(error.value).toBe(testError);
  });
});
