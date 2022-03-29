<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {
  getAnalyticsData,
} from '@forgerock/platform-shared/src/api/AnalyticsApi';

/**
 * @description Analytics mixin used for global analytics functionality
 *
 */

/**
  * @typedef {{ endDate: object, startDate: object }} DateRange
*/

dayjs.extend(advancedFormat);
export default {
  name: 'AnalyticsMixin',
  data() {
    return {
      eventTypes: {},
      intervalType: {
        hour: 'hourly',
        day: 'daily',
        month: 'monthly',
      },
      settings: {
        normal: {
          background: true, color: 'primary', stroke: 'solid',
        },
        normalError: {
          background: true, color: 'danger', stroke: 'solid',
        },
        lastPeriod: {
          background: false, color: 'primary', stroke: 'dashed',
        },
        lastPeriodError: {
          background: false, color: 'danger', stroke: 'dashed',
        },
      },
    };
  },
  methods: {
    /**
      * Generates total value
      *
      * @param {object} data
      * @param {boolean} persist
      * @returns {string} total value
      */
    accumulateTotal(data, persist) {
      const reduceFunc = persist
        ? (prev, curr) => (prev >= curr.value ? prev : curr.value)
        : (prev, curr) => prev + curr.value;
      const total = data.reduce(reduceFunc, 0);
      return total.toString();
    },
    /**
      * Formats a new object array to be used in the LineChart component
      *
      * @param {object} data
      * @param {object} eventType
      * @param {DateRange} dateRange
      * @param {boolean} persist
      * @returns {array} formatted data
      */
    formatApiData(data, eventType, dateRange, persist) {
      const {
        diff, diffInterval, foundFormat, startDate,
      } = this.getFormatOptions(dateRange);

      const resultKeys = this.eventTypes[eventType].resultKey;
      const updatedData = Array(resultKeys.length);
      const formatType = this.getDayjsIntervalFormat(diffInterval);
      let persistedValue = 0;

      const format = (resultKey, i) => {
        const nextIntervalValue = startDate.add(i, diffInterval);
        const found = data.find((item) => item.intervalValue === nextIntervalValue.format(formatType));

        if (found && persist) {
          persistedValue = found.result[resultKey];
        }

        const value = found ? found.result[resultKey] : persistedValue;
        const timestamp = found ? found.intervalValue : nextIntervalValue.format(foundFormat);
        return {
          id: i,
          resultKey,
          value: value || 0,
          originalTimestamp: timestamp,
          timestamp,
        };
      };

      for (let i = 0; i < diff; i += 1) {
        resultKeys.forEach((resultKey, keyIndex) => {
          if (!Array.isArray(updatedData[keyIndex])) {
            updatedData[keyIndex] = [];
          }
          const r = format(resultKey, i, keyIndex);
          updatedData[keyIndex].push(r);
          return r;
        });
      }

      return updatedData;
    },
    /**
      * Makes a request to the analytics api and returns formatted data
      *
      * @param {DateRange} dateRange
      * @param {object} eventType
      * @param {boolean} persist
      * @returns {array} formatted data
      */
    getChartData(dateRange, eventType, persist) {
      return getAnalyticsData(eventType, dateRange, this.selectedIntervalType)
        .then(({ data }) => {
          // TODO: ignore as this is for testing error states
          // if (eventType === 'alpharMarch4Journey') {
          //   data = undefined;
          // }
          const formattedData = this.formatApiData(data, eventType, dateRange, persist);
          return formattedData;
        });
    },
    /**
      * Find the total value for the active dataset
      *
      * @param {object} chartData
      * @returns {string} total value
      */
    getCountTotal(chartData) {
      const found = chartData.find((data) => data.active);
      return found ? found.total : '0';
    },
    /**
      * Gets the similar interval value string based on api formatted string
      *
      * @param {string} intervalType
      * @returns {string} interval value
      */
    getDayjsIntervalType(intervalType) {
      switch (intervalType) {
        case 'hourly':
          return 'hour';
        case 'daily':
          return 'day';
        default:
          return 'day';
      }
    },
    /**
      * Gets the dayjs format based on interval type
      *
      * @param {string} intervalType
      * @returns {string} dayjs format string
      */
    getDayjsIntervalFormat(intervalType) {
      switch (intervalType) {
        case 'daily':
        case 'day':
          return 'YYYY-MM-DD';
        case 'hourly':
        case 'hour':
          return 'YYYY-MM-DDTHH';
        default:
          return 'YYYY-MM-DDTHH:mm:ss';
      }
    },
    /**
      * Gets start/end date options based on DateRange
      *
      * @param {DateRange} dateRange
      * @returns {string} dayjs format string
      */
    getFormatOptions(dateRange) {
      const endDate = dayjs(dateRange.endDate);
      const startDate = dayjs(dateRange.startDate);
      const diffInterval = this.getDayjsIntervalType(this.selectedIntervalType);
      const diff = endDate.diff(startDate, diffInterval);
      const foundFormat = this.getDayjsIntervalFormat(this.selectedIntervalType);

      return {
        diff, diffInterval, endDate, foundFormat, startDate,
      };
    },
  },
  computed: {
    /**
      * Sets array used by vue2-date-range-picker for hard-coded intervals
      *
      * @returns {DateRange[]} array of DateRange objects
      */
    ranges() {
      const formatStart = (dayjsDate) => dayjsDate.hour(0).minute(0).second(0).toDate();
      const formatEnd = (dayjsDate) => dayjsDate.hour(23).minute(59).second(59).toDate();

      // Today
      const startOfDay = formatStart(dayjs());
      const now = formatEnd(dayjs().add(1, 'day'));

      // Yesterday
      const yesterdayStart = formatStart(dayjs().subtract(1, 'day'));
      const yesterdayEnd = formatEnd(dayjs().subtract(1, 'day'));

      // Last 7 days
      const last7DaysStart = formatStart(dayjs().subtract(7, 'day'));

      // Last 30 days
      const last30DaysStart = formatStart(dayjs().subtract(30, 'day'));

      return {
        Today: [startOfDay, now],
        Yesterday: [yesterdayStart, yesterdayEnd],
        'Last 7 Days': [last7DaysStart, now],
        'Last 30 Days': [last30DaysStart, now],
      };
    },
  },
};
</script>
