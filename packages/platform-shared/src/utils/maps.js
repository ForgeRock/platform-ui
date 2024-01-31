/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Loader } from '@googlemaps/js-api-loader';
import store from '@forgerock/platform-shared/src/store';

/**
 * Provides 2 functions to get specific data from a Google Maps API reverse geocode request
 *
 * @param {google.maps.GeocoderResult[]} results - Array of `GeocoderResults` data from a `Geocoder.geocode` request
 * @returns {{getFormattedAddress: (type: string) => string, getAddressComponent: (type: string) => google.maps.GeocoderAddressComponent}} Two functions for retrieving a formatted address or a `google.maps.GeocoderAddressComponent`
 */

export function geocodeTypeGetter(results) {
  function getObj(obj, type) {
    if (obj) {
      return obj.filter((result) => result.types.indexOf(type) > -1)[0] || null;
    }
    return null;
  }
  return {
    getFormattedAddress(type) {
      const obj = getObj(results, type);
      return obj.formatted_address;
    },
    getAddressComponent(type) {
      const obj = getObj(results, 'street_address')?.address_components;
      return getObj(obj, type);
    },
  };
}

/**
 * Helper utility function for Google Maps API for converting a LatLng to an address
 *
 * @param {google.maps.LatLngLiteral} latlng - Latitude and Longitude to reverse geocode
 * @returns {Promise<google.maps.GeocoderResponse>} Promise of a Geocoder Response
 *
 * @example
 * ```
 * const { results: geocodeResults } = await reverseGeocode({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
 * ```
 */
export async function reverseGeocode(latlng) {
  const loader = new Loader({ apiKey: store.state.SharedStore.googleMapsApiKey });
  const { Geocoder } = await loader.importLibrary('geocoding');

  const geocoder = new Geocoder();
  return geocoder.geocode({ location: latlng });
}

/**
 * Creates a URL of a Google Map location as a static image.
 * Can be used in the src of an <img />
 *
 * @param {StaticMapConfig} mapConfig - Parameter description.
 * @returns {string} URL of a Google Map static image
 *
 * @example
 * ```
 * <img :src="staticMap(mapConfig)" alt="Static Google Map" />
 * ```
 */
export function staticMap(mapConfig) {
  const {
    center = 'San+Fransisco,CA',
    language = 'en',
    mapType = 'roadmap',
    markers = 'San+Fransisco,CA',
    scale = 2,
    size = { width: 100, height: 100 },
    zoom = 9,
  } = mapConfig;

  return `https://maps.googleapis.com/maps/api/staticmap?key=${store.state.SharedStore.googleMapsApiKey}
    &language=${language}
    &maptype=${mapType}
    &markers=${markers}
    &scale=${scale}
    &size=${size.width}x${size.height}
    &zoom=${zoom}
    &center=${center}
  `;
}
