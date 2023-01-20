<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <span class="access-attempts">
    <h5>
      {{ $t(chartTitleKey) }}
    </h5>
    <BOverlay
      :show="disabled"
      variant="transparent"
      spinner-variant="primary"
      blur="{ text: 'None', value: '' }"
    >
      <div class="d-flex flex-row mb-4">
        <div class="flex-fill">
          <h1 class="h2">
            {{ totalSumOfAttempts }}
          </h1>
          <div>
            <p
              class="m-0 align-self-end"
              :style="{visibility: disabled || isNaN(percentChange) || !isFinite(percentChange) ? 'hidden' : ''}"
            >
              <RiskScoreChange
                :change="parseFloat(percentChange)"
                :invert="type === 'risky' || type === 'risk-score'"
              />
            </p>
          </div>
        </div>
        <div class="mt-2 justify-content-end text-right">
          <LineChartLegend
            :items="legendItems"
            :colors="colors"
          />
        </div>
      </div>
      <LineChart
        :chart-data="chartData"
        :previous-data="previousData"
        :colors="colors"
        :type="type"
        :interval="interval"
        :view-box="viewBox"
        :loading="loading"
      />
    </BOverlay>
  </span>
</template>
<script>

import dayjs from 'dayjs';
import { BOverlay } from 'bootstrap-vue';
import { getEventLogs } from '../../Activity/api/ActivityAPI';
import LineChart from '../LineChart';
import LineChartLegend from '../LineChart/LineChartLegend';
import { histogramQuery, defaultData } from './api';
import { getInterval } from '../../../../components/DateRangePicker/utility';
import RiskScoreChange from '../../Shared/RiskScoreChange';
import { getPrevDateRange } from '../../Shared/utils/util-functions';
import formatNumber from '../../../../utils/formatNumber';

export default {
  name: 'AccessAttempts',
  components: {
    LineChart,
    LineChartLegend,
    BOverlay,
    RiskScoreChange,
  },
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      validator(value) {
        return value === 'normal' || value === 'risky' || value === 'risk-score';
      },
      default: '',
    },
    disabled: {
      type: Boolean,
      required: false,
    },
    userId: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    const segments = this.numSegments();
    return {
      chartData: defaultData(segments, this.dateRange[0]),
      previousData: defaultData(segments, this.dateRange[0]),
      prevSumOfAttempts: null,
      loading: true,
    };
  },
  watch: {
    dateRange: {
      handler(newVal, oldVal) {
        if (!dayjs(newVal[0]).isSame(oldVal[0])
                    || !dayjs(newVal[1]).isSame(oldVal[1])
        ) {
          this.fetchData();
        }
      },
    },
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    chartTitleKey() {
      switch (this.type) {
        case 'risky':
          return 'autoAccess.access.dashboard.riskyAccessHeader';
        case 'normal':
          return 'autoAccess.access.dashboard.normalAccessHeader';
        case 'risk-score':
          return 'autoAccess.access.userDetails.riskScoreChart';
        default:
          return '';
      }
    },
    viewBox() {
      switch (this.type) {
        case 'risk-score':
          return [800, 200];
        case 'risky':
        case 'normal':
        default:
          return [400, 200];
      }
    },
    colors() {
      switch (this.type) {
        case 'risky':
          return ['#bb4fe1'];
        case 'normal':
          return ['var(--success)'];
        case 'risk-score':
        default:
          return ['var(--info)'];
      }
    },
    legendItems() {
      switch (this.type) {
        case 'risky':
          return ['Risky Access'];
        case 'normal':
          return ['Normal Access'];
        case 'risk-score':
          return ['Risk Score'];
        default:
          return [''];
      }
    },
    interval() {
      return getInterval(this.dateRange);
    },
    percentChange() {
      if (this.prevSumOfAttempts === 0) {
        return '—';
      }
      return '';
    },
    totalSumOfAttempts() {
      return formatNumber(this.sumOfAttempts(), 'en-US');
    },
  },
  methods: {
    numSegments() {
      if (!this.interval) {
        return 7;
      }
      return dayjs(this.dateRange[1]).diff(this.dateRange[0], this.interval) + 1;
    },
    sumOfAttempts() {
      const summedChartData = this.chartData.reduce((prev, current) => { let valuePrev = prev; valuePrev += parseInt(current.value, 10); return valuePrev; }, 0);
      if (this.type === 'risk-score') {
        return summedChartData / this.chartData.length;
      }
      return summedChartData;
    },
    fetchData() {
      const numSegments = this.numSegments();
      const {
        dateRange, interval, type, userId,
      } = this;
      const prevDateRange = getPrevDateRange(dateRange, interval);
      const paramDateRange = [
        dayjs(dateRange[0]).startOf(interval),
        dayjs(dateRange[1]).endOf(interval),
      ];
      const flagRisky = type === 'risk-score' ? null : type === 'risky';
      const param = histogramQuery(
        flagRisky,
        paramDateRange,
        interval,
        userId,
      );
      const previousParam = histogramQuery(
        flagRisky,
        prevDateRange,
        interval,
        userId,
      );

      const placeholderChart = defaultData(numSegments, paramDateRange[0], interval);
      const placeholderPrev = defaultData(numSegments, prevDateRange[0], interval);

      this.$emit('loading', true);
      this.loading = true;

      Promise.all([getEventLogs(param), getEventLogs(previousParam)])
        .then((responses) => {
          responses.forEach((response, i) => {
            const placeholder = i === 0 ? [...placeholderChart] : [...placeholderPrev];
            const responseBucket = response.aggregations?.histogram?.buckets.forEach((bucket) => {
              const val = {
                value: type === 'risk-score' ? bucket.avg_value.value || 0 : bucket.doc_count,
                id: bucket.key,
                timestamp: bucket.key_as_string,
              };
              const index = placeholder.findIndex((d) => dayjs(d.timestamp).isSame(val.timestamp, interval));
              placeholder[index] = val;
            });

            if (i === 0) {
              this.chartData = placeholder;
            } else {
              this.previousData = placeholder;
              this.prevSumOfAttempts = placeholder.reduce((prev, current) => {
                let valuePrev = prev;
                valuePrev += current.value;
                return valuePrev;
              }, 0);
            }
            return responseBucket;
          });

          this.$emit('loading', false);
          this.loading = false;
        })
        .catch(() => {
          this.$emit('loading', false);
          this.loading = false;
        });
    },
  },
};
</script>
