import { computed } from 'vue';
import dayjs from 'dayjs';
import { useStore } from 'vuex';

/**
 * Shared analytics date-range logic
 *
 * Responsibilities:
 * - DateRangePicker
 * - Interval selection (hourly vs daily)
 * - API request date range formatting
 */
export default function useAnalyticsDateRange() {
  const store = useStore();

  /**
    * Gets the similar interval value string
    *
    * @param {string} intervalType
    * @returns {string} interval value
    */
  function getDayjsIntervalType(intervalType) {
    switch (intervalType) {
      case 'hourly':
        return 'hour';
      case 'daily':
        return 'day';
      default:
        return 'day';
    }
  }

  /**
    * Gets the dayjs format based on interval type
    *
    * @param {string} intervalType
    * @returns {string} dayjs format string
    */
  function getDayjsIntervalFormat(intervalType) {
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
  }

  /**
   * v-model for <FrDateRangePicker />
   */
  const pickerDateRange = computed({
    get() {
      return store.getters['AnalyticsStore/dateRange'];
    },
    set(value) {
      const { startDate, endDate } = value;
      const todayDate = new Date().getDate();

      // Normalize full-day ranges for non-today single-day selections
      if (endDate.getDate() === startDate.getDate() && startDate.getDate() !== todayDate) {
        startDate.setHours(0, 0, 0);
        endDate.setHours(23, 59, 59);
      }
      store.commit('AnalyticsStore/setDateRange', value);
    },
  });

  /**
   * Interval type based on date range length
   */
  const selectedIntervalType = computed(() => {
    const { startDate, endDate } = pickerDateRange.value;
    const diff = dayjs(endDate).diff(dayjs(startDate), 'day');
    return diff === 0 ? 'hourly' : 'daily';
  });

  /**
   * Formats date range for analytics API requests
   */
  const requestDateRange = computed(() => {
    const { startDate, endDate } = pickerDateRange.value;
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const diffInterval = getDayjsIntervalType(selectedIntervalType.value);
    const diff = end.diff(start, diffInterval);

    if (selectedIntervalType.value === 'hourly') {
      return {
        current: {
          startDate: start.utc().format(getDayjsIntervalFormat()),
          endDate: end.utc().format(getDayjsIntervalFormat()),
        },
        previous: {
          startDate: start.utc().subtract(diff + 1, diffInterval).format(getDayjsIntervalFormat()),
          endDate: end.utc().subtract(diff + 1, diffInterval).format(getDayjsIntervalFormat()),
        },
      };
    }

    return {
      current: {
        startDate: start.utc().format(getDayjsIntervalFormat()),
        endDate: end.utc().add(1, 'day').format(getDayjsIntervalFormat()),
      },
      previous: {
        startDate: start.utc().subtract(diff, diffInterval).format(getDayjsIntervalFormat()),
        endDate: end.utc().add(1, 'day').subtract(diff, diffInterval).format(getDayjsIntervalFormat()),
      },
    };
  });

  return {
    pickerDateRange,
    selectedIntervalType,
    requestDateRange,
  };
}
