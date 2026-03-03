<!-- Copyright (c) 2022-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <Vue2DateRangePicker
    :locale-data="localeData"
    :max-date="maxDate"
    v-bind="$attrs"
    v-model="inputVal"
  >
    <template #input>
      <BButton
        class="dropdown-toggle"
        pill
        variant="outline-primary">
        {{ formatDate }}
      </BButton>
    </template>
  </Vue2DateRangePicker>
</template>

<script>
import Vue2DateRangePicker from 'vue2-daterange-picker';
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css';
import { BButton } from 'bootstrap-vue';
import dayjs from 'dayjs';

/**
  * @typedef {{ endDate: object, startDate: object }} DateRange
*/

export default {
  name: 'DateRangePicker',
  components: {
    Vue2DateRangePicker,
    BButton,
  },
  data() {
    return {
    /**
      * Configuration object for vue2-daterange-picker
      */
      localeData: {
        direction: 'ltr',
        format: 'mm/dd/yyyy',
        separator: ' - ',
        cancelLabel: this.$t('common.cancel'),
        applyLabel: this.$t('common.apply'),
        weekLabel: 'W',
        daysOfWeek: [
          this.$t('common.daysOfWeek.sundayShort'),
          this.$t('common.daysOfWeek.mondayShort'),
          this.$t('common.daysOfWeek.tuesdayShort'),
          this.$t('common.daysOfWeek.wednesdayShort'),
          this.$t('common.daysOfWeek.thursdayShort'),
          this.$t('common.daysOfWeek.fridayShort'),
          this.$t('common.daysOfWeek.saturdayShort'),
        ],
        monthNames: [
          this.$t('common.months.january'),
          this.$t('common.months.february'),
          this.$t('common.months.march'),
          this.$t('common.months.april'),
          this.$t('common.months.may'),
          this.$t('common.months.june'),
          this.$t('common.months.july'),
          this.$t('common.months.august'),
          this.$t('common.months.september'),
          this.$t('common.months.october'),
          this.$t('common.months.november'),
          this.$t('common.months.december'),
        ],
        firstDay: 1,
      },
    };
  },
  props: {
    value: {
      default: () => {},
      type: Object,
    },
  },
  computed: {
    /**
      * Sets today as max date for picker calendar
      *
      * @returns {Date} JavaScript Date class
      */
    maxDate() {
      return dayjs().toDate();
    },
    /**
      * v-model logic for handling input
      *
      * @param {DateRange} start/end dates
      * @returns {DateRange} start/end dates
      */
    inputVal: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
    /**
      * Formats button label based on current dateRange
      *
      * @returns {string} button label value
      */
    formatDate() {
      const startDate = dayjs(this.value.startDate);
      const endDate = dayjs(this.value.endDate);
      const today = dayjs();
      const sevenDaysAgo = dayjs().subtract(7, 'day');
      const thirtyDaysAgo = dayjs().subtract(30, 'day');

      if (today.isSame(startDate, 'day')) {
        return this.$t('dashboard.analytics.dateRangeToday');
      }
      if (today.subtract(1, 'day').isSame(startDate, 'day')) {
        return this.$t('dashboard.analytics.dateRangeYesterday');
      }
      if (sevenDaysAgo.isSame(startDate, 'day') && sevenDaysAgo.add(7, 'day').isSame(endDate, 'day')) {
        return this.$t('dashboard.analytics.dateRangeLast7Days');
      }
      if (thirtyDaysAgo.isSame(startDate, 'day') && thirtyDaysAgo.add(30, 'day').isSame(endDate, 'day')) {
        return this.$t('dashboard.analytics.dateRangeLast30Days');
      }
      if (startDate.isSame(endDate, 'day')) {
        return startDate.format('MMM D, YYYY');
      }

      return `${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')}`;
    },
  },
};
</script>
<style lang="scss">
  .vue-daterange-picker {
    .reportrange-text {
      padding: 0px !important;
      border-radius: 50rem !important;
    }
    .form-control {
      background: transparent !important;
      border: none;
      overflow: visible;
    }

    > .daterangepicker {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border-color);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.18);

      &::before, &::after {
        content: none;
      }

      &.show-ranges {
        .drp-calendar.left {
          border-left: 0;
        }
      }

      > .calendars {
        flex-direction: row-reverse;
        flex-wrap: nowrap;

        > .ranges {
          > ul {
            li {
              color: var(--nav-tabs-link-color) !important;
              font-size: 0.9375rem;
              padding: 0.675rem 1.5rem;
              white-space: nowrap;
              width: 100%;

              &:hover {
                background-color: var(--sidetabs-hover-bg) !important;
              }

              &.active {
                background-color: var(--bg-light-blue);
                color: var(--bg-white);
              }
            }
          }
        }

        > .calendars-container {
          border-right: 1px solid var(--card-border-color);
          padding: 1.5rem;

          .drp-calendar {
            > .calendar-table {
              background-color: transparent;
              border: none;
              thead th {
                background-color: transparent;
                font-size: 0.9375rem;
              }

              th {
                background-color: transparent;
              }

              td {
                background-color: transparent;
                font-size: 0.9375rem;
                height: 32px;
                width: 32px;

                &.in-range {
                  background-color: var(--bg-light-blue);

                  &.start-date:not(.off) {
                    color: var(--bg-white);
                  }

                  &.end-date:not(.off) {
                    color: var(--bg-white);
                  }
                  color: inherit;
                }
              }

              td.active:not(.off) {
                background-color: var(--primary);
              }
            }

            .next span, .prev span {
              border-color: var(--body-color);
            }

            &.left {
              .next span {
                display: none;
              }
            }

            &.right {
              .prev span {
                display: none;
              }
            }
          }
        }
      }

      > .drp-buttons {
        border-top: 1px solid var(--card-border-color);
        padding: 1rem 1.5rem;

        .btn {
          font-size: 0.9375rem;
          font-weight: 400;
          padding: 0.75rem 1.25rem;

          &-success {
            background-color: var(--primary);
            margin-left: 0;
          }

          &-secondary {
            background-color: transparent;
            color: var(--primary);
          }
        }

        > .drp-selected {
          display: none;
        }
      }
    }
  }
</style>
