<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard class="mb-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <p class="section-header mb-0">
        {{ $t('governance.audit.histogram.title') }}
      </p>
      <div>
        <BButton
          size="sm"
          variant="outline-secondary"
          class="mr-1"
          :aria-label="t('governance.audit.histogram.resetZoom')"
          :disabled="isLoading || !isZoomed"
          @click="resetZoom">
          <FrIcon name="refresh" />
        </BButton>
        <BButton
          size="sm"
          variant="outline-secondary"
          class="mr-1"
          :aria-label="t('governance.audit.histogram.zoomOut')"
          :disabled="isLoading"
          @click="zoomOut">
          <FrIcon name="zoom_out" />
        </BButton>
        <BButton
          size="sm"
          variant="outline-secondary"
          :aria-label="t('governance.audit.histogram.zoomIn')"
          :disabled="isLoading || zoomInDisabled"
          @click="zoomIn">
          <FrIcon name="zoom_in" />
        </BButton>
      </div>
    </div>
    <div
      v-if="isLoading"
      class="histogram-container d-flex align-items-center justify-content-center">
      <BSpinner />
    </div>
    <VChart
      v-else
      role="img"
      class="histogram-container"
      autoresize
      :aria-label="t('governance.audit.histogram.title')"
      :option="chartOption"
      @click="onChartClick" />
  </BCard>
</template>

<script setup>
/* eslint-disable import/no-unresolved, import/extensions */
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { BButton, BCard, BSpinner } from 'bootstrap-vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { getAuditLogs } from '@forgerock/platform-shared/src/api/governance/AuditApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { useI18n } from 'vue-i18n';

use([CanvasRenderer, BarChart, TooltipComponent, GridComponent]);

const { t } = useI18n();

const emit = defineEmits(['bar-click']);

const props = defineProps({
  fromDate: {
    type: String,
    default: '',
  },
  toDate: {
    type: String,
    default: '',
  },
  /** Extra fixed filter to scope the histogram (e.g. actorId or objectId filter string) */
  queryFilter: {
    type: String,
    default: '',
  },
  /** Extra params merged into the API call (e.g. { actor: 'managed/user/123' }) */
  extraParams: {
    type: Object,
    default: () => ({}),
  },
});

const MIN_RANGE_MS = 60 * 60 * 1000; // 1 hour minimum

const isLoading = ref(false);
const buckets = ref([]);

// Canonical range from table filters — used to detect zoom drift and to reset
const propFrom = ref(null);
const propTo = ref(null);

// Internal view window — driven by props initially, then independently by zoom actions
const viewFrom = ref(null);
const viewTo = ref(null);

const isZoomed = computed(() => {
  if (!propFrom.value || !propTo.value || !viewFrom.value || !viewTo.value) return false;
  return viewFrom.value.getTime() !== propFrom.value.getTime()
    || viewTo.value.getTime() !== propTo.value.getTime();
});

const zoomInDisabled = computed(() => {
  if (!viewFrom.value || !viewTo.value) return true;
  return (viewTo.value - viewFrom.value) / 2 < MIN_RANGE_MS;
});

/**
 * Builds hourly buckets between fromDate and toDate.
 */
function buildHourlyBuckets(from, to) {
  const totalHours = Math.ceil((to - from) / (60 * 60 * 1000));
  return Array.from({ length: totalHours }, (_, i) => {
    const start = new Date(from.getTime() + i * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      from: start, to: end, count: 0, label: dayjs(start).format('HH:mm'),
    };
  });
}

/**
 * Builds one bucket per calendar day when range spans more than 2 days.
 */
function buildDailyBuckets(from, to) {
  const days = Math.ceil((to - from) / (24 * 60 * 60 * 1000));
  return Array.from({ length: days }, (_, i) => {
    const day = dayjs(from).startOf('day').add(i, 'day');
    return {
      from: day.toDate(),
      to: day.add(1, 'day').toDate(),
      count: 0,
      label: day.format('MMM D'),
    };
  });
}

