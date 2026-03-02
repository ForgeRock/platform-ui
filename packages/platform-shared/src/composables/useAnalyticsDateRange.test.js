/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import vuex from 'vuex';
import useAnalyticsDateRange from './useAnalyticsDateRange';

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}));

jest.mock('dayjs', () => {
  const dayjs = jest.requireActual('dayjs');
  const utc = jest.requireActual('dayjs/plugin/utc');
  dayjs.extend(utc);
  return dayjs;
});

describe('useAnalyticsDateRange', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = {
      getters: {
        'AnalyticsStore/dateRange': {
          startDate: new Date('2024-01-01T00:00:00.000Z'),
          endDate: new Date('2024-01-01T23:59:59.000Z'),
        },
      },
      commit: jest.fn(),
    };
    vuex.useStore.mockReturnValue(mockStore);
  });

  it('provides the pickerDateRange from the store', () => {
    const { pickerDateRange } = useAnalyticsDateRange();
    expect(pickerDateRange.value).toEqual(mockStore.getters['AnalyticsStore/dateRange']);
  });

  it('commits the date range to the store on set', () => {
    const { pickerDateRange } = useAnalyticsDateRange();
    const newRange = {
      startDate: new Date('2024-02-01T00:00:00.000Z'),
      endDate: new Date('2024-02-02T23:59:59.000Z'),
    };
    pickerDateRange.value = newRange;
    expect(mockStore.commit).toHaveBeenCalledWith('AnalyticsStore/setDateRange', newRange);
  });

  it('normalizes single-day selections that are not today', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-15T12:00:00.000Z'));

    try {
      const { pickerDateRange } = useAnalyticsDateRange();
      const newRange = {
        startDate: new Date('2024-02-01T10:00:00.000Z'),
        endDate: new Date('2024-02-01T14:00:00.000Z'),
      };
      pickerDateRange.value = newRange;
      expect(newRange.startDate.getHours()).toBe(0);
      expect(newRange.endDate.getHours()).toBe(23);
    } finally {
      jest.useRealTimers();
    }
  });

  it('calculates selectedIntervalType as hourly for single-day ranges', () => {
    const { selectedIntervalType } = useAnalyticsDateRange();
    expect(selectedIntervalType.value).toBe('hourly');
  });

  it('calculates selectedIntervalType as daily for multi-day ranges', () => {
    mockStore.getters['AnalyticsStore/dateRange'] = {
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2024-01-03T23:59:59.000Z'),
    };
    const { selectedIntervalType } = useAnalyticsDateRange();
    expect(selectedIntervalType.value).toBe('daily');
  });

  it('formats requestDateRange correctly for hourly intervals', () => {
    const { requestDateRange } = useAnalyticsDateRange();
    expect(requestDateRange.value).toEqual({
      current: {
        startDate: '2024-01-01T00',
        endDate: '2024-01-01T23',
      },
      previous: {
        startDate: '2023-12-31T00',
        endDate: '2023-12-31T23',
      },
    });
  });

  it('formats requestDateRange correctly for daily intervals', () => {
    mockStore.getters['AnalyticsStore/dateRange'] = {
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2024-01-03T23:59:59.000Z'),
    };
    const { requestDateRange } = useAnalyticsDateRange();
    expect(requestDateRange.value).toEqual({
      current: {
        startDate: '2024-01-01',
        endDate: '2024-01-04',
      },
      previous: {
        startDate: '2023-12-30',
        endDate: '2024-01-02',
      },
    });
  });
});
