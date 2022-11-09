/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const MAX_ZOOM = 7;
export const MIN_ZOOM = 3;

export const mapStyles = [
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

export const getMarkersStats = (markers) => {
  let sum = 0;
  let avg = 0;

  markers.forEach((m) => {
    sum += m.getData().doc_count;
    avg += m.getData().avg_score.value;
  });

  avg /= markers.length;

  return { sum, avg };
};

export const markerStyle = (position, sum, sumFormatted) => ({
  position,
  label: {
    text: `${sum > 0 ? sumFormatted : ' '}`,
    color: '#fff',
    fontWeight: 'normal',
    fontSize: '12px',
  },
  icon: {
    // eslint-disable-next-line no-undef
    path: google.maps.SymbolPath.CIRCLE,
    scale: Math.min(50, Math.max(10, 6 * Math.log(sum))),
    fillColor: '#f7685b',
    fillOpacity: 0.7,
    strokeWeight: 0,
  },
});
