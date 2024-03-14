/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { geocodeTypeGetter, reverseGeocode, staticMap } from '@forgerock/platform-shared/src/utils/maps';

/**
  * Parse the location-specific data
  *
  * @param {object} location - Location for parsing as an object with latitude and longitude
  * @returns {Promise<object>} Returns an object containing a formatted address, locality, and map
  */
/* eslint-disable import/prefer-default-export */
export async function parseLocationData(location) {
  const { latitude, longitude } = location;
  try {
    const { results: geocodeResults } = await reverseGeocode({ lat: latitude, lng: longitude });
    const geocodeType = geocodeTypeGetter(geocodeResults);
    const formattedAddress = geocodeType.getFormattedAddress('locality');
    const locality = geocodeType.getAddressComponent('locality');
    const map = staticMap({
      size: { width: 300, height: 200 },
      center: `${latitude},${longitude}`,
      markers: `${latitude},${longitude}`,
      zoom: 10,
    });

    return {
      formattedAddress,
      locality: locality?.long_name,
      map,
    };
  } catch (error) {
    // Do nothing since they don't have a Google Maps API Key
  }
  return {};
}
