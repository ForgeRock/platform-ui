<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <svg
    :id="`line-chart-${interval}`"
    class="line-chart"
    :viewBox="`0 0 ${width} ${height}`"
    ref="line-chart-svg"
    preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient
        id="primary-gradient"
        :class="`primary-gradient`"
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%">
        <stop
          :class="`gradient-stop1`"
          offset="0%"
        />
        <stop
          :class="`gradient-stop2`"
          offset="100%"
        />
      </linearGradient><linearGradient
        id="danger-gradient"
        :class="`danger-gradient`"
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%">
        <stop
          :class="`gradient-stop1`"
          offset="0%"
        />
        <stop
          :class="`gradient-stop2`"
          offset="100%"
        />
      </linearGradient>
    </defs>
    <g
      class="line-chart-axis y-axis"
      ref="axis_y" />
    <g :style="`transform: translate(${yAxisWidth}px,0)`">
      <g
        class="line-chart-axis x-axis"
        ref="axis_x" />
      <g
        class="line-groups"
        ref="line_groups" />
      <g
        class="hover-groups"
        ref="hover_groups" />
      <g
        ref="tooltip"
        class="line-chart-tooltip"
      >
        <rect
          rx="5"
          ry="5" />
        <g class="line-chart-tooltip-content">
          <g class="line-chart-tooltip-values" />
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3';
import dayjs from 'dayjs';

