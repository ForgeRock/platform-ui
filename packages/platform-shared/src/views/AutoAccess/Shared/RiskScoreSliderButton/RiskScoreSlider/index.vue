<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

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
        :style="lowSliderStyles"
      />
      <div
        class="vue-slider-process medium"
        :style="mediumSliderStyles"
      />
      <div
        class="vue-slider-process high"
        :style="highSliderStyles"
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
    value: {
      type: Array,
      validator: (prop) => prop.every((e) => typeof e === 'number'),
      default: () => [0, 100],
    },
  },
  data() {
    return {
      minRisk: 0,
      maxRisk: 100,
      selectedRange: this.value,
    };
  },
  methods: {
    selectedRangeChange($event) {
      this.$emit('input', $event);
    },
  },
  computed: {
    lowSliderStyles() {
      return { width: `${this.selectedRange[0]}%` };
    },
    mediumSliderStyles() {
      return {
        width: `${this.selectedRange[1] - this.selectedRange[0]}%`,
        left: `${this.selectedRange[0]}%`,
      };
    },
    highSliderStyles() {
      return { width: `${100 - this.selectedRange[1]}%`, right: 0 };
    },
  },
  watch: {
    value(newValue) {
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
