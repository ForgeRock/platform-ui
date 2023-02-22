<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
/**
 * @description Date mixin used for converting date objects
 *
 */
export default {
  name: 'DateMixin',
  data() {
    return {
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
    };
  },
  methods: {
    // Subtracts input time from current time and converts into comparison string
    timeAgo(date) {
      const second = 1000;
      const minute = second * 60;
      const hour = minute * 60;
      const day = hour * 24;

      const thresholds = [
        { threshold: 540 * day, modifier: 365 * day, render: (elapsed) => this.$t('date.yearsAgo', { elapsed }) },
        { threshold: 320 * day, render: () => this.$t('date.yearAgo') },
        { threshold: 45 * day, modifier: 30 * day, render: (elapsed) => this.$t('date.monthsAgo', { elapsed }) },
        { threshold: 26 * day, render: () => this.$t('date.monthAgo') },
        { threshold: 36 * hour, modifier: 24 * hour, render: (elapsed) => this.$t('date.daysAgo', { elapsed }) },
        { threshold: 22 * hour, render: () => this.$t('date.dayAgo') },
        { threshold: 90 * minute, modifier: 60 * minute, render: (elapsed) => this.$t('date.hoursAgo', { elapsed }) },
        { threshold: 45 * minute, render: () => this.$t('date.hourAgo') },
        { threshold: 90 * second, modifier: 60 * second, render: (elapsed) => this.$t('date.minutesAgo', { elapsed }) },
        { threshold: 46 * second, render: () => this.$t('date.minuteAgo') },
        { threshold: 0 * second, render: () => this.$t('date.secondsAgo') },
      ];

      const elapsed = Math.round(new Date() - date);
      const { render, modifier } = thresholds.find(({ threshold }) => elapsed >= threshold);
      return render(Math.round(elapsed / modifier));
    },
  },
};
</script>
