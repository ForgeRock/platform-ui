<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCalendar
    v-bind="$attrs"
    :value="value"
    :date-info-fn="dateClass"
    :max="max"
    hide-header
    @selected="handleClick"
  >
    <template #nav-prev-year>
      <i class="material-icons-outlined">
        first_page
      </i>
    </template>
    <template #nav-prev-month>
      <i class="material-icons-outlined">
        chevron_left
      </i>
    </template>
    <template #nav-this-month>
      <i class="material-icons-outlined">
        calendar_today
      </i>
    </template>
    <template #nav-next-month>
      <i class="material-icons-outlined">
        chevron_right
      </i>
    </template>
    <template #nav-next-year>
      <i class="material-icons-outlined">
        last_page
      </i>
    </template>
  </BCalendar>
</template>
<script>
import { BCalendar } from 'bootstrap-vue';
import dayjs from 'dayjs';

export default {
  name: 'Calendar',
  components: {
    BCalendar,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    dates: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    max() {
      return dayjs().format();
    },
  },
  methods: {
    handleClick(date) {
      this.$emit('handleUpdate', date);
    },
    dateClass(ymd, date) {
      let classes = '';
      if (dayjs(date).isSame(this.dates[0], 'day')) {
        classes += 'start';
      }
      if (dayjs(date).isSame(this.dates[1], 'day')) {
        classes += 'end';
      }
      if (dayjs(date).isAfter(this.dates[0], 'day') && dayjs(date).isBefore(this.dates[1], 'day')) {
        const btns = document.querySelectorAll('.b-calendar-grid-body [role="button"]');
        const firstDateInView = btns.item(0);
        const lastDateInView = btns.item(btns.length - 1);
        if (firstDateInView) {
          if (dayjs(firstDateInView.getAttribute('data-date')).isSame(date)) {
            if (dayjs(firstDateInView.getAttribute('data-date')).isAfter(dayjs(this.dates[0]))) {
              return 'continues-before';
            }
          }
        }
        if (lastDateInView) {
          if (dayjs(lastDateInView.getAttribute('data-date')).isSame(date)) {
            if (dayjs(lastDateInView.getAttribute('data-date')).isBefore(dayjs(this.dates[1]))) {
              return 'continues-after';
            }
          }
        }
        return 'in-range';
      }

      return classes;
    },
  },
};
</script>
<style lang="scss">
  .b-calendar {
    font-family: $fr-typeface;

    &-grid-help {
      display: none;
    }

    .b-calendar-grid {
      border: none;
      box-shadow: none;

      &-body .col[data-date] .btn {
        margin-top: 0;
        margin-bottom: 0;
      }

      .btn {
        position: relative;

        &:hover {
          background: #a9d8ff;
        }
      }
    }

    .btn-primary.active,
    .end .btn,
    .start .btn {
      &:not(:disabled) {
        background: var(--info);
        color: var(--white) !important;
      }
    }

    .in-range {
      background: $fr-sidemenu-hover;
    }

    .continues-before {
      background: linear-gradient(270deg, $fr-sidemenu-hover, transparent);
    }

    .continues-after {
      background: linear-gradient(90deg, $fr-sidemenu-hover, transparent);
    }

    .start,
    .end {
      &::before {
        content: '';
        position: absolute;
        background: $fr-sidemenu-hover;
        width: 50%;
        height: 100%;
      }
    }

    .start {
      &::before {
        right: 0;
      }

      &.end {
        background: rgba(0, 0, 0, 0);
      }
    }

    .end {
      &::before {
        left: 0;
      }

      &.start {
        background: rgba(0, 0, 0, 0);
      }
    }
  }
</style>
