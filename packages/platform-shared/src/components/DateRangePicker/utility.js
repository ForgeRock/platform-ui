/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';

export const getInterval = (dates) => {
  if (dayjs(dates[0]).isSame(dates[1], 'day')) {
    return 'hour';
  } if (dayjs(dates[1]).diff(dates[0], 'month') > 8) {
    return 'month';
  }
  return 'day';
};

export const dateRangeoOptions = () => {
  const utcOffset = dayjs().utcOffset();
  return [
    {
      key: 'today',
      dates: {
        startDate: dayjs().startOf('day').format(),
        endDate: dayjs().endOf('day').format(),
      },
      utcDates: {
        startDate: dayjs().startOf('day').add(-utcOffset, 'm').format(),
        endDate: dayjs().endOf('day').add(-utcOffset, 'm').format(),
      },
    },
    {
      key: 'this_week',
      dates: {
        startDate: dayjs().subtract(6, 'day').startOf('day').format(),
        endDate: dayjs().endOf('day').format(),
      },
      utcDates: {
        startDate: dayjs().subtract(6, 'day').startOf('day').add(-utcOffset, 'm')
          .format(),
        endDate: dayjs().endOf('day').add(-utcOffset, 'm').format(),
      },
    },
    {
      key: 'this_month',
      dates: {
        startDate: dayjs().startOf('month').add(-utcOffset, 'm').format(),
        endDate: dayjs().add(-utcOffset, 'm').format(),
      },
      utcDates: {
        startDate: dayjs().startOf('month').add(-utcOffset, 'm').format(),
        endDate: dayjs().endOf('day').add(-utcOffset, 'm').format(),
      },
    },
    {
      key: 'custom',
      dates: {
        startDate: dayjs().subtract(7, 'day').startOf('day').add(-utcOffset, 'm')
          .format(),
        endDate: dayjs().add(-utcOffset, 'm').format(),
      },
      utcDates: {
        startDate: dayjs().subtract(7, 'day').startOf('day').add(-utcOffset, 'm')
          .format(),
        endDate: dayjs().endOf('day').add(-utcOffset, 'm').format(),
      },
    },
  ];
};

export const defaultDateRange = () => dateRangeoOptions().find((option) => option.key === 'this_week');
