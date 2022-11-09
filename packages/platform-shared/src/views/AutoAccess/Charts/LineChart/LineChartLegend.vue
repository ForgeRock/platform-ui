<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div
      class="d-flex flex-row align-items-center"
      v-for="(item, i) in items"
      :key="item"
    >
      <div
        class="legend-indicator mr-2"
        :style="{background: colors[i]}"
      />
      <span class="text-dark small">
        {{ item }}
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LineChartLegend',
  props: {
    colors: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
<style lang="scss" scoped>
  .legend-indicator {
    border-radius: 100%;
    height: 8px;
    width: 8px;
  }
</style>
