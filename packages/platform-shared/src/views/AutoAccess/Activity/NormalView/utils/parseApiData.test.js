/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import parseApiData from './parseApiData';

const inputData = {
  result: [
    {
      count: '367',
      category: 'time_of_day',
      type: 'all',
      value: 'evening',
    },
    {
      count: '4',
      category: 'time_of_day',
      type: 'all',
      value: 'afternoon',
    },
    {
      count: '4',
      category: 'time_of_day',
      type: 'all',
      value: 'morning',
    },
    {
      count: '1',
      category: 'time_of_day',
      type: 'all',
      value: null,
    },
    {
      count: '157',
      category: 'os',
      type: 'all',
      value: 'windows',
    },
    {
      count: '123',
      category: 'os',
      type: 'all',
      value: 'other',
    },
    {
      count: '53',
      category: 'os',
      type: 'all',
      value: 'linux',
    },
    {
      count: '17',
      category: 'os',
      type: 'all',
      value: 'android',
    },
    {
      count: '17',
      category: 'os',
      type: 'all',
      value: 'ios',
    },
    {
      count: '9',
      category: 'os',
      type: 'all',
      value: 'Others',
    },
    {
      count: '333',
      category: 'device',
      type: 'all',
      value: 'other',
    },
    {
      count: '17',
      category: 'device',
      type: 'all',
      value: 'generic_smartphone',
    },
    {
      count: '17',
      category: 'device',
      type: 'all',
      value: 'iphone',
    },
    {
      count: '8',
      category: 'device',
      type: 'all',
      value: 'mac',
    },
    {
      count: '1',
      category: 'device',
      type: 'all',
      value: null,
    },
    {
      count: '371',
      category: 'day_of_week',
      type: 'all',
      value: 'wednesday',
    },
    {
      count: '4',
      category: 'day_of_week',
      type: 'all',
      value: 'thursday',
    },
    {
      count: '1',
      category: 'day_of_week',
      type: 'all',
      value: null,
    },
    {
      count: '207',
      category: 'country',
      type: 'all',
      value: 'united_states',
    },
    {
      count: '69',
      category: 'country',
      type: 'all',
      value: null,
    },
    {
      count: '29',
      category: 'country',
      type: 'all',
      value: 'united_kingdom',
    },
    {
      count: '13',
      category: 'country',
      type: 'all',
      value: 'france',
    },
    {
      count: '13',
      category: 'country',
      type: 'all',
      value: 'slovakia',
    },
    {
      count: '45',
      category: 'country',
      type: 'all',
      value: 'Others',
    },
    {
      count: '185',
      category: 'city',
      type: 'all',
      value: 'city_unknown_united_states',
    },
    {
      count: '69',
      category: 'city',
      type: 'all',
      value: null,
    },
    {
      count: '14',
      category: 'city',
      type: 'all',
      value: 'city_unknown_united_kingdom',
    },
    {
      count: '13',
      category: 'city',
      type: 'all',
      value: 'senec_slovakia',
    },
    {
      count: '12',
      category: 'city',
      type: 'all',
      value: 'atlanta_united_states',
    },
    {
      count: '83',
      category: 'city',
      type: 'all',
      value: 'Others',
    },
    {
      count: '350',
      category: 'browser',
      type: 'all',
      value: 'other',
    },
    {
      count: '17',
      category: 'browser',
      type: 'all',
      value: 'mobile_safari_ui^wkwebview',
    },
    {
      count: '8',
      category: 'browser',
      type: 'all',
      value: 'chrome',
    },
    {
      count: '1',
      category: 'browser',
      type: 'all',
      value: null,
    },
  ],
  totalCount: 34,
  currentCount: 34,
};

const keyLengths = {
  time_of_day: 4,
  os: 6,
  device: 4,
  day_of_week: 3,
  country: 6,
  city: 6,
  browser: 3,
};

it('contains the correct object key', () => {
  const outputData = parseApiData(inputData);
  const outputKeys = Object.keys(outputData);
  expect(outputKeys).toStrictEqual(['time_of_day', 'os', 'device', 'day_of_week', 'country', 'city', 'browser']);
});

it('contains the correct "other" and "unknown" fields', () => {
  const outputData = parseApiData(inputData);

  const otherOsData = outputData.os.filter((item) => item.label === 'other');
  expect(otherOsData.length).toBe(1);

  const unknownOsData = outputData.os.filter((item) => item.label === 'unknown');
  expect(unknownOsData.length).toBe(1);
});

it('contains the number of array elements per object key', () => {
  const outputData = parseApiData(inputData);
  const outputKeys = Object.keys(outputData);
  outputKeys.forEach((item) => {
    expect(outputData[item].length).toBe(keyLengths[item]);
  });
});
