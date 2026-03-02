<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <v-chart
    :option="chartOption"
    :style="{ width: '100%', height: '100%' }"
    autoresize
  />
</template>

<script setup>
/* eslint-disable import/no-unresolved, import/extensions */
// ECharts uses package.json `exports` subpath maps (e.g. 'echarts/core', 'echarts/charts').
// eslint-import-resolver-node does not support the `exports` field, so these imports
// are incorrectly flagged as unresolved. Suppression can be removed once the ESLint
// import resolver is upgraded to one that supports package.json export maps
// (e.g. eslint-import-resolver-exports or eslint-import-resolver-node v0.12+).
import { computed } from 'vue';
import { CanvasRenderer } from 'echarts/renderers';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
]);

const props = defineProps({
  chartData: {
    default: () => [],
    type: Array,
  },
  axisLabelInterval: {
    type: Number,
    default: 0,
  },
  yAxisSplitNumber: {
    type: Number,
    default: 5,
  },
  gridPadding: {
    type: Object,
    default: () => ({
      left: '10%',
      right: '10%',
      top: '3%',
      bottom: '5%',
    }),
  },
  name: {
    default: '',
    type: String,
  },
});

const chartOption = computed(() => {
  if (!props.chartData || props.chartData.length === 0) {
    return {
      title: { show: false },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [],
    };
  }
  const mainDataObj = props.chartData.find((d) => d.active) || {};
  const compareDataObj = props.chartData.find((d) => !d.active) || {};
  const includePrevious = compareDataObj.showPrevious;

  return {
    textStyle: {
      fontFamily: 'Open Sans, sans-serif',
    },
    tooltip: {
      trigger: 'axis',
      formatter(params) {
        const date = params[0].axisValue;
        const current = (params.find((p) => p.seriesName === 'Current') || {}).data || 0;
        const previous = (params.find((p) => p.seriesName === 'Previous') || {}).data || 0;

        let percentChange = '';
        if (previous > 0) {
          const change = ((current - previous) / previous) * 100;
          const rounded = Math.round(change);
          const sign = change > 0 ? '+' : '';
          const color = change > 0 ? '#2ED47A' : '#F7685B';
          percentChange = `<div style="color:${color}; font-weight:600; font-size:13px;">${sign}${rounded}%</div>`;
        }

        return `
          <div style="font-family: 'Open Sans', sans-serif; font-size: 13px; color: #333;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 600;">${date}</span>
              ${percentChange}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
              <div style="display: flex; align-items: center;">
                <span style="display:inline-block; width:10px; height:10px; background:#109CF1; border-radius:50%; margin-right:8px;"></span>
                <span>Current</span>
              </div>
              <div style="margin-left: 16px; font-weight:600;">${current}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <div style="display: flex; align-items: center;">
                <span style="display:inline-block; width:10px; height:10px; background:#B3D4FC; border-radius:50%; margin-right:8px;"></span>
                <span>Previous</span>
              </div>
              <div style="margin-left: 16px; font-weight:600;">${previous}</div>
            </div>
          </div>`;
      },
    },
    grid: {
      ...props.gridPadding,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: mainDataObj.labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#5e6d82',
        interval: props.axisLabelInterval,
      },
    },
    yAxis: {
      type: 'value',
      splitNumber: props.yAxisSplitNumber,
      splitLine: {
        lineStyle: {
          color: '#eee',
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#5e6d82',
      },
    },
    series: [
      {
        name: mainDataObj.seriesName,
        type: 'line',
        smooth: false,
        data: mainDataObj.mainSeries || [],
        lineStyle: {
          color: '#109cf1',
          width: 3,
        },
        itemStyle: {
          opacity: 0,
          color: '#109cf1',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 156, 241, 0.3)' },
              { offset: 1, color: 'rgba(16, 156, 241, 0)' },
            ],
          },
        },
      },
      ...(includePrevious
        ? [
          {
            name: compareDataObj.seriesName,
            type: 'line',
            smooth: false,
            data: compareDataObj.compareSeries,
            lineStyle: {
              color: '#109cf1',
              width: 1,
              type: 'dashed',
            },
            itemStyle: {
              opacity: 0,
              color: 'rgba(16, 156, 241, 0.5)',
            },
          },
        ]
        : []),
    ],
  };
});
</script>
