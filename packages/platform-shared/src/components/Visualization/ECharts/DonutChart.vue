<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VChart
    :option="option"
    autoresize
    :style="{ height: typeof height === 'number' ? height + 'px' : height, width: typeof width === 'number' ? width + 'px' : width }"
  />
</template>

<script setup>
import {
  ref, computed, onMounted, onUnmounted, provide,
} from 'vue';
import VChart, { THEME_KEY } from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps({
  width: { type: [String, Number], default: 'auto' },
  height: { type: [String, Number], default: 200 },
  data: { type: Array, default: () => [] },
  colors: { type: Array, default: () => [] },
  legend: { type: Boolean, default: false },
});

// Provide theme
const provideTheme = ref(THEME_KEY);
provide(provideTheme, 'light');

// Responsive screen width (optional)
const screenWidth = ref(window.innerWidth);
const updateWidth = () => { screenWidth.value = window.innerWidth; };
onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));

/**
 * Format number with K/M suffix
 * @param value Number
 * @returns Formatted string
 */
const formatThousands = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value;
};

// Computed ECharts option
const option = computed(() => ({
  color: props.colors,
  textStyle: { fontFamily: 'Open Sans, sans-serif' },
  tooltip: {
    trigger: 'item',
    borderColor: 'transparent',
    backgroundColor: '#fff',
    padding: 12,
    formatter({
      color, name, value, percent,
    }) {
      return `
        <div style="font-family: 'Open Sans', sans-serif; font-size: 13px; color: #333;">
          <div style="display: flex; align-items: center;">
            <span style="display:inline-block; width:10px; height:10px; background:${color}; border-radius:50%; margin-right:8px;"></span>
            <span>${name}: ${value} (${percent}%)</span>
          </div>
        </div>
      `;
    },
  },
  legend: {
    show: props.legend,
    orient: 'vertical',
    align: 'auto',
    left: '50%',
    top: 'middle',
    itemGap: 12,
    padding: [12, 24, 12, 24],
    textStyle: {
      rich: {
        label: { fontSize: 13, color: '#5e6d82', fontFamily: 'Open Sans, sans-serif' },
        value: {
          fontSize: 13, fontWeight: 'bold', color: '#5e6d82', fontFamily: 'Open Sans, sans-serif',
        },
      },
    },
    formatter(name) {
      const match = props.data.find((item) => item.name === name);
      if (!match) return name;

      const maxPixelWidth = 140;
      const avgCharWidth = 7.5;
      const maxChars = Math.floor(maxPixelWidth / avgCharWidth);

      const truncatedName = name.length > maxChars ? `${name.slice(0, maxChars - 1)}…` : name;
      return `{label|${truncatedName}} {value|(${formatThousands(match.value)})}`;
    },
  },
  series: [
    {
      name: 'Journeys',
      type: 'pie',
      top: 0,
      left: 0,
      radius: ['54%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 25, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: false, fontSize: '16', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: props.data,
    },
  ],
}));
</script>
