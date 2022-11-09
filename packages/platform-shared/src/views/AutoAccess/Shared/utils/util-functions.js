/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';

export const getPrevDateRange = (dateRange, interval = 'day') => {
  const intervalLength = dayjs(dateRange[1]).diff(dateRange[0], interval) + 1;
  return [
    dayjs(dateRange[0]).subtract(intervalLength, interval).startOf(interval),
    dayjs(dateRange[0]).subtract(1, interval).endOf(interval),
  ];
};

export const getPercentChange = (val, prevVal) => ((val - prevVal) / prevVal) * 100;

export function getBrowserLocale() {
  return window.navigator.userLanguage || window.navigator.language;
}

export function formatBytes(bytes, decimals = 2) {
  let Bytes = bytes;
  Bytes = parseInt(Bytes, 10);
  if (Bytes === 0) return '0';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(Bytes) / Math.log(k));

  return `${parseFloat((Bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
}

export const getFormattedDateTime = (date, twoLine = true) => {
  if (!date) return '';
  return dayjs(date).format('MMMM D, YYYY') + (twoLine ? '<br/>' : '') + dayjs(date).format('h:mm A');
};
