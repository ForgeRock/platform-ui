<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VChart
    :option="option"
    autoresize
    :key="`bar-${showPrevious}`"
    class="bar-chart"
  />
</template>

<script setup>
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { useI18n } from 'vue-i18n';
import { CanvasRenderer } from 'echarts/renderers';

use([CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);
const { t } = useI18n();

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  rate: { type: Array, default: () => [] },
  totalAttempts: { type: Array, default: () => [] },
  color: { type: String, default: '#109cf1' },
  showPrevious: { type: Boolean, default: true },
  previousValues: { type: Array, default: () => [] },
});

const currentLabel = t('dashboard.analytics.charts.current');
const rollingLabel = t('dashboard.analytics.charts.rollingAverage');
const previousLabel = t('dashboard.analytics.charts.previousPeriod');
// Helper functions
/**
 * Calculate rolling average with a window size of 5
 * @param data Array of numbers
 * @returns Array of numbers representing the rolling average with a window size of 5
 */
const getRollingAverage = (data) => {
  const windowSize = 5;
  return data.map((_, i, arr) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = arr.slice(start, i + 1);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    return Math.round(avg);
  });
};

/**
 * Generate previous period data by randomizing current data
 * @param data Array of numbers
 * @returns Array of numbers representing previous period data
 */
const getPreviousPeriod = (data) => {
  const max = Math.max(...data);
  return Array.from({ length: data.length }, () => Math.floor(Math.random() * max));
};

/**
 * Darken a hex color by a given percentage
 * @param inputHex
 * @param percent
 */
const darkenHex = (inputHex, percent) => {
  let hex = inputHex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const darken = (channel) => Math.max(0, Math.min(255, Math.floor(channel - (2.55 * percent))));
  return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
};

/**
 * Convert hex color to rgba format
 * @param inputHex
 * @param alpha
 */
const hexToRgba = (inputHex, alpha = 1) => {
  let hex = inputHex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const rollingLineColor = computed(() => darkenHex(props.color, 15));

// Chart option
const option = computed(() => {
  const series = [
    {
      name: currentLabel,
      type: 'bar',
      barWidth: '60%',
      data: props.values,
      itemStyle: { color: props.color, borderRadius: [4, 4, 0, 0] },
    },
    {
      name: rollingLabel,
      type: 'line',
      data: getRollingAverage(props.values),
      symbol: 'none',
      lineStyle: { width: 2, color: rollingLineColor.value },
      itemStyle: { opacity: 0, color: rollingLineColor.value },
    },
  ];

  if (props.showPrevious) {
    series.push({
      name: previousLabel,
      type: 'line',
      data: props.previousValues.length ? props.previousValues : getPreviousPeriod(props.values),
      symbol: 'none',
      lineStyle: { type: 'dashed', width: 1, color: props.color },
      itemStyle: { opacity: 0, color: hexToRgba(props.color, 0.5) },
    });
  }

  return {
    textStyle: { fontFamily: 'Open Sans, sans-serif' },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const idx = params[0].dataIndex;
        const label = props.labels[idx];
        const rate = props.rate?.[idx];
        const total = props.totalAttempts?.[idx];
        const rateText = rate && Number(rate) > 0 ? ` (${Number(rate).toFixed(2)}%)` : '';

        // Header (date)
        let html = `<div style="text-align:left;"><strong>${label}</strong><br/>`;

        // Helper for aligned rows
        const makeRow = (marker, name, value, suffix = '') => `
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            line-height:1.6;
            margin-top:2px;
          ">
            <div style="display:flex; align-items:center; gap:6px; min-width:110px;">
              ${marker} <span>${name}</span>
            </div>
            <div style="font-weight:500; margin-left:10px;">${value ?? 0}${suffix}</div>
          </div>
        `;

        // Current (with rate)
        const current = params.find((p) => p.seriesName === currentLabel);
        if (current) {
          html += makeRow(current.marker, current.seriesName, current.value, rateText);
        }

        // Rolling Average
        const rolling = params.find((p) => p.seriesName === rollingLabel);
        if (rolling) {
          html += makeRow(rolling.marker, rolling.seriesName, rolling.value);
        }

        // Previous Period (only if compare is on)
        if (props.showPrevious) {
          const previous = params.find((p) => p.seriesName === previousLabel);
          if (previous) {
            html += makeRow(previous.marker, previous.seriesName, previous.value);
          }
        }

        // Total Attempts
        html += `
          <div style="margin-top:6px; font-weight:600;">
            Total Attempts ${total ?? 0}
          </div>
        </div>`;

        return html;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '2%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.labels,
      axisLine: {
        lineStyle: {
          color: '#e7eef4',
        },
      },
      axisLabel: {
        fontSize: 13,
        color: '#5e6d82',
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e7eef4',
        },
      },
      axisLabel: {
        fontSize: 13,
        color: '#5e6d82',
      },
    },
    series,
    animationDuration: 500,
    animationEasing: 'cubicOut',
  };
});
</script>

<style scoped>
.bar-chart {
  height: 300px;
  width: 100%;
}
</style>
