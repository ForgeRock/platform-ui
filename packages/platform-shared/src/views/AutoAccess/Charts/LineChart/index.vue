<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <svg
      class="line-chart"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient
          :id="gradientNames[0]"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%">
          <stop
            offset="0%"
            :style="{'stop-color': colors[0], 'stop-opacity': 0.2}" />
          <stop
            offset="100%"
            style="stop-color: white; stop-opacity: 0;" />
        </linearGradient>
      </defs>
      <g
        class="line-chart-axis y-axis"
        ref="axis_y" />
      <g :style="`transform: translate(${yAxisWidth}px,0)`">
        <g
          class="line-chart-axis x-axis"
          ref="axis_x" />
        <path
          ref="line_bg"
          :fill="`url(#${gradientNames[0]})`"
        />
        <path
          ref="line_main"
          class="line-chart-line"
          :style="{stroke: colors[0]}"
        />
        <path
          ref="line_prev"
          class="line-chart-dotted-line"
        />
        <g ref="hover_groups" />
        <g
          ref="tooltip"
          class="line-chart-tooltip"
        >
          <rect
            rx="5"
            ry="5" />
          <g class="line-chart-tooltip-content">
            <text class="line-chart-tooltip-title" />
            <text class="line-chart-tooltip-value" />
            <text class="line-chart-tooltip-change" />
            <g
              class="line-chart-tooltip-prev-label"
              style="transform: translate(1.5px, 24px);">
              <circle
                style="transform: translate(0, -5px);"
                class="line-chart-prev"
                r="3.5" />
              <text
                class="line-chart-tooltip-prev-date"
                style="transform: translate(8px, 0);" />
              <text class="line-chart-tooltip-prev-value" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
import * as d3 from 'd3';
import { interpolatePath } from 'd3-interpolate-path';
import dayjs from 'dayjs';
import formatNumber from '../../../../utils/formatNumber';

