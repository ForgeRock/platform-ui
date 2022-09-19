<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <VueSlider
      v-model="selectedRange"
      :min="minRisk"
      :max="maxRisk"
      :interval="1"
      @change="selectedRangeChange($event)"
    >
      <div
        class="vue-slider-process low"
        :style="{ width: `${thresholds.medium}%` }"
      />
      <div
        class="vue-slider-process medium"
        :style="{
          width: `${thresholds.high - thresholds.medium}%`,
          left: `${thresholds.medium}%`,
        }"
      />
      <div
        class="vue-slider-process high"
        :style="{ width: `${100 - thresholds.high}%`, right: 0 }"
      />
      <div
        class="custom-mark"
        :style="{ left: `0%` }">
        0
      </div>
      <div
        class="custom-mark"
        :style="{ left: `100%` }">
        100
      </div>
    </VueSlider>
    <!-- <div class="vue-slider-legend d-flex flex-row justify-content-around px-4 mt-4"> -->
    <!--   <div -->
    <!--     class="low" -->
    <!--     :style="{ width: `${thresholds.medium}%` }"> -->
    <!--     {{ $t("autoAccess.access.risk.low") }} -->
    <!--   </div> -->
    <!--   <div -->
    <!--     class="medium" -->
    <!--     :style="{ width: `${thresholds.high - thresholds.medium}%` }" -->
    <!--   > -->
    <!--     {{ $t("autoAccess.access.risk.medium") }} -->
    <!--   </div> -->
    <!--   <div -->
    <!--     class="high" -->
    <!--     :style="{ width: `${100 - thresholds.high}%` }"> -->
    <!--     {{ $t("autoAccess.access.risk.high") }} -->
    <!--   </div> -->
    <!-- </div> -->
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component';

export default {
  name: 'RiskScoreSlider',
  components: {
    VueSlider,
  },
  props: {
    initialValue: {
      type: Array,
      default: null,
    },
    thresholds: {
      type: Object,
      default: () => ({
        medium: 30,
        high: 70,
      }),
    },
    minRisk: {
      type: Number,
      default: 0,
    },
    maxRisk: {
      type: Number,
      default: 100,
    },
  },

  data() {
    return {
      selectedRange: this.initialValue
        ? [this.initialValue[0] !== undefined ? this.initialValue[0] : 30,
          this.initialValue[1] !== undefined ? this.initialValue[1] : 70]
        : [30, 70],
    };
  },
  methods: {
    selectedRangeChange($event) {
      this.$emit('selected-range-change', $event);
    },
  },
  watch: {
    initialValue(newValue) {
      this.selectedRange = newValue;
    },
  },
};
</script>

<style lang="scss">
@import "~vue-slider-component/theme/default.css";

.vue-slider {
  .vue-slider-process {
    height: 100%;

    &.low {
      background: var(--success);
    }

    &.medium {
      background: var(--warning);
    }

    &.high {
      background: var(--danger);
    }
  }

  .custom-mark {
    position: absolute;
    top: 10px;
    transform: translateX(-50%);
    white-space: nowrap;
  }

  &-legend,
  .custom-mark {
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  &-legend {
    > div {
      position: relative;
      margin-left: 16px;

      &::before {
        content: "";
        height: 8px;
        width: 8px;
        background: black;
        border-radius: 100%;
        position: absolute;
        left: -16px;
        top: 5px;
      }

      &.low {
        &::before {
          background: var(--success);
        }
      }

      &.medium {
        &::before {
          background: var(--warning);
        }
      }

      &.high {
        &::before {
          background: var(--danger);
        }
      }
    }
  }
}
</style>
