<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <span class="risk-score">
    <div class="d-flex flex-row align-items-center risk-score-value">
      <div
        class="risk-score-indicator mr-2"
        :style="{background: getRiskColor(score)}" />
      <span
        v-if="small"
        class="text-dark">
        {{ score }}
      </span>
      <h4
        v-else
        class="m-0">
        {{ score }}
      </h4>
    </div>
    <span v-if="!isNaN(change) && isFinite(change)">
      <RiskScoreChange
        :change="change"
        :invert="invertChange"
        :small="true"
      />
    </span>
  </span>
</template>

<script>
import store from '@/store';
import RiskScoreChange from './RiskScoreChange';

export default {
  name: 'RiskScore',
  components: {
    RiskScoreChange,
  },
  props: {
    score: {
      type: Number,
      required: false,
    },
    small: {
      type: Boolean,
      required: false,
    },
    change: {
      type: Number,
      required: false,
    },
    invertChange: {
      type: Boolean,
      required: false,
    },
  },
  computed: {
    changePercent() {
      return this.change * (this.invert ? -1 : 1);
    },
  },
  methods: {
    getRiskColor(score) {
      if (score >= store.state.Dashboard.config.thresholds.high) {
        return 'var(--danger)';
      } if (score >= store.state.Dashboard.config.thresholds.medium) {
        return 'var(--warning)';
      }
      return 'var(--success)';
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
