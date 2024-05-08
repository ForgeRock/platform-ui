<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VueSlider
    :order="false"
    :model-value="props.value"
    @update:modelValue="$emit('input', $event)">
    <template #process="{ start, end }">
      <div
        class="vue-slider-process low"
        :style="{ width: `${start}%` }" />
      <div
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

const props = defineProps({
  value: {
    type: Array,
    default: () => [0, 100],
  },
});
</script>
<style lang="scss">
.vue-slider {
  .vue-slider-process {
    height: 100%;

    &.low {
      top: 0;
      background: var(--success);
    }

    &.medium {
      background: var(--warning);
    }

    &.high {
      background: var(--danger);
    }
  }
}
</style>
