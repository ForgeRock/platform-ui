<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="chart__container">
    <D3PieChart
      :id="`chart_${id}`"
      :key="id"
      class="m-0"
      :config="chartConfig"
      :datum="chartData"
      :height="height"
    />
    <div class="chart__percent">
      <small
        class="font-weight-bold m-0">
        {{ `${processedProgress}%` }}
      </small>
    </div>
  </div>
</template>

<script>
import { D3PieChart } from 'vue-d3-charts';
import styles from '@/scss/main.scss';

export default {
  name: 'InlinePieChart',
  components: {
    D3PieChart,
  },
  props: {
    height: {
      default: '50',
      type: String,
    },
    id: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    progressColor: {
      type: String,
      default: styles.blue,
    },
  },
  watch: {
    progress(progress) {
      this.processedProgress = this.roundProgress(progress);
      this.chartData = [
        {
          value: this.roundProgress(progress),
          color: this.progressColor,
        },
        {
          value: 100 - this.roundProgress(progress),
          color: styles.gray400,
        },
      ];
    },
  },
  data() {
    return {
      /*
       * @description configuration for the pie chart, for more details see the docs
       * @tutorial https://saigesp.github.io/vue-d3-charts/#/piechart
       * @property  {string}  key             - Field to use as identificator, 'label' by default
       * @property  {string}  value           - Field to compute item value, 'value' by default
       * @property  {object}  color           - Chart's color convention, for more details see the docs
       *                                        @tutorial https://saigesp.github.io/vue-d3-charts/#/piechart
       * @property  {string}  color.key       - Field to use as color for each item, 'color' by default
       * @property  {object}  radius          - Radius options convention, for more details see the docs
       *                                        @tutorial https://saigesp.github.io/vue-d3-charts/#/piechart
       * @property  {number}  radius.inner    - inner circle radius, 18 by default
       * @property  {number}  radius.outter   - outter circle radius, 24 by default
       * @property  {number}  radius.round    - corner's rounded radius, 2 by default
       */
      chartConfig: {
        key: 'label',
        value: 'value',
        color: {
          key: 'color',
        },
        radius: {
          inner: this.height * 0.36,
          outter: this.height * 0.48,
          round: this.height * 0.04,
        },
      },
      chartData: [
        {
          value: this.roundProgress(this.progress),
          color: this.progressColor,
        },
        {
          value: 100 - this.roundProgress(this.progress),
          color: styles.gray400,
        },
      ],
      processedProgress: this.roundProgress(this.progress),
    };
  },
  methods: {
    roundProgress(progress) {
      return progress > 50 ? Math.floor(progress) : Math.ceil(progress);
    },
  },
};
</script>
<style lang="scss" scoped>
.chart__container {
  position: relative;
}

::v-deep{
  .chart {
    &__label--piechart, &__line--piechart {
      display: none;
    }
    &__percent {
      width: 100%;
      position: absolute;
      top: 50%;
      -webkit-transform: translateY(-50%);
      -ms-transform: translateY(-50%);
      transform: translateY(-50%);
      text-align: center;
    }
  }
}
</style>
