/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import DeviceDetailsModal from './DeviceDetailsModal';

mockModal();

describe('Device Details Modal', () => {
  function setup(props) {
    return mount(DeviceDetailsModal, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
      propsData: {
        isTesting: true,
        username: 'user',
        ...props,
      },
    });
  }
  const deviceType = 'macos';
  it('Shows icon when device type is provided', async () => {
    const wrapper = setup({ device: { deviceType } });
    const deviceIcon = findByTestId(wrapper, 'device-icon');
    expect(deviceIcon.exists()).toBe(true);
  });
  it('Shows remove device button when the device is not the current device', async () => {
    const wrapper = setup({ device: { isCurrent: false } });
    const removeDevice = findByTestId(wrapper, 'remove-device');
    expect(removeDevice.exists()).toBe(true);
  });
});
