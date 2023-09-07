<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="position-relative">
    <div
      data-testid="chart"
      ref="d3chart"
      :id="id" />
    <div
      data-testid="legend"
      :class="[{ 'd-flex justify-content-center mt-4': !legendClass.length}, legendClass]">
      <ul
        v-if="legend.length"
        class="list-unstyled">
        <li
          v-for="item in legend"
          :key="item.label">
          <span class="d-flex align-items-center">
            <div
              class="rounded-pill mr-3"
              :style="{ height: '10px', width: '24px', 'background-color': item.color }" />
            <template v-if="showLegendCount">
              {{ item.label }} ({{ item.value }})
            </template>
            <template v-else>
              {{ item.label }}
            </template>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import styles from '@/scss/main.scss';

/*
 * @description Pie Chart Component used to show data in a pie chart with percentages according the value of each item,
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
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    height: {
      type: Number,
      default: 250,
    },
    hideTooltip: {
      type: Boolean,
      deafault: false,
    },
    id: {
      type: String,
      default: 'PieChart',
    },
    legendClass: {
      type: String,
      default: '',
    },
    noDataLabel: {
      type: String,
      default: '',
    },
    radius: {
      type: Number,
      default: 110,
    },
    showLegendCount: {
      type: Boolean,
      default: false,
    },
    strokeWidth: {
      type: Number,
      default: 3,
    },
    width: {
      type: Number,
      default: 250,
    },
  },
  data() {
    return {
      legend: [],
      tooltip: null,
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      let chartData = {};
      let colors = [];
      this.legend = [];

      if (this.data.length) {
        let total = 0;
        this.data.forEach((category, index) => {
          total += category.value;
          chartData[index] = category.value;
          colors.push(category.color);
          this.legend.push({
            label: category.label,
            color: category.color,
            value: category.value,
          });
        });
        if (total === 0) {
          chartData = {};
          colors = [];
          this.legend = [];
          chartData[0] = 1;
          colors.push(styles.whitesmoke);
          this.legend.push({
            label: this.noDataLabel,
            color: styles.whitesmoke,
            value: 1,
          });
        }
      }
      this.createChart(chartData, colors);
    },
    createChart(chartData, colors) {
      // set the dimensions and margins of the graph
      const margin = 0;

      // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
      const radius = Math.min(this.width, this.height) / 2 - margin;

      d3.select(`#${this.id}`)
        .selectAll('svg').remove();

      // append the svg object to the div called 'my_dataviz'
      const svg = d3
        .select(`#${this.id}`)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('class', 'mx-auto d-block')
        .append('g')
        .attr(
          'transform',
          `translate(${this.width / 2},${this.height / 2})`,
        );

      // Create dummy data
      const data = chartData;

      // set the color scale
      const color = d3
        .scaleOrdinal()
        .domain(Object.keys(data))
        .range(colors);

      // Compute the position of each group on the pie:
      const pie = d3.pie().value((d) => d[1]);

      const dataReady = pie(Object.entries(data));

      if (!this.hideTooltip) {
        this.tooltip = d3.select(`#${this.id}`)
          .append('div')
          .style('position', 'fixed')
          .style('visibility', 'hidden')
          .style('background-color', 'transparent')
          .style('border-width', '0px')
          .style('border-radius', '5px')
          .style('padding', '0 0 5px 0');
      }

      // path is the function used to generate the SVG path data for the pie slices
      const path = d3
        .arc()
        .innerRadius(this.radius) // This is the size of the donut hole
        .outerRadius(radius)
        .cornerRadius(10);

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      svg
        .selectAll('whatever')
        .data(dataReady)
        .enter()
        .append('path')
        .attr('class', `${this.id}-tooltip`)
        .attr('d', path)
        .attr('fill', (d) => color(d.data[0]))
        .attr('stroke', 'white')
        .style('stroke-width', `${this.strokeWidth}px`)
        .transition() // defines a transition
        .duration(1000) // controls the animation duration
        .attrTween('d', (d) => { // attrTween is used to interpolate attributes over the time
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d); // interpolate from { startAngle: 0, endAngle: 0 } to d
          return function interpolatePath(t) { return path(interpolate(t)); }; // returns the SVG path data according the interpolation over the time
        });

      if (!this.hideTooltip) {
        d3.selectAll(`.${this.id}-tooltip`)
          .on('mouseover', () => this.tooltip.style('visibility', 'visible'))
          .on('mouseout', () => this.tooltip.style('visibility', 'hidden'))
          .on('mousemove', this.mouseMove);
      }
    },
    mouseMove(event) {
      const { width, height } = this.tooltip.node().getBoundingClientRect();
      return this.tooltip
        .style('top', `${event.clientY - (height + 5)}px`)
        .style('left', `${event.clientX - (width / 2)}px`)
        .html(() => {
          const { index } = event.srcElement.__data__;
          return `<div role="tooltip"">
            <div class="arrow"></div>
            <div class="tooltip-inner">
              <div class="text-gray-400">${this.legend[index].label}</div>
              <div class="font-weight-bold">${this.legend[index].value}</div>
              </div>
              </div>
          `;
        });
    },
  },
  watch: {
    data() {
      this.loadData();
    },
  },
};
</script>

<style lang="scss" scoped>
:deep {
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
</style>
