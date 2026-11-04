/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { Device } from '@forgerock/journey-client/device';
import DeviceProfileCallback from '@/components/callbacks/DeviceProfileCallback';
import i18n from '@/i18n';

const { Device: RealDevice } = jest.requireActual('@forgerock/journey-client/device');

jest.mock('@forgerock/journey-client/device', () => ({
  Device: jest.fn(function DeviceMock(config, logLevel, prefix) {
    this.getProfile = jest.fn(() => {
      const key = `${prefix}-DeviceID`;
      const existing = global.localStorage.getItem(key);
      if (existing) {
        return Promise.resolve({ identifier: existing });
      }
      global.localStorage.setItem(key, 'generated-id');
      return Promise.resolve({ identifier: 'generated-id' });
    });
  }),
}));

describe('DeviceProfileCallback', () => {
  let wrapper;
  beforeEach(() => {
    Device.mockClear();
    global.localStorage.clear();
    wrapper = shallowMount(DeviceProfileCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: {
          getMessage: () => 'Message',
          isLocationRequired: () => true,
          isMetadataRequired: () => true,
          setProfile: jest.fn(),
        },
      },
    });
  });

  it('Sets profile data and emits "next-step"', async () => {
    expect(Device).toHaveBeenCalledWith(undefined, undefined, 'FR-SDK');
    expect(wrapper.vm.$data.message).toBe('Message');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$props.callback.setProfile).toHaveBeenCalledWith(expect.objectContaining({
      identifier: expect.any(String),
    }));
    expect(wrapper.emitted()['next-step'].pop()).toBeTruthy();
  });

  it('Reuses the identifier stored under the legacy FR-SDK-DeviceID key', async () => {
    global.localStorage.setItem('FR-SDK-DeviceID', 'legacy-stored-id');
    await wrapper.vm.deviceProfileCallback();
    await Promise.resolve();
    await Promise.resolve();

    expect(wrapper.vm.$props.callback.setProfile).toHaveBeenCalledWith(expect.objectContaining({
      identifier: 'legacy-stored-id',
    }));
    expect(global.localStorage.getItem('FR-SDK-DeviceID')).toBe('legacy-stored-id');
  });

  it('Real SDK getIdentifier reads and stores under the FR-SDK-DeviceID key', () => {
    const device = new RealDevice(undefined, undefined, 'FR-SDK');

    const first = device.getIdentifier();
    expect(first).toBeTruthy();
    expect(global.localStorage.getItem('FR-SDK-DeviceID')).toBe(first);

    global.localStorage.setItem('FR-SDK-DeviceID', 'legacy-stored-id');
    expect(device.getIdentifier()).toBe('legacy-stored-id');
  });
});
