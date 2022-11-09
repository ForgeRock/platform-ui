<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="date-range-picker">
    <BButton
      pill
      variant="outline-primary"
      :id="dateRangePickerId"
      class="date-range-picker-toggle"
    >
      {{ buttonLabel }}
    </BButton>

    <BPopover
      :target="dateRangePickerId"
      triggers="click"
      ref="popover"
      custom-class="date-range-picker-popover"
      placement="bottomleft">
      <BOverlay :show="disabled">
        <div class="d-flex flex-row">
          <div class="p-3">
            <Calendar
              :dates="dateRange"
              :value="dateRange[0]"
              @handleUpdate="handleDateChange"
            />
          </div>
          <div
            class="border-left"
            style="width: 150px;">
            <BNav vertical>
              <BNavItem
                v-for="option in options"
                :key="option.key"
                role="button"
                @click="selectOption(option)"
                :class="{'selected': dateRangeKey === option.key}"
              >
                <span class="text-dark">
                  {{ $t(`autoAccess.access.date_range_picker.${option.key}`) }}
                </span>
                <i
                  v-if="dateRangeKey === option.key"
                  class="material-icons material-icons-outlined text-success"
                >
                  done
                </i>
              </BNavItem>
            </BNav>
          </div>
        </div>
      </BOverlay>
      <div class="border-top p-3 d-flex flex-row justify-content-end">
        <BButton
          variant="primary"
          @click="commitChange"
        >
          Apply
        </BButton>
      </div>
    </BPopover>
  </div>
</template>
<script>
import {
  BPopover, BButton, BOverlay, BNav, BNavItem,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import Calendar from './Calendar';
import { dateRangeoOptions } from './utility';
import store from '@/store';

export default {
  name: 'DateRangePicker',
  components: {
    Calendar,
    BPopover,
    BButton,
    BOverlay,
    BNav,
    BNavItem,
  },
  data() {
    return {
      dateRangePickerId: `date-range-${Math.random() * 1000000}`,
      tempDateRange: null,
      tempUtcDateRange: null,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  computed: {
    options() {
      return dateRangeoOptions();
    },
    dateRange() {
      return this.tempDateRange || store.state.Dashboard.dates;
    },
    dateRangeKey() {
      let newKey = 'custom';
      const dates = this.dateRange;

      this.options.forEach((option) => {
        if (option.key !== 'custom') {
          if (dayjs(option.dates[0]).isSame(dates[0], 'day') && dayjs(option.dates[1]).isSame(dates[1], 'day')) {
            newKey = option.key;
          }
        }
      });

      return newKey;
    },
    buttonLabel() {
      const { dateRange, dateRangeKey } = this;
      const start = dayjs(dateRange[0]);

      if (start.isSame(start.startOf('month'), 'day')
                && dayjs(dateRange[1]).isSame(start.endOf('month'), 'day')
      ) {
        return start.format('MMMM YYYY');
      }

      if (dateRangeKey === 'custom') {
        const options1 = { month: 'short', day: 'numeric' };
        const options2 = { year: 'numeric', month: 'short', day: 'numeric' };
        if (start.isSame(dateRange[1], 'day')) {
          options2.weekday = 'short';
          return new Intl.DateTimeFormat([], options2).format(new Date(dateRange[0]));
        }
        if (!start.isSame(dateRange[1], 'year')) {
          options1.year = 'numeric';
        }
        return `${new Intl.DateTimeFormat([], options1).format(new Date(dateRange[0]))
        } – ${
          new Intl.DateTimeFormat([], options2).format(new Date(dateRange[1]))}`;
      }
      return this.$t(`autoAccess.access.date_range_picker.${dateRangeKey}`);
    },
  },
  methods: {
    selectOption(options) {
      const { dates, utcDates } = options;
      this.tempDateRange = dates;
      this.tempUtcDateRange = utcDates;
    },
    handleDateChange(date) {
      const d = dayjs(date);
      let dates = [...this.dateRange];
      if (d.isSame(dates[0], 'day') || d.isSame(dates[1], 'day')) {
        dates = [d.startOf('day').format(), d.endOf('day').format()];
      } else if (d.isBefore(dates[0], 'day')) {
        dates[1] = d.format();
      } else if (d.isBefore(dates[1], 'day')) {
        dates[0] = d.format();
      } else {
        dates[1] = d.format();
      }

      dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      const utcOffset = dayjs().utcOffset();
      const utcDates = [
        dayjs(dates[0]).add(-utcOffset, 'm').format(),
        dayjs(dates[1]).endOf('d').add(-utcOffset, 'm').format(),
      ];

      this.tempDateRange = dates;
      this.tempUtcDateRange = utcDates;
    },
    closePopover() {
      this.$refs.popover.$emit('close');
    },
    commitChange() {
      if (this.tempDateRange) {
        store.commit('Dashboard/dateChange', { dates: this.tempDateRange, utcDates: this.tempUtcDateRange });
      }
      this.tempDateRange = null;
      this.tempUtcDateRange = null;
      this.closePopover();
    },
  },
};
</script>
<style lang="scss">
  .date-range-picker {
    &-toggle {
      white-space: nowrap;
    }

    &-popover {
      font-family: $fr-typeface;
      max-width: 100%;

      .popover-body {
        padding: 0;
      }

      .arrow {
        display: none;
      }

      .nav-item {
        &.selected {
          background: $fr-sidemenu-hover;
        }
      }

      .nav-link {
        padding: 1rem;
      }
    }
  }
</style>
