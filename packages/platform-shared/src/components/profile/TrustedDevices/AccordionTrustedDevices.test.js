/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import AccordionTrustedDevices from '@forgerock/platform-shared/src/components/profile/TrustedDevices/AccordionTrustedDevices';
import i18n from '@forgerock/platform-shared/src/i18n';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as TrustedDevicesApi from '@forgerock/platform-shared/src/api/TrustedDevicesApi';
import * as Parse from './utils/parse';
import * as Fetch from './composables/FetchTrustedDevicesData';
import { deviceData } from './testDeviceData';
import { getAccordionItems } from '../../Accordion/Accordion.test';

const deviceTypes = ['Linux', 'Android', 'Mac OS'];
const deviceNames = ['Linux (Browser)', 'Android (Browser)', 'Mac (Browser)(Huckle)'];
const localityAndTime = ['Exampleville', 'Exampleville', ''];

describe('Accordion Trusted Devices', () => {
  function setup(props) {
    setupTestPinia({}, true);
    return mount(AccordionTrustedDevices, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
      data() {
        return {
          devices: deviceData,
        };
      },
    });
  }
  let wrapper;
  describe('@renders', () => {
    beforeEach(async () => {
      TrustedDevicesApi.loadUserTrustedDevices = jest.fn().mockReturnValue(Promise.resolve(deviceData));
      Parse.parseLocationData = jest.fn().mockReturnValue(Promise.resolve({ formattedAddress: '123 Example st.', locality: 'Exampleville', map: 'http://example.com/map' }));
    });

    // Renders the correct amount of accordions
    it('the correct amount of accordion items', async () => {
      wrapper = setup();
      await flushPromises();
      const accordionItems = getAccordionItems(wrapper);
      expect(accordionItems.length).toBe(deviceData.data.result.length);
    });

    // Renders the device type, name, and location (if exists)
    it('the device type, name, and location (if exists)', async () => {
      wrapper = setup();
      await flushPromises();
      const accordionItems = getAccordionItems(wrapper);

      // Device Type
      accordionItems.forEach((item, i) => {
        const deviceType = item.find('.media .device');
        expect(deviceType.attributes('data-device-type')).toBe(deviceTypes[i]);
      });

      // Device Name
      accordionItems.forEach((item, i) => {
        const deviceName = findByText(item, '.media .media-body .h5', deviceNames[i]);
        expect(deviceName).not.toBeUndefined();
      });

      // Device Locality and Time
      accordionItems.forEach((item, i) => {
        const deviceLocality = findByText(item, '.card-header .row .row', localityAndTime[i]);
        expect(deviceLocality).not.toBeUndefined();
      });
    });

    it('an open accordion with location data', async () => {
      wrapper = setup();
      await flushPromises();
      const accordionItems = getAccordionItems(wrapper);
      const firstItem = accordionItems[0];
      const collapse = firstItem.find('.collapse');

      // OS
      const deviceOs = collapse.find('.row .col:nth-child(2) div div:nth-child(1) p').text();
      expect(deviceOs).toBe('Linux x86_64');

      // Browser
      const deviceBrowser = collapse.find('.row .col:nth-child(2) div div:nth-child(2) p').text();
      expect(deviceBrowser).toBe('Chrome 121.0.0.0');

      // CPU
      const deviceCpu = collapse.find('.row .col:nth-child(2) div div:nth-child(3) p').text();
      expect(deviceCpu).toBe('Linux x86_64');

      // Formatted Address
      const formattedAddress = collapse.find('.media .media-body div').text();
      expect(formattedAddress).toBe('123 Example st.');
    });

    it('an open accordion without location data', async () => {
      wrapper = setup();
      await flushPromises();
      const accordionItems = getAccordionItems(wrapper);
      const firstItem = accordionItems[2];
      const collapse = firstItem.find('.collapse');

      // OS
      const deviceOs = collapse.find('.row .col:nth-child(1) div div:nth-child(1) p').text();
      expect(deviceOs).toBe('Mac OS 10.15.7');

      // Browser
      const deviceBrowser = collapse.find('.row .col:nth-child(1) div div:nth-child(2) p').text();
      expect(deviceBrowser).toBe('Chrome 119.0.0.0');

      // CPU
      const deviceCpu = collapse.find('.row .col:nth-child(1) div div:nth-child(3) p').text();
      expect(deviceCpu).toBe('MacIntel');

      // Formatted Address
      const formattedAddress = collapse.find('.media .media-body div');
      expect(formattedAddress.exists()).toBe(false);
    });
  });
  describe('@functions', () => {
    it('uses the root realm when forceRoot prop is set', async () => {
      const mockFetch = jest.fn((realm) => realm);
      Fetch.default = jest.fn().mockReturnValue({ fetchData: mockFetch });
      wrapper = setup({ forceRootRealm: true });
      await flushPromises();
      expect(mockFetch).toHaveBeenCalledWith('root', '');
    });
  });
});
