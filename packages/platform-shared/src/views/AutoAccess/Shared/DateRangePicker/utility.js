/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';

export const defaultDateRange = () => dateRangeoOptions().find((option) => option.key === 'this_week');

export const getInterval = (dates) => {
  if (dayjs(dates[0]).isSame(dates[1], 'day')) {
    return 'hour';
  } if (dayjs(dates[1]).diff(dates[0], 'month') > 8) {
    return 'month';
  }
  return 'day';
};

export const dateRangeoOptions = () => [
  {
    key: 'today',
    dates: [
      dayjs().startOf('day').format(),
      dayjs().endOf('day').format(),
    ],
  },
  {
    key: 'this_week',
    dates: [
      dayjs().subtract(6, 'day').startOf('day').format(),
      dayjs().endOf('day').format(),
    ],
  },
  {
    key: 'this_month',
    dates: [
      dayjs().startOf('month').format(),
      dayjs().format(),
    ],
  },
  {
    key: 'custom',
    dates: [
      dayjs().subtract(7, 'day').startOf('day').format(),
      dayjs().format(),
    ],
  },
];
