/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dateRanges from './date';

const dateValues = [
  ['returns a date range for the Today input', 'Today'],
  ['returns a date range for the Yesterday input', 'Yesterday'],
  ['returns a date range for the "Last 7 Days" input', 'Last 7 Days'],
  ['returns a date range for the "Last 30 Days" input', 'Last 30 Days'],
];

it.each(dateValues)('%s', async (_, rangeInput) => {
  const format = 'YYYY-MM-DD';
  const range = dateRanges(format)[rangeInput];

  expect(Array.isArray(range)).toBe(true);
  expect(range.length).toBe(2);
});