async function loadHistogram() {
  if (!viewFrom.value || !viewTo.value) return;

  isLoading.value = true;
  try {
    const fromIso = viewFrom.value.toISOString();
    const toIso = viewTo.value.toISOString();

    const queryFilter = props.queryFilter || undefined;
    const { data } = await getAuditLogs({
      startDate: fromIso,
      endDate: toIso,
      pageSize: 1000,
      page: 1,
      ...(queryFilter ? { queryFilter } : {}),
      ...props.extraParams,
    });
    const records = data?.result ?? [];

    const rangeHours = (viewTo.value - viewFrom.value) / (60 * 60 * 1000);
    const builtBuckets = rangeHours > 48
      ? buildDailyBuckets(viewFrom.value, viewTo.value)
      : buildHourlyBuckets(viewFrom.value, viewTo.value);

    records.forEach((record) => {
      const ts = new Date(record.timestamp).getTime();
      const idx = builtBuckets.findIndex((b) => ts >= b.from.getTime() && ts < b.to.getTime());
      if (idx !== -1) builtBuckets[idx].count += 1;
    });

    buckets.value = builtBuckets.map((b) => ({
      label: b.label, count: b.count, from: b.from, to: b.to,
    }));
  } catch (e) {
    showErrorMessage(e, t('governance.audit.histogram.loadFailed'));
  } finally {
    isLoading.value = false;
  }
}

function zoomIn() {
  if (!viewFrom.value || !viewTo.value) return;
  const mid = (viewFrom.value.getTime() + viewTo.value.getTime()) / 2;
  const halfNewRange = (viewTo.value - viewFrom.value) / 4;
  viewFrom.value = new Date(mid - halfNewRange);
  viewTo.value = new Date(mid + halfNewRange);
  loadHistogram();
}

function resetZoom() {
  viewFrom.value = new Date(propFrom.value.getTime());
  viewTo.value = new Date(propTo.value.getTime());
  loadHistogram();
}

function zoomOut() {
  if (!viewFrom.value || !viewTo.value) return;
  const mid = (viewFrom.value.getTime() + viewTo.value.getTime()) / 2;
  const halfNewRange = (viewTo.value - viewFrom.value);
  viewFrom.value = new Date(mid - halfNewRange);
  viewTo.value = new Date(mid + halfNewRange);
  loadHistogram();
}

const chartOption = computed(() => ({
  textStyle: { fontFamily: 'Open Sans, sans-serif' },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const p = params[0];
      return `<strong>${p.name}</strong><br/>${t('governance.audit.histogram.events')}: <strong>${p.value}</strong>`;
    },
  },
  grid: {
    left: '3%', right: '3%', bottom: '8%', top: '4%', containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: buckets.value.map((b) => b.label),
    axisLine: { lineStyle: { color: '#e7eef4' } },
    axisLabel: { fontSize: 11, color: '#5e6d82', interval: 'auto' },
    axisTick: { alignWithLabel: true },
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    axisLine: { lineStyle: { color: '#e7eef4' } },
    axisLabel: { fontSize: 11, color: '#5e6d82' },
    splitLine: { lineStyle: { color: '#f0f4f8' } },
  },
  series: [{
    type: 'bar',
    data: buckets.value.map((b) => b.count),
    itemStyle: { color: '#109cf1', borderRadius: [3, 3, 0, 0] },
    barMaxWidth: 40,
  }],
  animationDuration: 400,
  animationEasing: 'cubicOut',
}));

function onChartClick(params) {
  const bucket = buckets.value[params.dataIndex];
  if (!bucket) return;
  const isDaily = (bucket.to - bucket.from) >= 24 * 60 * 60 * 1000;
  if (isDaily) {
    emit('bar-click', { fromDate: bucket.from.toISOString(), toDate: bucket.to.toISOString() });
  } else {
    const center = bucket.from.getTime();
    emit('bar-click', {
      fromDate: new Date(center - 60 * 60 * 1000).toISOString(),
      toDate: new Date(center + 60 * 60 * 1000).toISOString(),
    });
  }
}

// Sync internal view window when table filters change; resets any active zoom
watch([() => props.fromDate, () => props.toDate], ([from, to]) => {
  if (!from) return;
  propFrom.value = new Date(from);
  propTo.value = to ? new Date(to) : new Date();
  viewFrom.value = new Date(propFrom.value.getTime());
  viewTo.value = new Date(propTo.value.getTime());
  loadHistogram();
}, { immediate: true });

// Reload when actor/object filter changes without affecting the date window
watch(() => props.extraParams, () => {
  loadHistogram();
}, { deep: true });
</script>

<style lang="scss" scoped>
.section-header {
  font-size: 1rem;
  font-weight: 600;
  color: $gray-900;
}

.histogram-container {
  height: 200px;
  width: 100%;
  cursor: pointer;
}
</style>
