<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="position-absolute activity-filters-user-detail">
      <DateRangePicker
        @change="handleDateChange"
      />
    </div>
    <div class="py-4 px-5 user-detail-trends-container">
      <BCard class="overflow-hidden flex-grow-1 mb-4">
        <AccessAttempts
          :date-range="dateRange"
          @loading="(value) => setLoading(0, value)"
          :disabled="loading[0]"
          type="risk-score"
          :user-id="userId"
        />
      </BCard>
      <div class="d-flex flex-row">
        <BCard class="overflow-hidden flex-grow-1 w-50 mt-1 mr-3">
          <AccessAttempts
            :date-range="dateRange"
            @loading="(value) => setLoading(1, value)"
            :disabled="loading[1]"
            type="normal"
            :user-id="userId"
          />
        </BCard>
        <BCard class="overflow-hidden flex-grow-1 w-50 mt-1 ml-3">
          <AccessAttempts
            :date-range="dateRange"
            @loading="(value) => setLoading(2, value)"
            :disabled="loading[2]"
            type="risky"
            :user-id="userId"
          />
        </BCard>
      </div>
    </div>
  </div>
</template>
<script>
import { BCard } from 'bootstrap-vue';
import DateRangePicker from '../Shared/DateRangePicker';
import AccessAttempts from '../Charts/AccessAttempts';

export default {
  name: 'UserDetailTrends',
  props: {
    userId: {
      type: String,
      default: '',
    },
    dateRange: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: [false, false, false],
    };
  },
  components: {
    BCard,
    DateRangePicker,
    AccessAttempts,
  },
  methods: {
    handleDateChange(newDates) {
      this.$emit('handleDateChange', newDates);
    },
    setLoading(index, value) {
      const d = [...this.loading];
      d[index] = value;
      this.loading = d;
    },
  },
};
</script>
<style lang="scss">
  .user-detail-trends-container {
    max-width: 1000px;
    margin: 0 auto;
  }
</style>
