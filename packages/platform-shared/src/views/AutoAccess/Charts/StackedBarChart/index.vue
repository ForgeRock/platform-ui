<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="stacked-bar-chart">
    <div class="d-flex flex-row justify-content-center">
      <div
        v-for="color in colors"
        :key="color.key"
        class="d-flex flex-row align-items-center risk-score-value mx-2"
      >
        <div
          class="risk-score-indicator mr-2"
          :style="{background: color.color}" />
        <div class="small">
          {{ color.label }}
        </div>
      </div>
    </div>
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="xMidYMid meet">
      <g
        class="stacked-bar-chart-axis y-axis"
        ref="axis_y" />
      <g :style="`transform: translate(${yAxisWidth}px,0)`">
        <g ref="bars" />
        <g
          class="stacked-bar-chart-axis x-axis"
          ref="axis_x" />
        <g ref="hover_groups" />
        <!-- <g ref="tooltip"
                    class="stacked-bar-chart-tooltip"
                    >
                    <rect rx="5" ry="5">
                    </rect>
                    <g class="stacked-bar-chart-tooltip-content">
                        <text class="stacked-bar-chart-tooltip-title">
                        </text>
                        <text class="stacked-bar-chart-tooltip-value">
                        </text>
                        <text class="stacked-bar-chart-tooltip-change">
                        </text>
                        <g class="stacked-bar-chart-tooltip-prev-label" style="transform: translate(1.5px, 24px)">
                            <circle style="transform: translate(0, -5px)" class="stacked-bar-chart-prev" r="3.5"></circle>
                            <text class="stacked-bar-chart-tooltip-prev-date" style="transform: translate(8px, 0)">
                            </text>
                            <text class="stacked-bar-chart-tooltip-prev-value">
                            </text>
                        </g>
                    </g>
                </g> -->
      </g>
    </svg>
  </div>
</template>
<script>
import * as d3 from 'd3';
import dayjs from 'dayjs';
import formatNumber from '../../../../utils/formatNumber';

