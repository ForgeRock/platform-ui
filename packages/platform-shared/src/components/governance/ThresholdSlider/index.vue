<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <label v-if="props.label">
    {{ props.label }} <span v-if="props.showLabelCount">{{ props.value.toString() }}</span>
  </label>
  <div
    v-if="showRangeLabels"
    class="form-group mb-3 d-flex align-items-center justify-content-between">
    <div
      v-for="(rangeLabel, index) in rangeLabels"
      :key="index"
      class="media align-items-center text-capitalize">
      <span
        class="rounded-circle mr-3"
        :class="rangeLabel.indicatorColorVariant"
        style="width: 10px; height: 10px;" />
      {{ rangeLabel.text }} {{ getLabelValue(index) }}
    </div>
  </div>
  <VueSlider
    :enable-cross="false"
    :marks="props.marks"
    :max="props.max"
    :min="props.min"
    :model-value="props.value"
    height="8px"
    :interval="props.interval"
    @update:modelValue="$emit('input', $event)">
    <template v-if="showRangeLabels" #process="{ start, end }">
      <div
        class="vue-slider-process low"
        :style="{ width: `${start}%` }" />
      <div
        v-if="showRangeLabels"
        class="vue-slider-process medium"
        :style="{ left: `${start}%`, width: `${end - start}%` }" />
      <div
        class="vue-slider-process high"
        :style="{ right: 0, width: `${100 - end}%` }" />
    </template>
  </VueSlider>
</template>

<script setup>
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import i18n from '@/i18n';

const props = defineProps({
  value: {
    type: [Array, Number],
    default: () => [0, 100],
  },
  interval: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: '',
  },
  marks: {
    type: Array,
    default: () => [0, 100],
  },
  max: {
    type: Number,
    default: 100,
  },
  min: {
    type: Number,
    default: 0,
  },
  showLabelCount: {
    type: Boolean,
    default: false,
  },
  showRangeLabels: {
    type: Boolean,
    default: false,
  },
});
const rangeLabels = [
  {
    text: i18n.global.t('autoAccess.access.risk.low'),
    indicatorColorVariant: 'bg-danger',
  },
  {
    text: i18n.global.t('autoAccess.access.risk.medium'),
    indicatorColorVariant: 'bg-warning',
  },
  {
    text: i18n.global.t('autoAccess.access.risk.high'),
    indicatorColorVariant: 'bg-success',
  },
];

function getLabelValue(index) {
  if (index === 0) return `< ${props.value[index]}`;
  if (index === 2) return `> ${props.value[1]}`;
  return `${props.value[0]} - ${props.value[1]}`;
}

</script>
<style lang="scss">
.vue-slider {
  .vue-slider-process {
    height: 100%;

    &.low {
      top: 0;
      background: var(--danger);
    }

    &.medium {
      background: var(--warning);
    }

    &.high {
      background: var(--success);
    }
  }
}
</style>
