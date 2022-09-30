/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAnalyticsApi } from './BaseApi';
import store from '@/store';

// eslint-disable-next-line import/prefer-default-export
export function getAnalyticsData(eventType, dateRange, intervalType) {
  const { endDate, startDate } = dateRange;
  const endDateTimeStr = endDate ? `&endDateTime=${endDate}` : '';
  const params = `&startDateTime=${startDate}&intervalType=${intervalType}${endDateTimeStr}`;

  return generateAnalyticsApi().get(`?eventType=${eventType}&realm=${store.state.realm}${params}`);
}
