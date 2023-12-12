<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="timeframeOptionsValue"
      class="mb-3"
      name="timeframe"
      type="select"
      :label="timeframeOptionsValue ? $t('reports.tabs.runReport.timeframe.label') : ''"
      :options="timeframeOptions"
      :placeholder="$t('reports.tabs.runReport.timeframe.last7Days')"
      :searchable="false" />
    <BCollapse
      data-testid="timeframe-datepicker-fields"
      :visible="showCustomTimeframe">
      <div class="d-flex align-items-center mb-4">
        <FrDatepicker
          data-testid="datepicker-start"
          name="startDate"
          :date-format-options="dateFormat"
          :placeholder="$t('reports.tabs.runReport.timeframe.startDate')"
          @input="startDateCustomValue = $event" />
        <span class="p-2">
          {{ $t('common.to').toLowerCase() }}
        </span>
        <FrDatepicker
          data-testid="datepicker-end"
          name="endDate"
          :date-format-options="dateFormat"
          :placeholder="$t('reports.tabs.runReport.timeframe.endDate')"
          @input="endDateCustomValue = $event" />
      </div>
    </BCollapse>
  </div>
</template>

<script setup>
/**
 * @description Displays the Timeframe field for running reports
 */
import { computed, ref, watch } from 'vue';
import { BCollapse } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import dateRanges from '@forgerock/platform-shared/src/utils/date';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import i18n from '@/i18n';

const emit = defineEmits(['start-date-update', 'end-date-update']);

/**
 * Globals
 */
const dateFormat = { year: 'numeric', month: 'numeric', day: 'numeric' };
const timeframeOptions = [
  i18n.global.t('reports.tabs.runReport.timeframe.today'),
  i18n.global.t('reports.tabs.runReport.timeframe.yesterday'),
  i18n.global.t('reports.tabs.runReport.timeframe.last7Days'),
  i18n.global.t('reports.tabs.runReport.timeframe.last30Days'),
  i18n.global.t('reports.tabs.runReport.timeframe.custom'),
];
const timeframeOptionsValue = ref('');
const dateMap = {
  [i18n.global.t('reports.tabs.runReport.timeframe.today')]: 'Today',
  [i18n.global.t('reports.tabs.runReport.timeframe.yesterday')]: 'Yesterday',
  [i18n.global.t('reports.tabs.runReport.timeframe.last7Days')]: 'Last 7 Days',
  [i18n.global.t('reports.tabs.runReport.timeframe.last30Days')]: 'Last 30 Days',
};
const startDateCustomValue = ref('');
const endDateCustomValue = ref('');

/**
 * Computed
 */
const showCustomTimeframe = computed(() => timeframeOptionsValue.value === i18n.global.t('reports.tabs.runReport.timeframe.custom'));
const timeframeSelection = computed(() => timeframeOptionsValue.value || i18n.global.t('reports.tabs.runReport.timeframe.last7Days'));
const timeframeComputedValue = computed(() => {
  const validDateMap = dateMap[timeframeSelection.value];
  const customStartValue = startDateCustomValue.value;
  const customEndValue = endDateCustomValue.value;
  if (validDateMap) {
    return dateRanges()[validDateMap];
  }
  if (showCustomTimeframe.value && customStartValue && customEndValue) {
    return [customStartValue, customEndValue];
  }
  return [false, false];
});
const startDateModel = computed(() => {
  const [startDate] = timeframeComputedValue.value;
  return startDate;
});
const endDateModel = computed(() => {
  const [, endDate] = timeframeComputedValue.value;
  return endDate;
});

/**
 * Watchers
 */
watch(() => startDateModel.value, (value) => emit('start-date-update', value), { immediate: true });
watch(() => endDateModel.value, (value) => emit('end-date-update', value), { immediate: true });
</script>