export default {
  name: 'LineChart',
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
    viewBox: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      padding: 6,
      xAxisHeight: 30,
      yAxisWidth: Math.min(this.viewBox[0] * 0.08, 40),
      width: this.viewBox[0],
      height: this.viewBox[1],
      interval: 'day',
      colors: [
        {
          color: 'var(--success)',
          key: 'success',
          label: 'Success',
        },
        {
          color: 'var(--danger)',
          key: 'failure',
          label: 'Failure',
        },
      ],
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.drawXAxis();
        this.drawYAxis();
        this.drawChart();
      },
    },
  },
  methods: {
    drawChart() {
      const {
        chartData, drawBars, scale, xAxisHeight,
      } = this;

      d3.select(this.$refs.bars)
        .style('transform', `scaleY(-1) translate(0, ${xAxisHeight}px)`)
        .style('transform-origin', 'center center')
        .selectAll('.bar')
        .data(chartData)
        .join(
          (enter) => {
            const barwidth = Math.min(20, scale.x.bandwidth());
            const g = enter.append('g')
              .attr('class', 'bar')
              .style('transform', (d) => `translate(${scale.x(d.timestamp)}px, 0)`);

            g.append('rect')
              .attr('data-type', 'success')
              .attr('x', scale.x.bandwidth() / 2)
              .attr('height', 0)
              .attr('width', barwidth)
              .style('fill', scale.color('success'));

            g.append('rect')
              .attr('data-type', 'failure')
              .attr('x', scale.x.bandwidth() / 2)
              .attr('height', 0)
              .attr('width', barwidth)
              .style('fill', scale.color('failure'));

            setTimeout(() => drawBars(enter, false), 300);
          },
          (update) => {
            drawBars(update);
          },
          (exit) => {
            exit.remove();
            drawBars(d3.select(this.$refs.bars));
          },
        );
    },
    drawBars(selection) {
      const { scale } = this;
      const barwidth = Math.min(20, scale.x.bandwidth());

      selection.selectAll('.bar')
        .transition()
        .duration(300)
        .style('transform', (d) => `translate(${scale.x(d.timestamp)}px, 0)`)
        .each((d) => {
          d3.select(this)
            .select("rect[data-type='success']")
            .transition()
            .duration(300)
            .attr('height', scale.y(d.success))
            .style('fill', scale.color('success'));

          d3.select(this)
            .select("rect[data-type='failure']")
            .transition()
            .duration(300)
            .style('transform', `translate(0,${scale.y(d.success)}px`)
            .attr('height', scale.y(d.failure))
            .style('fill', scale.color('failure'));

          d3.select(this)
            .selectAll('rect')
            .attr('x', (scale.x.bandwidth() - barwidth) / 2)
            .attr('width', barwidth);
        });
    },
    drawHoverState() {
      // const { width, padding, yAxisWidth, chartData, previousData, scale, updateTooltip } = this;
      // const groupWidth = (width - (padding*2) - yAxisWidth)/(Math.max(1, chartData.length - 1));

      // const groups = selection.style('transform', (d,i) => `translate(${scale.x(i) - groupWidth/2}px,0)`)
      //     .on('mouseenter', function (e, d) {
      //         const totalLength = d3.select(this).select('path').node().getTotalLength()
      //         const i = groups.nodes().indexOf(this);
      //         d3.select(this)
      //             .select('path')
      //             .style('opacity', 1)
      //             .attr("stroke-dasharray", totalLength + " " + totalLength)
      //             .attr("stroke-dashoffset", totalLength)
      //             .transition()
      //                 .duration(500)
      //                 .attr("stroke-dashoffset", 0);

      //         d3.select(this)
      //             .selectAll('circle')
      //             .style('opacity', 1)
      //             .transition()
      //             .duration(300)
      //             .attr('r', 5)

      //         updateTooltip(d, i)
      //     })
      //     .on('mouseleave', function (e, d) {
      //         d3.select(this)
      //             .selectAll('circle, path')
      //             .style('opacity', 0)
      //             .attr('r', 0)
      //     });
      // groups.select('rect')
      //     .attr('width', groupWidth)

      // groups.select('.line-chart-hover-line')
      //     .style('opacity', 0)
      //     .attr('d', (d,i) =>
      //         `M${groupWidth/2},${scale.y(0)}L${groupWidth/2},${scale.y(d3.max([chartData[i].value, previousData[i].value]))}`
      //     )

      // groups.select('circle.line-chart-value')
      //     .style('opacity', 0)
      //     .attr('r', 0)
      //     .attr('cy', d => scale.y(d.value))
      //     .attr('cx', groupWidth/2)

      // groups.select('circle.line-chart-prev')
      //     .style('opacity', 0)
      //     .attr('r', 0)
      //     .attr('cy', (d,i) => scale.y(previousData[i].value))
      //     .attr('cx', groupWidth/2)
    },
    drawXAxis() {
      const { chartData, scale, interval } = this;
      const $axis = d3.select(this.$refs.axis_x);
      const xAxis = d3.axisBottom(scale.x)
        .ticks(Math.min(10, chartData.length))
        .tickFormat((d) => {
          let label = '';
          if (interval === 'hour') {
            label = dayjs(d).format('ha');
          } else if (interval === 'month') {
            if (dayjs(d).month() === 0) {
              label = dayjs(d).format('MMM YY');
            } else {
              label = dayjs(d).format('MMM');
            }
          } else if (chartData.length > 5) {
            label = dayjs(d).format('dd');

            if (label !== 'Th') {
              label = label.substring(0, 1);
            }
          } else {
            label = dayjs(d).format('ddd');
          }

          return label;
        });
      $axis.style('transform', `translate(0, ${this.height - this.xAxisHeight - this.padding + 10}px)`)
        .transition()
        .duration(300)
        .call(xAxis)
        .select('path')
        .style('transform', 'translate(0,-5px)')
        .attr('d', () => `M${this.range.x[0]},0L${this.range.x[1]},0`);
    },
    drawYAxis() {
      const {
        padding, scale, yAxisWidth, range,
      } = this;
      const $axis = d3.select(this.$refs.axis_y);
      const yAxis = d3.axisLeft(scale.yAxis)
        .tickValues(scale.yAxis.ticks(5)
          .filter((tick) => Number.isInteger(tick)))
        .tickFormat((d) => (d >= 1000 ? `${formatNumber(d / 1000, 'en-US')}k` : d));
      $axis.style('transform', `translate(${padding + yAxisWidth}px, ${padding - 1}px)`)
        .transition()
        .duration(300)
        .call(yAxis)
        .call((g) => {
          g.selectAll('.tick line')
            .attr('x1', 0)
            .attr('x2', range.x[1] - padding);
        });
    },
    updateTooltip() {
      // const tooltip = d3.select(this.$refs.tooltip);
      // const prev = this.previousData[i];
      // const { scale, interval } = this;
      // const width = 240;

      // tooltip.select(".line-chart-tooltip-title")
      //     .text(interval === "month" ?
      //         dayjs(d.timestamp).format("MMMM YYYY")
      //         :
      //         dayjs(d.timestamp).format("dddd, MMM D" + (interval === "hour" ? ", ha" : ""))
      //     )
      // const change = tooltip.select(".line-chart-tooltip-change")
      //     .text(() => {
      //         const val = Math.round(((d.value - prev.value)/prev.value) * 100);
      //         if (!isFinite(val)) {
      //             return ''
      //         } else if (isNaN(val)) {
      //             return '0%';
      //         }
      //         return (val <= 0 ? "" : "+") + val + "%"
      //     })
      //     .style('transform', `translate(${width}px, 0)`)
      //     .style('fill', this.tooltipPercentChangeColor)
      //     .style('text-anchor', 'end')
      // tooltip.select(".line-chart-tooltip-value")
      //     .text(new Intl.NumberFormat().format(parseFloat(d.value, 10).toFixed(1)))
      //     .style('transform', `translate(${width - change.node().getBBox().width - 6}px, 0)`)
      //     .style('text-anchor', 'end')

      // tooltip.select(".line-chart-tooltip-prev-value")
      //     .text(new Intl.NumberFormat().format(parseFloat(prev.value, 10).toFixed(1)))
      //     .style('text-anchor', 'end')
      //     .style('transform', `translate(${width}px, 0)`)

      // tooltip.select(".line-chart-tooltip-prev-date")
      //     .text(interval === "month" ?
      //         dayjs(prev.timestamp).format("MMMM YYYY")
      //         :
      //         dayjs(prev.timestamp).format("dddd, MMM D" + (interval === "hour" ? ", ha" : ""))
      //     )

      // const bbox = tooltip.select(".line-chart-tooltip-content").node().getBBox();
      // tooltip.select('rect')
      //     .attr('width', bbox.width + 20)
      //     .attr('height', bbox.height + 14)
      //     .style('transform', `translate(-10px, -${bbox.height/2}px)`)

      // let transform = {
      //     x: scale.x(i) - bbox.width/2,
      //     y: scale.y(Math.max(prev.value, d.value)) - bbox.height - 20,
      // }
      // if (transform.x < 0) {
      //     transform.x = this.range.x[0];
      // } else if (transform.x + bbox.width > this.width){
      //     transform.x = this.range.x[1] - bbox.width;
      // }
      // tooltip.transition()
      //     .duration(200)
      //     .style('transform', `translate(${transform.x}px,${transform.y}px)`)
    },
    maxValue() {
      return Math.max(0.5, d3.max(this.chartData, (d) => d.success) + d3.max(this.chartData, (d) => d.failure));
    },
  },
  computed: {
    range() {
      return {
        x: [this.padding, this.width - this.yAxisWidth - this.padding],
        y: [0, this.height - this.xAxisHeight - this.padding],
      };
    },
    scale() {
      return {
        x: d3.scaleBand()
          .range(this.range.x)
          .domain(this.chartData.map((d) => d.timestamp)),
        y: d3.scaleLinear()
          .range(this.range.y)
          .domain([
            0,
            this.maxValue(),
          ]),
        yAxis: d3.scaleLinear()
          .range(this.range.y)
          .domain([
            this.maxValue(),
            0,
          ]),
        color: d3.scaleOrdinal()
          .domain(this.colors.map((c) => c.key))
          .range(this.colors.map((c) => c.color))
          .unknown('#ccc'),
      };
    },
  },
};
</script>
<style lang="scss">
  .stacked-bar-chart {
    .bar {
      rect {
        stroke: $white;
        stroke-width: 2;
      }
    }

    text {
      font-size: 0.75rem;
      font-family: $fr-typeface;
    }

    &-axis {
      path,
      line {
        stroke: $gray-200;
      }

      &.x-axis {
        .tick {
          line {
            display: none;
          }
        }
      }

      &.y-axis {
        .domain {
          display: none;
        }
      }
    }
  }
</style>
