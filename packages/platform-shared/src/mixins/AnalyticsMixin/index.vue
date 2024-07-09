<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { getAnalyticsData } from '@forgerock/platform-shared/src/api/AnalyticsApi';
import * as d3 from 'd3';
import i18n from '@/i18n';

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
    percent(value) {
      return `${Math.round(100 * value)}%`;
    },
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
        const timestamp = nextIntervalValue.utc('z').local().format(foundFormat);
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
      // TODO: ignore as this is for testing error states
      // const intervalType = eventType === 'userTotal' ? 'foo' : this.selectedIntervalType;
      // return getAnalyticsData(eventType, dateRange, intervalType)
      //   .then(({ data }) => {
      //     const formattedData = this.formatApiData(data, eventType, dateRange, persist);
      //     return Promise.resolve(formattedData);
      //   });
      return getAnalyticsData(eventType, dateRange, this.selectedIntervalType)
        .then(({ data }) => {
          const formattedData = this.formatApiData(data, eventType, dateRange, persist);
          return Promise.resolve(formattedData);
        }).catch((error) => Promise.reject(error));
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
      let diff = endDate.diff(startDate, diffInterval);

      // Add an extra hour when the diff interval is an hour to pad it to 24 hours
      if (diffInterval === 'hour') {
        diff += 1;
      }

      const foundFormat = this.getDayjsIntervalFormat(this.selectedIntervalType);

      return {
        diff, diffInterval, endDate, foundFormat, startDate,
      };
    },
    svgTextTruncate(dotText) {
      dotText.each(function dotme() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/);

        const ellipsis = text.text('').append('tspan').attr('class', 'elip').text('...');
        const width = parseFloat(text.attr('width')) - ellipsis.node().getComputedTextLength();
        const numWords = words.length;

        const tspan = text.insert('tspan', ':first-child').text(words.join(' '));

        // Try the whole line
        // While it's too long, and we have words left, keep removing words
        while (tspan.node().getComputedTextLength() > width && words.length > 1) {
          words.pop();
          tspan.text(words.join(' '));
        }

        if (words.length === 1 && tspan.node().getComputedTextLength() > width) {
          let shortWord = words.pop();
          while (shortWord.length && tspan.node().getComputedTextLength() > width) {
            shortWord = shortWord.substring(0, shortWord.length - 1);
            tspan.text(shortWord);
          }
        }

        if (words.length === numWords) {
          ellipsis.remove();
        }
      });
    },
  },
  computed: {
    /**
      * Sets array used by vue2-date-range-picker for hard-coded intervals
      *
      * @returns {DateRange[]} array of DateRange objects
      */
    ranges() {
      const formatStart = (dayjsDate) => dayjsDate.startOf('day').toDate();
      const formatEnd = (dayjsDate) => dayjsDate.endOf('day').toDate();

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

      // Get translated labels
      // the vue2-daterange-picker library that consumes these doesn't have a way to define
      // the label apart from the object key, so there is a chance that some customer translation
      // might cause issues here.
      const today = i18n.global.t('common.timePeriods.today');
      const yesterday = i18n.global.t('common.timePeriods.yesterday');
      const last7Days = i18n.global.t('common.timePeriods.last7Days');
      const last30Days = i18n.global.t('common.timePeriods.last30Days');

      return {
        [today]: [startOfDay, now],
        [yesterday]: [yesterdayStart, yesterdayEnd],
        [last7Days]: [last7DaysStart, now],
        [last30Days]: [last30DaysStart, now],
      };
    },
  },
};
</script>
