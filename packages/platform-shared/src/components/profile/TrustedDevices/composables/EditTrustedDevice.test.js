/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises } from '@vue/test-utils';
import * as TrustedDevicesApi from '@forgerock/platform-shared/src/api/TrustedDevicesApi';
import useEditTrustedDevices from './EditTrustedDevice';

describe('Fetch Trusted Devices', () => {
  it('Returns the correct saving states', async () => {
    TrustedDevicesApi.updateTrustedDevice = jest.fn().mockReturnValue(Promise.resolve([]));

    const { editData, isSaving } = useEditTrustedDevices();
    // Initial saving state
    expect(isSaving.value).toBe(false);

    // Call to edit; Save pending
    editData('testRealm', 'testUser', { test: true }, 'testdevice');
    expect(isSaving.value).toBe(true);

    // Saving complete
    await flushPromises();
    expect(isSaving.value).toBe(false);
  });

  it('Returns the correct error state', async () => {
    const testError = new Error('error');
    TrustedDevicesApi.updateTrustedDevice = jest.fn().mockReturnValue(Promise.reject(testError));

    const { editData, error } = useEditTrustedDevices();
    // Initial error state
    expect(error.value).toBeUndefined();

    // Call to edit
    editData('testRealm', 'testUser');

    // Error complete
    await flushPromises();
    expect(error.value).toBe(testError);
  });
});
