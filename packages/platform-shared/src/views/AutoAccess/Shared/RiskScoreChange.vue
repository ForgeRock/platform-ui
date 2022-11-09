<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :class="{
      'align-self-end': true,
      'risk-score-change': true,
      'text-success': change * (invert ? -1 : 1) >= 0,
      'text-danger': change * (invert ? -1 : 1) < 0,
      'small': small,
    }">
    <span
      v-if="change < 0"
      class="material-icons-outlined">
      south_east
    </span>
    <span
      v-if="change >= 0"
      class="material-icons-outlined">
      north_east
    </span>
    <span>{{ change > 0 ? "+" : "" }}{{ Math.round(change) }}%</span>
  </div>
</template>

<script>
export default {
  name: 'RiskScoreChange',
  props: {
    change: {
      type: Number,
      default: 0,
    },
    invert: {
      type: Boolean,
    },
    small: {
      type: Boolean,
    },
  },
};
</script>

<style lang="scss">
  .risk-score-change {
    &.small {
      .material-icons-outlined {
        font-size: 0.8125rem;
      }
    }
  }
</style>
