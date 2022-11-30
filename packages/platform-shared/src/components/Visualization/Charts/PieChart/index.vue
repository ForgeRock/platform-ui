<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <!-- Chart -->
    <D3PieChart
      id="chart"
      class="pie-chart m-0 mb-3"
      :config="chartConfig"
      :datum="data"
      :height="height"
    />
    <!-- List -->
    <div class="d-flex justify-content-center">
      <ul
        id="list"
        class="data-list list-unstyled"
      >
        <li
          v-for="(item, index) in data"
          :key="index"
        >
          <span class="d-flex align-items-center">
            <span
              class="bullet rounded-pill mr-3"
              :style="{ backgroundColor: item.color }"
            />
            {{ item.label }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { D3PieChart } from 'vue-d3-charts';

/*
 * @description Pie Chart Component used to show data in a pie chart with percentages according the value of each item,
 * this component uses vue-d3-charts library under the hood
 * @tutorial https://saigesp.github.io/vue-d3-charts/#/piechart
 *
 * @param {Array}   data    data to be loaded in the pie chart, each item of the array has the following structure
 *                          @property {string}  label - label to be displayed on the items list
 *                          @property {number}  value - value to calculate the percentage used on the pie chart, the
 *                                                      D3PieChart component obtains this percentage by adding up the
 *                                                      value of all the items and based on that total it obtains the
 *                                                      percentage of the value of each item with a rule of three, for
 *                                                      example for the values 20, 50, 70 the total is 140 therefore
 *                                                      for the first item the operation (20 * 100) / 140 is applied
 *                                                      which result is the percentage 14%.
 *                          @property {string}  color - color for the section in the pie chart and the bullet on items list
 *                          {
 *                            label: 'Application',
 *                            value: 30,
 *                            color: '#109cf1'
 *                          }
 * @param {String}  height  height in pixels for the svg where the chart is displayed
 */
export default {
  name: 'PieChart',
  components: {
    D3PieChart,
  },
  props: {
    data: {
      default: () => [],
      type: Array,
      required: true,
    },
    height: {
      default: '300',
      type: String,
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
       * @property  {number}  radius.inner    - inner circle radius, 55 by default
       * @property  {number}  radius.outter   - outter circle radius, 65 by default
       * @property  {number}  radius.padding  - padding between slices, 0.05 by default
       * @property  {number}  radius.round    - corner's rounded radius, 15 by default
       */
      chartConfig: {
        key: 'label',
        value: 'value',
        color: {
          key: 'color',
        },
        radius: {
          inner: 55,
          outter: 65,
          padding: 0.05,
          round: 15,
        },
      },
    };
  },
};
</script>
<style lang="scss" scoped>
.pie-chart::v-deep .chart {
  &__label--piechart {
    display: none;
  }
  &__line--piechart {
    display: none;
  }
}
.data-list li .bullet {
  height: 10px;
  width: 24px;
}
</style>
