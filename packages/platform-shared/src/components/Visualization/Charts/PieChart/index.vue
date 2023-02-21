<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <!-- Chart -->
    <D3PieChart
      ref="d3chart"
      :id="id"
      data-test-id="chart"
      class="pie-chart m-0 mb-3"
      :config="chartConfig"
      :datum="data"
      :height="height"
      :key="componentKey"
    />
    <!-- List -->
    <div class="d-flex justify-content-center">
      <ul
        data-test-id="list"
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
import uuid from 'uuid';
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
    adaptToHeigh: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    const radius = this.adaptToHeigh ? {
      inner: this.height * 0.36,
      outter: this.height * 0.48,
      round: this.height * 0.04,
    } : {
      inner: 55,
      outter: 65,
      padding: 0.05,
      round: 15,
    };
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
        radius,
      },
      /*
       * @description key used to force rerendering for the component on resize window, this is needed because the
       * chart d3 library is not able to recalculate the graph by itself on window resize
       */
      componentKey: 0,
    };
  },
  computed: {
    id() { return `chart_${uuid()}`; },
  },
  watch: {
    data: {
      handler() {
        this.addTooltips();
      },
      deep: true,
    },
  },
  mounted() {
    window.addEventListener('resize', this.forceRerender);
    this.addTooltips();
  },
  methods: {
    addTooltips() {
      this.$nextTick(
        () => {
          if (this.$refs.d3chart?.chart) {
            this.$refs.d3chart.chart.gcenter
              .selectAll('.chart__slice-group')
              .on('mouseover', ({ data }) => {
                this.$refs.d3chart.chart.tooltip.html(() => `<div role="tooltip">
            <div class="arrow"></div>
            <div class="tooltip-inner">
              <div class="text-gray-400">${data.label}</div>
              <div class="font-weight-bold">${data.value}</div>
              </div>
              </div>
              `).classed('active', true);
              })
              .on('mouseout', () => {
                this.$refs.d3chart.chart.tooltip.classed('active', false);
              })
              .on('mousemove', () => {
                const { width, height } = this.$refs.d3chart.chart.tooltip.node().getBoundingClientRect();
                this.$refs.d3chart.chart.tooltip
                  .style('position', 'fixed')
                  .style('left', `${window.event.clientX - (width / 2)}px`)
                  .style('top', `${window.event.clientY - (height + 5)}px`);
              });
          } else {
            setTimeout(this.addTooltips, 200);
          }
        },
      );
    },
    forceRerender() {
      this.componentKey += 1;
    },
  },

};
</script>
<style lang="scss" scoped>
.pie-chart::v-deep {
 .chart {
    &__label--piechart {
      display: none;
    }
    &__line--piechart {
      display: none;
    }
  }
  .chart__tooltip>div {
    background: transparent !important;
    padding: 0 0 5px 0;
  }
  .arrow {
    position: absolute;
    display: block;
    width: 100%;
    height: 0.4rem;
    text-align: center;
    bottom: 0;
    left: -5px;

    &::before {
      top: 0;
      border-width: 0.4rem 0.4rem 0;
      border-color: transparent;
      border-top-color: black;
      position: absolute;
      content: "";
      border-style: solid;
    }
  }
}

.data-list li .bullet {
  height: 10px;
  width: 24px;
}
</style>
