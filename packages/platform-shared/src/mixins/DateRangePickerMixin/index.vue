<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import dayjs from 'dayjs';

export default {
  name: 'DateRangePickerMixin',
  computed: {
    pickerDateRange: {
      get() {
        return this.$store.state.Dashboard.dates;
      },
      set(value) {
        const utcOffset = dayjs().utcOffset();
        this.$store.commit('Dashboard/dateChange',
          {
            dates: {
              startDate: dayjs(value.startDate).startOf('day').format(),
              endDate: dayjs(value.endDate).endOf('day').format(),
            },
            utcDates: {
              startDate: dayjs(value.startDate).startOf('day').add(5, 'h').format(),
              endDate: dayjs(value.endDate).endOf('day').add(-utcOffset, 'm').format(),
            },
          });
      },
    },
  },
};
</script>
