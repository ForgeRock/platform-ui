/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import DeviceProfileCallback from '@/components/callbacks/DeviceProfileCallback';
import i18n from '@/i18n';

jest.mock('@forgerock/javascript-sdk', () => ({
  FRDevice: function FRDevice() {
    return {
      getProfile() {
        return Promise.resolve({ identifier: 'hi' });
      },
    };
  },
}));

describe('DeviceProfileCallback', () => {
  let wrapper;
  beforeEach(() => {
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
    expect(wrapper.vm.$data.message).toBe('Message');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$props.callback.setProfile).toHaveBeenCalledWith(expect.objectContaining({
      identifier: expect.any(String),
    }));
    expect(wrapper.emitted()['next-step'].pop()).toBeTruthy();
  });
});
