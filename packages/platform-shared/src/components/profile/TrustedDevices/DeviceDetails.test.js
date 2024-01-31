/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import DeviceDetails from './DeviceDetails';

describe('Device Details', () => {
  function setup(props) {
    return mount(DeviceDetails, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
      propsData: {
        ...props,
      },
    });
  }
  const map = 'https://maps.googleapis.com/maps/api/staticmap';
  const os = 'Mac OS';
  const browser = 'Chrome';
  const cpu = 'MacIntel';
  it('Shows map when map link is provided', async () => {
    const wrapper = setup({ device: { map } });
    const deviceMap = findByTestId(wrapper, 'device-map');
    expect(deviceMap.exists()).toBe(true);
  });
  it('Shows OS when OS is provided', async () => {
    const wrapper = setup({ device: { os } });
    const deviceOs = findByTestId(wrapper, 'device-os');
    expect(deviceOs.exists()).toBe(true);
  });
  it('Shows browser when browser is provided', async () => {
    const wrapper = setup({ device: { browser } });
    const deviceBrowser = findByTestId(wrapper, 'device-browser');
    expect(deviceBrowser.exists()).toBe(true);
  });
  it('Shows cpu when cpu is provided', async () => {
    const wrapper = setup({ device: { cpu } });
    const deviceCpu = findByTestId(wrapper, 'device-cpu');
    expect(deviceCpu.exists()).toBe(true);
  });
  it('Hides remove button when the component is displayed inside a modal', async () => {
    const wrapper = setup({ device: { isCurrent: false }, showsInModal: true });
    const deviceRemove = findByTestId(wrapper, 'device-remove');
    expect(deviceRemove.exists()).toBe(false);
  });
});
