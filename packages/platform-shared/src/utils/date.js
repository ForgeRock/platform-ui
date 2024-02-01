/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';

const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

/**
  * Sets array used by vue2-date-range-picker for hard-coded intervals
  *
  * @returns {DateRange[]} array of DateRange objects
  */
export default function dateRanges(dateFormat) {
  const formatDate = (dayjsDate) => (dateFormat
    ? dayjsDate.format(dateFormat)
    : dayjsDate.toISOString());

  // Today
  const startOfDay = dayjs().startOf('day');
  const startOfDayFormat = formatDate(startOfDay);
  const endOfDay = formatDate(dayjs().endOf('day'));

  // Yesterday
  const yesterdayStart = formatDate(startOfDay.subtract(1, 'day'));

  // Last 7 days
  const last7DaysStart = formatDate(dayjs().endOf('day').subtract(7, 'day'));

  // Last 30 days
  const last30DaysStart = formatDate(dayjs().endOf('day').subtract(30, 'day'));

  return {
    Today: [startOfDayFormat, endOfDay],
    Yesterday: [yesterdayStart, startOfDayFormat],
    'Last 7 Days': [last7DaysStart, endOfDay],
    'Last 30 Days': [last30DaysStart, endOfDay],
  };
}
