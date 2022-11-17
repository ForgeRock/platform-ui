<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex">
    <div
      class="pill-primary"
      id="risk-score-slider">
      {{ buttonLabel }}
    </div>
    <BPopover
      target="risk-score-slider"
      triggers="click"
      ref="popover"
      placement="bottomleft"
      custom-class="risk-score-slider-popover"
    >
      <div class="p-4 pb-6">
        <div class="d-flex flex-row align-items-center mb-3">
          <h5 class="mb-0">
            {{ $t("autoAccess.access.risk.riskScore") }}
          </h5>

          <div
            id="risk-score-slider-tooltip"
            class="p-0 ml-2"
            tabindex="0">
            <FrIcon
              outlined
              name="info" />
          </div>

          <BTooltip
            target="risk-score-slider-tooltip"
            triggers="click hover">
            {{ tooltip }}
          </BTooltip>
        </div>

        <RiskScoreSlider
          :initial-value="selectedRange"
          :thresholds="thresholds"
          :min-risk="minRisk"
          :max-risk="maxRisk"
          @selected-range-change="changeSelectedRange($event)"
        />
      </div>

      <div class="border-top p-3 d-flex flex-row justify-content-between">
        <BButton
          variant="link"
          class="pl-0"
          @click="reset">
          {{ $t("common.reset") }}
        </BButton>
        <BButton
          variant="primary"
          @click="rangeChange">
          {{ $t("common.apply") }}
        </BButton>
      </div>
    </BPopover>
  </div>
</template>
<script>
import { BButton, BPopover, BTooltip } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import store from '@/store';
import RiskScoreSlider from './RiskScoreSlider';

export default {
  name: 'RiskScoreSliderButton',
  components: {
    BButton,
    BPopover,
    BTooltip,
    RiskScoreSlider,
    FrIcon,
  },
  props: {
    value: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      selectedRange: [...this.value],
      maxRisk: 100,
    };
  },
  methods: {
    closePopover() {
      this.$refs.popover.$emit('close');
    },
    changeSelectedRange($event) {
      this.selectedRange = $event;
    },
    reset() {
      this.selectedRange = [this.minRisk, this.maxRisk];
    },
    rangeChange() {
      this.$emit('change', this.selectedRange);
      this.closePopover();
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
        return this.$t('autoAccess.access.risk.allRisk');
      }
      return this.$t('autoAccess.access.risk.selectedRisk', {
        minSelectedRisk: this.selectedRange[0],
        maxSelectedRisk: this.selectedRange[1],
      });
    },
    thresholds() {
      return {
        medium: store.state.Dashboard.config.thresholds.medium,
        high: store.state.Dashboard.config.thresholds.high,
      };
    },
    minRisk() {
      return (
        store.state.Dashboard.config.thresholds?.high
      );
    },
    tooltip() {
      return this.$t('autoAccess.access.risk.tooltip');
    },
  },
};
</script>
<style lang="scss">
@import "~vue-slider-component/theme/default.css";

.pill-primary {
  color: $blue;
  border: 1px solid $blue;
  border-radius: 2rem;
  padding: 12px 20px;
  &:hover {
    color: $white;
    background: $blue;
    cursor: pointer;
  }
}

.risk-score-slider-popover {
  width: 350px;
  max-width: 100%;

  .popover-body {
    padding: 0;
  }

  .arrow {
    display: none;
  }
}
</style>
