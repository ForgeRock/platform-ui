<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="risk-score">
    <div class="d-flex flex-row align-items-center risk-score-value">
      <div
        class="risk-score-indicator mr-2"
        :style="{background: getRiskColor(score)}" />
      <span
        v-if="small"
        class="text-dark">
        {{ score }}
      </span>
      <h1
        v-else
        class="m-0 h4">
        {{ score }}
      </h1>
    </div>
  </div>
</template>

<script>
import store from '@/store';

export default {
  name: 'RiskScore',
  props: {
    score: {
      default: 0,
      type: Number,
    },
    small: {
      type: Boolean,
    },
    change: {
      default: 0,
      type: Number,
    },
    invertChange: {
      type: Boolean,
    },
  },
  computed: {
    changePercent() {
      return this.change * (this.invert ? -1 : 1);
    },
  },
  methods: {
    getRiskColor(score) {
      if (store.state.Dashboard.config.thresholds && store.state.Dashboard.config.thresholds.high && store.state.Dashboard.config.thresholds.medium) {
        if (score >= store.state.Dashboard.config.thresholds.high) {
          return 'var(--danger)';
        } if (score >= store.state.Dashboard.config.thresholds.medium) {
          return 'var(--warning)';
        }
      }
      return 'var(--danger)';
    },
  },
};
</script>

<style>
    .risk-score-indicator {
      width: 8px;
      height: 8px;
      border-radius: 100%;
    }
</style>
