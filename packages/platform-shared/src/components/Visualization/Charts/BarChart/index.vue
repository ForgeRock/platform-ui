<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="position-relative h-100">
    <div
      :id="chartId"
      ref="chartContainer"
      class="h-100"
      @mousemove="getMousePosition"
    />

    <div
      class="tooltip-container"
      style="display: none; z-index: 100;"
      ref="tooltip">
      <slot
        name="tooltip"
        :tooltip-data="tooltipData"
      />
    </div>

    <!--y-axis Label -->
    <div
      class="journey-label-container"
      ref="journey-label-tooltip">
      <span>{{ journeyLabel }}</span>
    </div>

    <FrPagination
      v-if="chartData.length > 10"
      v-model="currentPage"
      :dataset-size="DatasetSize.SMALL"
      :per-page="10"
      :total-rows="chartData.length"
      @input="paginationChange"
    />
  </div>
</template>

<script>

import * as d3 from 'd3';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { DatasetSize } from '@forgerock/platform-shared/src/components/Pagination/types';
import AnalyticsMixin from '@forgerock/platform-shared/src/mixins/AnalyticsMixin';

export default {
  name: 'BarChart',
  components: {
    FrPagination,
  },
  data() {
    return {
      currentJourneyName: '',
      currentPage: 0,
      DatasetSize,
      displayData: [],
      mouseOffset: [],
      journeyLabel: '',
      tooltipData: {},
    };
  },
  props: {
    chartData: {
      default: () => [],
      type: Array,
    },
    chartId: {
      default: 'barChart',
      type: String,
    },
    domain: {
      default: 1,
      type: Number,
    },
    domainType: {
      default: 'pct',
      type: String,
    },
    showPercentage: {
      default: true,
      type: Boolean,
    },
    viewBox: {
      default: () => [],
      type: Array,
    },
  },
  mixins: [
    AnalyticsMixin,
  ],
  methods: {
    draw() {
      const margin = {
        top: 20, right: 0, bottom: 40, left: 100,
      };
      const width = this.viewBox[0];
      const height = this.viewBox[1];

      // Create the svg and add it to the dom via the chartContainer div
      const svg = d3.select(`#${this.chartId}`)
        .html('')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('id', `svg-${this.chartId}`)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // Add x-axis
      const x = d3.scaleLinear()
        .domain([0, this.domain])
        .range([0, width - margin.left - margin.right]);

      // Generate and fomat the x-axis based on the domainType
      const xAxisGenerator = d3.axisBottom(x);
      xAxisGenerator.ticks(20);
      xAxisGenerator.tickSize((height - margin.bottom) * -1);
      if (this.domainType === 'pct') {
        xAxisGenerator.tickFormat(d3.format('~%'));
      } else {
        xAxisGenerator.tickFormat(d3.format(''));
      }
      xAxisGenerator.tickPadding(10);

      // Position the x-axis
      const xAxis = svg.append('g').call(xAxisGenerator);
      xAxis.attr('transform', `translate(0, ${height - margin.bottom})`);
      xAxis.attr('class', 'xchart');
      xAxis.call((g) => g.selectAll('.tick line')
        .attr('class', 'xtick'));

      // y-axis
      const y = d3.scaleBand()
        .range([0, height - margin.bottom])
        .domain(this.displayData.map((d) => d.name))
        .padding(0.5);

      // Generate the y-axis
      const yAxisGenerator = d3.axisLeft(y);
      const yAxis = svg.append('g').call(yAxisGenerator);
      yAxis.attr('class', 'ychart');

      // Format and size the y-axis label
      yAxis.call((g) => g.selectAll('.tick text')
        .attr('y', '0')
        .attr('text-anchor', 'end')
        .attr('width', margin.left - 25)
        .attr('class', 'yDomainText'));

      // Hide the default d3 UI bits per the UX design
      yAxis.call((g) => g.selectAll('.tick line')
        .attr('class', 'd-none'));
      yAxis.select('.domain')
        .attr('class', 'd-none');

      // Adds the y-axis label hover tooltip
      d3.selectAll(`#${this.chartId} .ychart .tick`).call((yLabel) => {
        const bar = this;
        const tooltipRef = this.$refs['journey-label-tooltip'];
        yLabel.each(function setupLabels() {
          const text = d3.select(this);
          text.style('cursor', 'default');

          // Show the tooltip and add the label text
          text.on('mouseover', (_, d) => {
            bar.journeyLabel = d;
            tooltipRef.style.display = 'block';
          })
            // Have the popup follow the mouse cursor
            .on('mousemove', () => {
              const mouseX = bar.mouseOffset[0];
              const mouseY = bar.mouseOffset[1];
              tooltipRef.style.left = `${mouseX - (tooltipRef.offsetWidth / 2)}px`;
              tooltipRef.style.top = `${mouseY - 50}px`;
            })
            // Hide and reset the label text
            .on('mouseout', () => {
              bar.journeyLabel = '';
              tooltipRef.style.display = 'none';
            });
        });
      });

      // Truncate the text in the y-axis label to fit better in the UI
      d3.selectAll(`#${this.chartId} .yDomainText`).call(this.svgTextTruncate);

      // TODO: Make this better
      const barAmt = this.displayData[0]?.bars.length;

      const chartBody = svg.selectAll()
        .data(this.displayData)
        .enter()
        .append('g')
        .attr('class', (d) => `${d.name} bar-group`)
        .attr('transform', (d) => `translate(0,${y(d.name)})`);

      const groupBar = chartBody.append('g')
        .attr('class', 'group-bar');

      groupBar.selectAll()
        .data((d) => d.bars)
        .join((bars) => {
          const barline = bars.append('g')
            .attr('class', (d) => `${d.type}`)
            .style('transform', (_, i) => `translate(0,${(y.bandwidth() / barAmt) * i}px)`);

          barline.append('rect')
            .attr('x', x(0))
            .attr('width', (d) => x(d.value || 0) - x(0))
            .attr('height', y.bandwidth() / barAmt)
            .attr('class', (d) => `fill-${d.color}`);

          // Hidden "hit area" bar
          barline.append('rect')
            .attr('x', x(0))
            .attr('width', x(this.domain))
            .attr('height', y.bandwidth() / barAmt)
            .attr('class', 'fill-transparent')
            .on('mouseleave', () => {
              this.hideTooltip();
            })
            .on('mousemove', (_, d) => {
              this.tooltipData = d.tooltip;
              this.showTooltip(this.mouseOffset[0], this.mouseOffset[1]);
            });
        });
    },
    getMousePosition(event) {
      this.mouseOffset = [event.offsetX, event.offsetY];
    },
    showTooltip(x, y) {
      const tooltipRef = this.$refs.tooltip;
      tooltipRef.style.display = 'block';
      tooltipRef.style.top = `${y + 30}px`;
      tooltipRef.style.left = `${x - 100}px`;
    },
    hideTooltip() {
      const tooltipRef = this.$refs.tooltip;
      if (tooltipRef) {
        tooltipRef.style.display = 'none';
      }
    },
    paginationChange(page) {
      this.currentPage = page;
      this.displayData = this.chartData;
      if (this.chartData.length > 10) {
        const begin = (this.currentPage - 1) * 10;
        const end = begin + 10;
        this.displayData = this.chartData.slice(begin, end);
      }
      setTimeout(() => {
        this.draw();
      }, 200);
    },
  },
  watch: {
    chartData: {
      immediate: true,
      handler() {
        this.paginationChange(1);
      },
    },
    /**
      * Handles setting the svg's height and width states, and fires off another draw
      */
    viewBox(newVal) {
      [this.width, this.height] = newVal;
      setTimeout(() => {
        this.draw();
      }, 200);
    },
  },
};
</script>
<style lang="scss">
/** TODO: Clean this up */

svg text {
  color: $gray-500;
  font-size: 12px;
}

.tooltip-container {
  position: absolute;
  z-index: 1;
}

.journey-label-container {
  background: $black;
  border-radius: 4px;
  color: $white;
  display: none;
  padding: 10px;
  position: absolute;
  z-index: 100;
}

.xchart {
  .tick:not(:nth-child(5n+2)) {
    text {
      display: none;
    }
    line {
      stroke-dasharray: 2,2;
      display: none;
    }
  }

  .tick:nth-child(5n+2) {
    line {
      stroke-dasharray: 0;
    }
  }

  .tick:first-of-type {
    text {
      text-anchor: start;
    }
  }

  .tick:last-of-type {
    text {
      text-anchor: end;
    }
  }

  .xtick, .domain {
      color: $gray-200;
      /* color: $black; */
  }
}

.ychart {
  .tick {
    font-size: 12px;
  }
}

.fill-blue {
  fill: $blue;
}

.fill-cyan {
  fill: $cyan;
}

.fill-purple {
  fill: $purple;
}

.fill-red {
  fill: $red;
}

.fill-red {
  fill: $red;
}

.fill-transparent {
  fill-opacity: 0;
}
</style>
