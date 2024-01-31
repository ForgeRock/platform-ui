/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import UAParser from 'ua-parser-js';
import i18n from '@forgerock/platform-shared/src/i18n';
import { parseLocationData } from './parse';

dayjs.extend(relativeTime);

/**
   * Sort devices by lastSelected date beginning with the most recent
   *
   * @param {array} devices array of device objects
   * @returns {array} array of device objects sorted by lastSelectedDate
   */
function sortDevicesByDate(devices) {
  return devices.sort((cur, next) => next.lastSelectedDate - cur.lastSelectedDate);
}

/**
  * Formats an AM Trusted Device object to be used in the UI
  *
  * @param {array} result - Data from an AM Trusted Device request
  * @returns {Promise<array>} Array of devices formatted for use on a Trusted Device list page
  */
/* eslint-disable import/prefer-default-export */
export function formatDevices(result) {
  return Promise.all(sortDevicesByDate(result).map(async (deviceData) => {
    const {
      alias, identifier, lastSelectedDate, location,
    } = deviceData;

    const locationData = parseFloat(location?.latitude) && parseFloat(location?.longitude) ? await parseLocationData(location) : { formattedAddress: '', locality: '', map: '' };

    const ua = deviceData.metadata.browser.userAgent;
    const unknownText = i18n.global.t('pages.profile.trustedDevices.unknown');
    const browserText = i18n.global.t('pages.profile.trustedDevices.browser');
    const osText = i18n.global.t('pages.profile.trustedDevices.os');
    const { browser, os } = ua ? UAParser(ua) : { browser: { name: unknownText, version: browserText }, os: { name: unknownText, version: osText } };
    const profileId = localStorage.getItem('profile-id');

    const parsedDevice = {
      alias,
      browser: (`${browser.name} ${browser.version}`).trim(),
      cpu: `${deviceData.metadata.platform.platform}`,
      deviceId: identifier,
      deviceType: os.name || '',
      isCurrent: identifier === profileId,
      lastLogin: dayjs(lastSelectedDate).fromNow(),
      os: (`${os.name || ''} ${os.version || ''}`).trim(),
    };

    return { ...parsedDevice, ...locationData };
  }));
}