export default {
  name: 'LineChart',
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
    previousData: {
      type: Array,
      default: () => [],
    },
    colors: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
      validator(value) {
        return value === 'normal' || value === 'risky' || value === 'risk-score';
      },
    },
    interval: {
      type: String,
      default: '',
    },
    viewBox: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      padding: 6,
      xAxisHeight: 30,
      yAxisWidth: Math.min(this.viewBox[0] * 0.08, 40),
      width: this.viewBox[0],
      height: this.viewBox[1],
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
  mounted() {
    this.line(this.$refs.line_bg, this.chartData, true);

    this.line(this.$refs.line_main, this.chartData);

    this.line(this.$refs.line_prev, this.previousData);

    d3.select(this.$refs.tooltip)
      .style('opacity', 0);
  },
  methods: {
    maxValue() {
      if (this.loading) {
        return 0;
      }
      return Math.max(
        Math.max(
          d3.max(this.previousData, (d) => d.value),
          d3.max(this.chartData, (d) => d.value),
        ),
        0.1,
      );
    },
    drawChart() {
      this.line(this.$refs.line_bg, this.chartData, true);

      this.line(this.$refs.line_main, this.chartData);

      this.line(this.$refs.line_prev, this.previousData);

      const color = this.colors[0];

      d3.select(this.$refs.hover_groups)
        .on('mouseleave', () => {
          d3.select(this.$refs.tooltip)
            .style('opacity', 0);
        })
        .on('mouseenter', () => {
          d3.select(this.$refs.tooltip)
            .style('opacity', 1);
        });

      d3.select(this.$refs.hover_groups)
        .selectAll('g')
        .data(this.chartData)
        .join(
          (enter) => {
            const groups = enter.append('g');

            groups.append('rect')
              .style('fill', 'rgba(0,0,0,0)')
              .style('transform', () => `translate(0,${this.padding}px)`)
              .attr('height', this.height - (this.padding * 2) - this.xAxisHeight);

            groups.append('path')
              .attr('class', 'line-chart-hover-line')
              .style('opacity', 0);

            groups.append('circle')
              .attr('r', 5)
              .attr('class', 'line-chart-value')
              .style('fill', color);

            groups.append('circle')
              .attr('r', 5)
              .attr('class', 'line-chart-prev');

            this.drawHoverState(enter.selectAll('g'));
          },
          (update) => {
            this.drawHoverState(update);
          },
          (exit) => {
            exit.remove();
          },
        );
    },
    drawHoverState(selection) {
      const {
        width, padding, yAxisWidth, chartData, previousData, scale, updateTooltip,
      } = this;
      const groupWidth = (width - (padding * 2) - yAxisWidth) / (Math.max(1, chartData.length - 1));

      const groups = selection.style('transform', (_d, i) => `translate(${scale.x(i) - groupWidth / 2}px,0)`)
        .on('mouseenter', (_e, d) => {
          const totalLength = d3.select(this).select('path').node().getTotalLength();
          const i = groups.nodes().indexOf(this);
          d3.select(this)
            .select('path')
            .style('opacity', 1)
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(500)
            .attr('stroke-dashoffset', 0);

          d3.select(this)
            .selectAll('circle')
            .style('opacity', 1)
            .transition()
            .duration(300)
            .attr('r', 5);

          updateTooltip(d, i);
        })
        .on('mouseleave', () => {
          d3.select(this)
            .selectAll('circle, path')
            .style('opacity', 0)
            .attr('r', 0);
        });
      groups.select('rect')
        .attr('width', groupWidth);

      groups.select('.line-chart-hover-line')
        .style('opacity', 0)
        .attr('d', (_d, i) => `M${groupWidth / 2},${scale.y(0)}L${groupWidth / 2},${scale.y(d3.max([chartData[i].value, previousData[i].value]))}`);

      groups.select('circle.line-chart-value')
        .style('opacity', 0)
        .attr('r', 0)
        .attr('cy', (d) => scale.y(d.value))
        .attr('cx', groupWidth / 2);

      groups.select('circle.line-chart-prev')
        .style('opacity', 0)
        .attr('r', 0)
        .attr('cy', (_d, i) => scale.y(previousData[i].value))
        .attr('cx', groupWidth / 2);
    },
    drawXAxis() {
      const { interval, chartData, scale } = this;
      const $axis = d3.select(this.$refs.axis_x);
      const xAxis = d3.axisBottom(scale.x)
        .ticks(interval === 'hour' ? 6 : Math.min(10, chartData.length))
        .tickFormat((d) => {
          let label = '';
          if (!Number.isInteger(d)) {
            return label;
          }
          if (interval === 'hour') {
            label = dayjs(chartData[d].timestamp).format('ha');
          } else if (interval === 'month') {
            if (dayjs(chartData[d].timestamp).month() === 0) {
              label = dayjs(chartData[d].timestamp).format('MMM YY');
            } else {
              label = dayjs(chartData[d].timestamp).format('MMM');
            }
          } else if (chartData.length > 5) {
            label = dayjs(chartData[d].timestamp).format('dd');

            if (label !== 'Th') {
              label = label.substring(0, 1);
            }
          } else {
            label = dayjs(chartData[d].timestamp).format('ddd');
          }

          return label;
        });
      $axis.style('transform', `translate(0, ${this.height - this.xAxisHeight - this.padding + 5}px)`)
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
      const yAxis = d3.axisLeft(scale.y)
        .tickValues(scale.y.ticks(5)
          .filter((tick) => Number.isInteger(tick)))
        .tickFormat((d) => (d >= 1000 ? `${formatNumber(d / 1000, 'en-US')}k` : d));
      $axis.style('transform', `translate(${padding + yAxisWidth}px, 0)`)
        .transition()
        .duration(300)
        .call(yAxis)
        .call((g) => {
          g.selectAll('.tick line')
            .attr('x1', 0)
            .attr('x2', range.x[1] - padding);
        });
    },
    updateTooltip(d, i) {
      const tooltip = d3.select(this.$refs.tooltip);
      const prev = this.previousData[i];
      const { scale, interval, type } = this;
      const width = 240;

      tooltip.select('.line-chart-tooltip-title')
        .text(interval === 'month'
          ? dayjs(d.timestamp).format('MMMM YYYY')
          : dayjs(d.timestamp).format(`dddd, MMM D${interval === 'hour' ? ', ha' : ''}`));
      const changeVal = Math.round(((d.value - prev.value) / prev.value) * 100);
      const change = tooltip.select('.line-chart-tooltip-change')
        .text(() => {
          if (!Number.isFinite(changeVal)) {
            return '';
          } if (Number.isNaN(changeVal)) {
            return '0%';
          }
          return `${(changeVal <= 0 ? '' : '+') + changeVal}%`;
        })
        .style('transform', `translate(${width}px, 0)`)
        .style('fill', () => {
          if (changeVal <= 0) {
            return type === 'risky' ? 'var(--success)' : 'var(--danger)';
          }
          return type === 'risky' ? 'var(--danger)' : 'var(--success)';
        })
        .style('text-anchor', 'end');
      tooltip.select('.line-chart-tooltip-value')
        .text(formatNumber(parseFloat(d.value, 10).toFixed(1), 'en-US'))
        .style('transform', `translate(${width - change.node().getBBox().width - 6}px, 0)`)
        .style('text-anchor', 'end');

      tooltip.select('.line-chart-tooltip-prev-value')
        .text(formatNumber(parseFloat(prev.value, 10).toFixed(1), 'en-US'))
        .style('text-anchor', 'end')
        .style('transform', `translate(${width}px, 0)`);

      tooltip.select('.line-chart-tooltip-prev-date')
        .text(interval === 'month'
          ? dayjs(prev.timestamp).format('MMMM YYYY')
          : dayjs(prev.timestamp).format(`dddd, MMM D${interval === 'hour' ? ', ha' : ''}`));

      const bbox = tooltip.select('.line-chart-tooltip-content').node().getBBox();
      tooltip.select('rect')
        .attr('width', bbox.width + 20)
        .attr('height', bbox.height + 14)
        .style('transform', `translate(-10px, -${bbox.height / 2}px)`);

      const transform = {
        x: scale.x(i) - bbox.width / 2,
        y: scale.y(Math.max(prev.value, d.value)) - bbox.height - 20,
      };
      if (transform.x < 0) {
        const [x] = this.range.x;
        transform.x = x;
      } else if (transform.x + bbox.width > this.width) {
        transform.x = this.range.x[1] - bbox.width;
      }
      tooltip.transition()
        .duration(200)
        .style('transform', `translate(${transform.x}px,${transform.y}px)`);
    },
    line(ref, data, close) {
      let pathStr = '';

      if (data.length === 1) {
        pathStr = this.path([]);
      } else if (close) {
        pathStr = `${this.path(data)
        }L${this.range.x[1]},${this.range.y[1]}`
                    + `L${this.range.x[0]},${this.range.y[1]}z`;
      } else {
        pathStr = this.path(data);
      }

      if (!d3.select(ref).attr('d')) {
        d3.select(ref)
          .attr('d', pathStr);
      } else {
        d3.select(ref)
          .transition()
          .duration(500)
          .attrTween('d', () => {
            const previous = d3.select(this).attr('d');
            const current = pathStr;
            return interpolatePath(previous, current);
          });
      }
    },
  },
  computed: {
    range() {
      return {
        x: [this.padding, this.width - this.padding - this.yAxisWidth],
        y: [this.padding, this.height - this.padding - this.xAxisHeight],
      };
    },
    scale() {
      return {
        x: d3.scaleLinear()
          .range(this.range.x)
          .domain(d3.extent(this.chartData, (_d, i) => i)),
        y: d3.scaleLinear()
          .range(this.range.y)
          .domain([
            this.maxValue(),
            0,
          ]),
      };
    },
    path() {
      return d3.line()
        .x((_d, i) => this.scale.x(i))
        .y((d) => this.scale.y(d.value));
    },
    gradientNames() {
      return this.colors.map((d, i) => `gradient-${btoa(d)}-${i}`);
    },
  },
};
</script>
<style lang="scss">
  .line-chart {
    overflow: visible;

    path {
      stroke-linecap: round;
    }

    &-line {
      fill: rgba(255, 255, 255, 0);
      stroke-width: 2;
    }

    &-dotted-line {
      fill: rgba(255, 255, 255, 0);
      stroke: $gray-500;
      stroke-dasharray: 3 4;
    }

    &-hover-line {
      stroke: $gray-200;
    }

    &-axis {
      path,
      line {
        stroke: $gray-200;
      }

      .tick {
        text {
          font-size: 0.75rem;
          font-family: $fr-typeface;
        }
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

    circle {
      &.line-chart-prev {
        fill: $gray-500;
      }
    }

    &-tooltip {
      pointer-events: none;

      rect {
        fill: $black;
      }

      text {
        fill: $white;
      }

      &-title {
        opacity: 0.85;
      }

      &-title,
      &-value,
      &-change {
        font-size: 0.875rem;
      }

      &-value,
      &-change {
        font-weight: 600;
      }

      &-prev-label {
        font-size: 0.75rem;
      }
    }
  }
</style>
