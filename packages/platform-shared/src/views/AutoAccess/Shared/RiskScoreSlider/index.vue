<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex">
    <BButton
      pill
      variant="outline-primary"
      id="risk-score-slider"
    >
      {{ buttonLabel }}
    </BButton>
    <BPopover
      target="risk-score-slider"
      triggers="click"
      ref="popover"
      placement="bottomleft"
      custom-class="risk-score-slider-popover">
      <div class="p-4 pb-6">
        <div class="d-flex flex-row align-items-center mb-3">
          <h5 class="mb-0">
            Risk Score
          </h5>
          <BButton
            variant="link"
            class="p-0 ml-2"
            id="risk-score-slider-tooltip"
          >
            <i class="material-icons-outlined">
              info
            </i>
          </BButton>
          <BTooltip
            target="risk-score-slider-tooltip"
            triggers="click hover"
          >
            Events with a risk score between {{ minRisk }} and {{ maxRisk }} are classified as risky.
          </BTooltip>
        </div>
        <VueSlider
          v-model="selectedRange"
          :min="minRisk"
          :max="maxRisk"
          :interval="1">
          <div
            class="custom-mark"
            :style="{ left: `0%` }">
            {{ minRisk }}
          </div>
          <div
            class="custom-mark"
            :style="{ left: `100%` }">
            {{ maxRisk }}
          </div>
        </VueSlider>
      </div>
      <!-- TODO reintegrate with configurable risk range -->
      <!-- <div class="p-4 pb-6">
                <h5 class="mb-3">Risk Score</h5>
                <VueSlider
                    v-model="selectedRange"
                    :interval="1">
                    <template v-slot:process="{ }">
                        <div class="vue-slider-process low"
                            :style="{width: `${thresholds.medium}%`}"
                            >
                        </div>
                        <div class="vue-slider-process medium"
                            :style="{width: `${thresholds.high - thresholds.medium}%`, left: `${thresholds.medium}%`}"
                            >
                        </div>
                        <div class="vue-slider-process high"
                            :style="{width: `${100 - thresholds.high}%`, right: 0}"
                            >
                        </div>
                    </template>
                    <div class="custom-mark" :style="{ left: `0%` }">
                        0
                    </div>
                    <div class="custom-mark" :style="{ left: `100%` }">
                        100
                    </div>
                </VueSlider>
                <div class="vue-slider-legend d-flex flex-row justify-content-around px-4 mt-4">
                    <div class="low"
                        :style="{width: `${thresholds.medium}%`}">
                        Low
                    </div>
                    <div class="medium"
                        :style="{width: `${thresholds.high - thresholds.medium}%`}">
                        Medium
                    </div>
                    <div class="high"
                        :style="{width: `${100 - thresholds.high}%`}">
                        High
                    </div>
                </div>
            </div> -->
      <div class="border-top p-3 d-flex flex-row justify-content-between">
        <BButton
          variant="link"
          class="pl-0"
          @click="() => {
            this.selectedRange = [this.minRisk, this.maxRisk];
          }"
        >
          Reset
        </BButton>
        <BButton
          variant="primary"
          @click="() => {
            $emit('change', selectedRange);
            closePopover();
          }"
        >
          Apply
        </BButton>
      </div>
    </BPopover>
  </div>
</template>
<script>
import VueSlider from 'vue-slider-component';
import { BButton, BPopover, BTooltip } from 'bootstrap-vue';
import store from '@/store';

export default {
  name: 'RiskScoreSlider',
  components: {
    VueSlider,
    BButton,
    BPopover,
    BTooltip,
  },
  props: {
    value: Array,
  },
  data() {
    return {
      selectedRange: [...this.value],
    };
  },
  methods: {
    closePopover() {
      this.$refs.popover.$emit('close');
    },
  },
  watch: {
    minRisk(val) {
      this.selectedRange = [val, 100];
    },
  },
  computed: {
    buttonLabel() {
      if (this.selectedRange[0] === 0 && this.selectedRange[1] === 100) {
        return 'All Risk Scores';
      }
      return `${this.selectedRange[0]} – ${this.selectedRange[1]} Risk`;
    },
    // thresholds() {
    //     return {
    //         medium: store.state.Dashboard.config.thresholds.medium,
    //         high: store.state.Dashboard.config.thresholds.high,
    //     }
    // },
    minRisk() {
      return store.state.Dashboard.config.thresholds && store.state.Dashboard.config.thresholds.high;
    },
    maxRisk() {
      return 100;
    },
  },
};
</script>
<style lang="scss">
  @import '~vue-slider-component/theme/default.css';

  .risk-score-slider-popover {
    width: 350px;
    max-width: 100%;

    .popover-body {
      padding: 0;
    }

    .arrow {
      display: none;
    }

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
            content: '';
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
  }
</style>