export default {
  name: 'LineChart',
  props: {
    chartData: {
      default: () => [],
      type: Array,
    },
    /*
      * Interval of chart data
      *
      * @type { 'hour' | day' | 'month' }
      */
    interval: {
      default: 'day',
      type: String,
    },
    viewBox: {
      default: () => [],
      type: Array,
    },
    name: {
      default: '',
      type: String,
    },
  },
  data() {
    return {
      /** @type {number} */
      height: this.viewBox[1],
      padding: 0,
      /** @type {number} */
      width: this.viewBox[0],
      xAxisHeight: 24,
      yAxisWidth: 24, // Math.min(this.viewBox[0] * 0.08, 40),
    };
  },
  methods: {
    /**
      * Kicks off drawing the chart
      */
    draw() {
      if (this.chartData.length > 0) {
        this.drawXAxis();
        this.drawYAxis();
        this.drawChart();
      }
    },
    /*
      * Get the max value between current and previous data arrays
      *
      * @returns {number}
      */
    maxValue() {
      const allMax = this.chartData.map((d) => d.data.reduce((previous, current) => {
        const max = Math.max(previous, current.value);
        return max;
      }, 0));
      return d3.max(allMax);
    },
    /*
      * Draw the chart line(s)
      */
    drawChart() {
      this.$refs.line_groups.innerHTML = '';
      this.chartData.forEach((d, i) => {
        if (d.visible) {
          this.line(i, d);
        }
      });

      this.$refs.hover_groups.innerHTML = '';

      const hoverData = [];
      for (let i = 0; i < this.intervalLength; i += 1) {
        hoverData.push(this.chartData.map((item) => ({
          ...item.data[i], title: item.title, color: item.color, stroke: item.stroke, visible: item.visible,
        })));
      }
      hoverData.forEach((item) => item.sort((a, b) => {
        if (a.timestamp > b.timestamp) {
          return -1;
        }
        if (b.timestamp > a.timestamp) {
          return 1;
        }
        return 0;
      }));

      const groupWidth = this.width / this.intervalLength;
      const { scale, updateTooltip, $refs } = this;
      d3.select(this.$refs.hover_groups)
        .selectAll('g')
        .data(hoverData)
        .join((enter) => {
          const groups = enter.append('g');

          // Hover area
          groups.append('rect')
            .attr('height', this.height - (this.padding * 2) - this.xAxisHeight)
            .style('fill', 'rgba(0,0,0,0.0)')
            .attr('width', groupWidth);
          groups.style('transform', (_d, i) => `translate(${this.scale.x(i) - (groupWidth / 2)}px,0)`);

          groups.on('mouseenter', function mouseenter(_e, d) {
            const visibleData = d.filter((item) => item.visible);
            const lineStartX = groupWidth / 2;
            d3.select(this).append('path')
              .attr('class', 'line-chart-hover-line')
              .style('opacity', 1)
              .attr('d', (yData) => {
                const data = yData.filter((item) => item.visible);
                const lineTo = `${lineStartX},${scale.y(d3.max(data, (maxData) => maxData.value))}`;
                return `M${lineStartX},${scale.y(0)}L${lineTo}`;
              });

            d3.select(this)
              .selectAll('circle')
              .data(visibleData)
              .enter()
              .append('circle')
              .attr('r', 6)
              .attr('class', (d2) => {
                const className = d2.stroke === 'solid' ? `line-chart-fill-${d2.color}` : 'line-chart-fill-white';
                return `${className} line-chart-value line-chart-color-${d2.color}`;
              })
              .attr('cy', (d2) => scale.y(d2.value))
              .attr('cx', groupWidth / 2)
              .exit()
              .remove();

            const i = groups.nodes().indexOf(this);
            updateTooltip(d, i);
          })
            .on('mouseleave', function mouseleave() {
              d3.select(this).selectAll('circle').remove();
              d3.select(this).selectAll('path').remove();
              const tooltip = d3.select($refs.tooltip);
              tooltip.style('opacity', 0);
              tooltip.select('.line-chart-tooltip-values').selectAll('text').remove();
              tooltip.select('.line-chart-tooltip-values').selectAll('circle').remove();
            });
        },
        (exit) => {
          exit.remove();
        });
    },
    /*
      * SVG logic that handles drawing and placement of tooltip
      */
    updateTooltip(d, i) {
      const width = 160;
      const tooltip = d3.select(this.$refs.tooltip);
      tooltip.style('opacity', 1);

      const activeData = d.find((data) => data.stroke === 'solid');
      const compareData = d.find((data) => data.stroke === 'dashed');
      const pctChange = compareData ? Math.round(((activeData.value - compareData.value) / compareData.value) * 100) : 0;
      const pctChangeTxtVal = Number.isInteger(pctChange) ? `${pctChange}%` : '';

      const content = tooltip.select('.line-chart-tooltip-content');
      const values = content.select('.line-chart-tooltip-values');

      let pos = 0;
      let valuePos = 0;
      let prevDataPoint;
      let title;
      let value;
      const d2 = d.filter((item) => item.visible);

      d2.forEach((dataPoint, j) => {
        if (dataPoint.visible) {
        // Group
          const valueGroup = values.append('g')
            .style('transform', `translate(0px, ${pos}px)`);

          if (dataPoint.visible) {
            // Title
            if (!prevDataPoint || prevDataPoint.timestamp !== dataPoint.timestamp) {
              title = valueGroup.append('text')
                .text(dayjs(dataPoint.timestamp).format(this.interval === 'daily' ? 'dddd, MMM D' : 'MMMM D, h:mm a'))
                .style('dominant-baseline', 'text-before-edge')
                .style('font-size', '0.825rem')
                .style('opacity', 0.7);

              valuePos = title.node().getBBox().height + 10;
            } else {
              valuePos = 0;
            }

            // Bullet
            const className = dataPoint.stroke === 'solid' ? `line-chart-fill-${dataPoint.color}` : 'line-chart-fill-black';
            valueGroup.append('circle')
              .attr('r', 3)
              .attr('class', `${className} line-chart-color-${dataPoint.color}`)
              .style('transform', `translate(5px, ${valuePos}px)`);

            // Value
            const valueText = dataPoint.title ? `${dataPoint.value} ${dataPoint.title}` : dataPoint.value;
            value = valueGroup.append('text')
              .text(valueText)
              .style('font-size', '0.9375rem')
              .style('font-weight', 600)
              .style('transform', `translate(15px, ${valuePos + 5}px)`);

            // Change percentage
            if (j === 0 && d2.length > 1) {
              const changePos = -value.node().getBBox().y + value.node().getBBox().width + 10;
              let changeColor = 'white';
              if (pctChangeTxtVal !== '') {
                changeColor = parseInt(pctChangeTxtVal, 10) < 0 ? 'red' : 'green';
              }
              valueGroup.append('text')
                .text(`${pctChangeTxtVal}`)
                .style('font-size', '0.825rem')
                .style('stroke', changeColor)
                .style('transform', `translate(${changePos}px, ${title.node().getBBox().height + 15}px)`);
            }
          }

          pos += valueGroup.node().getBBox().height + 10;
          prevDataPoint = dataPoint;
        }
      });

      const bbox = tooltip.select('.line-chart-tooltip-content').node().getBBox();
      tooltip.select('rect')
        .attr('width', width)
        .attr('height', bbox.height + 20)
        .style('transform', 'translate(-10px, -10px)');

      const { scale } = this;
      const visibleData = d.filter((item) => item.visible);
      const maxY = d3.max(visibleData, (maxData) => maxData.value);
      const transform = {
        x: scale.x(i) - bbox.width / 2,
        y: scale.y(maxY) - bbox.height - 20,
      };

      if (transform.x < 0) {
        [transform.x] = this.range.x;
      } else if (transform.x + bbox.width > this.width) {
        transform.x = this.range.x[1] - bbox.width;
      }
      tooltip
        .style('transform', `translate(${transform.x}px,${transform.y}px)`);
    },
    /*
      * Draw X Axis label
      */
    drawXAxis() {
      const {
        chartData, height, xAxisHeight, interval, range, scale,
      } = this;

      const $axis = d3.select(this.$refs.axis_x);

      const activeData = chartData.filter((item) => item.active);
      if (!activeData.length) {
        return;
      }
      const { data } = activeData[0];
      const overLimit = data.length > 7;
      const tickValues = overLimit ? [0, data.length - 1] : data.map((_d, i) => i);

      const xAxis = d3.axisBottom(scale.x)
        .tickValues(tickValues)
        .tickFormat((d) => {
          if (!Number.isInteger(d)) {
            return '';
          }
          const { timestamp } = data[d];
          switch (interval) {
            case 'hourly':
              return dayjs(timestamp).format('ha');
            case 'month':
              return dayjs(timestamp).format('MMM YY');
            case 'daily':
              return overLimit ? dayjs(timestamp).format('MMM D, YYYY') : dayjs(timestamp).format('MMM D');
            default:
              return dayjs(timestamp).format('MMM YY');
          }
        });

      $axis.style('transform', `translate(0, ${height - xAxisHeight}px)`)
        .transition()
        .duration(0)
        .call(xAxis)
        .select('path')
        .attr('d', () => `M${range.x[0]},0L${range.x[1]},0`);

      if (overLimit) {
        d3.selectAll(`#line-chart-${this.interval} .tick text`).attr('text-anchor', (i) => (i === 0 ? 'start' : 'end'));
      }
    },
    /*
      * Draw Y Axis label
      */
    drawYAxis() {
      const {
        padding, scale, yAxisWidth, range,
      } = this;
      const $axis = d3.select(this.$refs.axis_y);
      const containerHeight = this.$refs['line-chart-svg'].clientHeight;
      const ticks = containerHeight > 150 ? 5 : 2;
      const tickFormat = (d) => {
        if (d % 1 !== 0) {
          return null;
        }
        return (d >= 1000 ? `${new Intl.NumberFormat().format(d / 1000)}k` : d);
      };

      const yAxis = d3.axisLeft(scale.y.nice()).ticks(ticks)
        .tickFormat(tickFormat);
      $axis.style('transform', `translate(${padding + yAxisWidth}px, 0)`)
        .call(yAxis)
        .call((g) => {
          g.selectAll('.tick line')
            .attr('x1', 0)
            .attr('x2', range.x[1] - padding);
        });
    },
    /*
      * Draw a line on the chart
      *
      * @param {string} id
      * @param {object} line styles
      */
    line(id, {
      background, color, data, stroke,
    }) {
      if (!data || !data.length) {
        return;
      }

      const lineGroups = d3.select(this.$refs.line_groups);
      lineGroups.append('path')
        .attr(
          'class',
          `line-chart-path line-path-${this.name}-${id} line-chart-color-${color} line-chart-${stroke}-line`,
        );

      const lineRef = d3.select(`.line-path-${this.name}-${id}`);
      const pathStr = this.path(data);
      lineRef.attr('d', pathStr);

      if (background) {
        lineGroups.append('path')
          .attr(
            'class',
            `line-gradient-${this.name}-${id} line-chart-background-${color}`,
          ).attr('fill', `url(#${color}-gradient)`);

        const lineGradientRef = d3.select(`.line-gradient-${this.name}-${id}`);
        const gradientPathStr = `${this.path(data)}L${this.range.x[1]},${this.range.y[1]}L${this.range.x[0]},${this.range.y[1]}z`;
        lineGradientRef.attr('d', gradientPathStr);
      }
    },
  },
  computed: {
    /*
      * Draw a line on the chart
      *
      * @returns {number} number of values in a chart dataset
      */
    intervalLength() {
      if (this.chartData.length) {
        return this.chartData[0].data.length;
      }
      return 0;
    },
    /** @returns {{ x: number[], y: number[] }} */
    range() {
      return {
        x: [this.padding, this.width - this.padding - this.yAxisWidth],
        y: [this.padding, this.height - this.padding - this.xAxisHeight],
      };
    },
    /** @returns {{ x: (d: number) => number[], y: (d: number) => number[] }} */
    scale() {
      if (!this.chartData.length) {
        return () => null;
      }
      return {
        x: d3.scaleLinear()
          .range(this.range.x)
          .domain(d3.extent(this.chartData[0].data, (_d, i) => i)),
        y: d3.scaleLinear()
          .range(this.range.y)
          .domain([
            this.maxValue() || 100,
            0,
          ]),
      };
    },
    /** @returns {{ x: (d: number) => string, y: (d: number) => string )}} */
    path() {
      return d3.line()
        .x((_d, i) => this.scale.x(i))
        .y((d) => this.scale.y(d.value));
    },
  },
  mounted() {
    this.draw();
  },
  watch: {
    /**
      * Handles firing off draw method when chartData changes
      */
    chartData: {
      deep: true,
      handler() {
        this.draw();
      },
    },
    /**
      * Handles setting the svg's height and width states, and fires off another draw
      */
    viewBox(newVal) {
      [this.width, this.height] = newVal;
      this.draw();
    },
  },
};
</script>
<style lang="scss">
.line-chart {
  overflow: visible;

  .domain {
    stroke-width: 0;
  }

  .line-chart-axis {
    line {
      stroke: $gray-200;
    }
  }

  .line-chart-color-primary {
    stroke: $primary;
  }

  .line-chart-fill-primary {
    fill: $primary;
  }

  .line-chart-fill-danger {
    fill: $danger;
  }

  .line-chart-fill-white {
    fill: $white;
  }

  .line-chart-fill-black {
    fill: $black;
  }

  .line-chart-color-danger {
    stroke: $danger;
  }

  .line-chart-stop-color-primary {
    stop-color: $primary;
  }

  .line-chart-dashed-line {
    fill: none;
    stroke-width: 1;
    stroke-dasharray: 3 4;
  }

  .line-chart-solid-line {
    fill: none;
    stroke-width: 2.5;
  }

  .primary-gradient {
    .gradient-stop1 {
      stop-color: $primary;
      stop-opacity: 0.08;
    }

    .gradient-stop2 {
      stop-opacity: 0;
    }
  }

  .danger-gradient {
    .gradient-stop1 {
      stop-color: $danger;
      stop-opacity: 0.08;
    }

    .gradient-stop2 {
      stop-opacity: 0;
    }
  }

  path {
    stroke-linecap: round;
  }

  &-dotted-line {
    fill: none;
    stroke: $gray-500;
    stroke-dasharray: 3 4;
  }

  &-hover-line {
    stroke: $gray-300;
  }

  &-axis {
    path,
    line {
      /* stroke: $gray-200; */
      stroke: black;
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
