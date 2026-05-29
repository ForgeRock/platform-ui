/**
 * Copyright (c) 2022-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAnalyticsApi } from './BaseApi';
import store from '@/store';

export function getAnalyticsData(eventType, dateRange, intervalType, journeys = []) {
  const { startDate, endDate } = dateRange;

  const endDateTimeStr = endDate ? `&endDateTime=${endDate}` : '';
  const journeyParam = journeys.length ? `&journeys=${encodeURIComponent(journeys.join(','))}` : '';
  const params = `&startDateTime=${startDate}&intervalType=${intervalType}${endDateTimeStr}${journeyParam}`;

  const useV2Endpoint = store.state.analyticsDashEnabled && (store.state.analyticsDashboardMode === 'beta' || journeys.length > 0);

  const endpoint = useV2Endpoint ? '/v2' : '';

  return generateAnalyticsApi().get(`${endpoint}?eventType=${eventType}&realm=${store.state.realm}${params}`);
}
