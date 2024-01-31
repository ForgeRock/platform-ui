/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ListViewTrustedDevices from '@forgerock/platform-shared/src/components/profile/TrustedDevices/ListViewTrustedDevices';
import i18n from '@forgerock/platform-shared/src/i18n';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as TrustedDevicesApi from '@forgerock/platform-shared/src/api/TrustedDevicesApi';
import * as Parse from './utils/parse';
import { deviceData } from './testDeviceData';

const deviceTypes = ['Linux', 'Android', 'Mac OS'];
const deviceNames = ['Linux (Browser)', 'Android (Browser)', 'Mac (Browser)(Huckle)'];

describe('Accordion Trusted Devices', () => {
  function setup(props) {
    return mount(ListViewTrustedDevices, {
      global: {
        plugins: [i18n],
      },
      props: {
        userId: 'testUser',
        ...props,
      },
    });
  }

  function getTableRows(wrapper) {
    const table = findByRole(wrapper, 'table');
    const tableBody = table.find('tbody[role=rowgroup]');
    const tableRows = tableBody.findAll('[role=row]');
    return tableRows;
  }

  let wrapper;
  describe('@renders', () => {
    beforeEach(async () => {
      TrustedDevicesApi.loadUserTrustedDevices = jest.fn().mockReturnValue(Promise.resolve(deviceData));
      Parse.parseLocationData = jest.fn().mockReturnValue(Promise.resolve({ formattedAddress: '123 Example st.', locality: 'Exampleville', map: 'http://example.com/map' }));
    });

    // Renders the correct amount of table rows
    it('the correct amount of table rows', async () => {
      wrapper = setup();
      await flushPromises();
      const tableRows = getTableRows(wrapper);

      expect(tableRows.length).toBe(deviceData.data.result.length);
    });

    // Renders the device type, name, and location (if exists)
    it('the device type, name, and location (if exists)', async () => {
      wrapper = setup();
      await flushPromises();
      const tableRows = getTableRows(wrapper);

      // Device Type
      tableRows.forEach((item, i) => {
        const deviceType = item.find('.media-aside .device');
        expect(deviceType.attributes('data-device-type')).toBe(deviceTypes[i]);
      });

      // Device Name
      tableRows.forEach((item, i) => {
        const deviceType = item.find('.media-body');
        expect(deviceType.text()).toBe(deviceNames[i]);
      });
    });

    it('delete button when a checkbox is checked', async () => {
      wrapper = setup();
      await flushPromises();

      // Get header to check button
      const header = wrapper.find('.card-header .row > div');

      // Logic to select checkbox
      const tableRows = getTableRows(wrapper);
      const tableRow = tableRows[0];
      const checkbox = tableRow.find('input[type=checkbox]');
      await checkbox.setValue(true);

      expect(header.find('button')).toBeDefined();
    });
  });
});
