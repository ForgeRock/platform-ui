<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    ref="validation"
    as="span">
    <FrField
      v-model="timeframeOptionsValue"
      class="mb-3"
      :name="`timeframe_${_uid}`"
      type="select"
      :options="timeframeOptions"
      :label="label"
      :searchable="false" />
    <BCollapse
      data-testid="timeframe-datepicker-fields"
      :visible="showCustomTimeframe">
      <div class="d-flex align-items-start mb-4">
        <div class="w-100">
          <FrDatepicker
            data-testid="datepicker-start"
            name="startDate"
            :date-format-options="dateFormat"
            :placeholder="$t('reports.tabs.runReport.timeframe.startDate')"
            @input="startDateCustomValue = $event" />
        </div>
        <p class="p-2">
          {{ $t('common.to').toLowerCase() }}
        </p>
        <div class="w-100">
          <FrDatepicker
            data-testid="datepicker-end"
            name="endDate"
            :date-format-options="dateFormat"
            :placeholder="$t('reports.tabs.runReport.timeframe.endDate')"
            :validation="isAfterDate"
            @input="endDateCustomValue = $event" />
        </div>
      </div>
    </BCollapse>
  </VeeForm>
</template>

<script setup>
/**
 * @description Displays the Timeframe field for running reports
 */
import { computed, ref, watch } from 'vue';
import { BCollapse } from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import dateRanges from '@forgerock/platform-shared/src/utils/date';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import dayjs from 'dayjs';
import i18n from '@/i18n';

const emit = defineEmits(['start-date-update', 'end-date-update']);
defineProps({
  label: {
    type: String,
    default: '',
  },
});
/**
 * Globals
 */
const customTimeframeOption = i18n.global.t('reports.tabs.runReport.timeframe.custom');
const todayOption = i18n.global.t('reports.tabs.runReport.timeframe.today');
const yesterdayOption = i18n.global.t('reports.tabs.runReport.timeframe.yesterday');
const last7DaysOption = i18n.global.t('reports.tabs.runReport.timeframe.last7Days');
const last30DaysOption = i18n.global.t('reports.tabs.runReport.timeframe.last30Days');
const dateFormat = { year: 'numeric', month: 'numeric', day: 'numeric' };
const timeframeOptions = [
  todayOption,
  yesterdayOption,
  last7DaysOption,
  last30DaysOption,
  customTimeframeOption,
];
const timeframeOptionsValue = ref('');
const dateMap = {
  [todayOption]: 'Today',
  [yesterdayOption]: 'Yesterday',
  [last7DaysOption]: 'Last 7 Days',
  [last30DaysOption]: 'Last 30 Days',
};
const startDateCustomValue = ref('');
const endDateCustomValue = ref('');
const validation = ref({});

/**
 * Computed
 */
const showCustomTimeframe = computed(() => timeframeOptionsValue.value === customTimeframeOption);
const timeframeSelection = computed(() => timeframeOptionsValue.value || last7DaysOption);
const timeframeComputedValue = computed(() => {
  const validDateMap = dateMap[timeframeSelection.value];
  const customStartValue = startDateCustomValue.value;
  const customEndValue = endDateCustomValue.value;
  const validEndDate = validation.value.getMeta;

  if (validDateMap && !showCustomTimeframe.value) {
    return dateRanges()[validDateMap];
  }

  if (customStartValue && customEndValue && validEndDate().valid) {
    return [dayjs(customStartValue).toISOString(), dayjs(customEndValue).toISOString()];
  }

  return [false, false];
});
const isAfterDate = computed(() => {
  const validDate = startDateCustomValue.value || new Date();
  return {
    is_after_date: {
      date: startDateCustomValue.value,
      message: i18n.global.t('common.policyValidationMessages.IS_AFTER_DATE', { date: dayjs(validDate).format('M/DD/YYYY') }),
    },
  };
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

<style lang="scss" scoped>
:deep(.dropdown-menu.show) {
  z-index: 9999;
}
</style>
