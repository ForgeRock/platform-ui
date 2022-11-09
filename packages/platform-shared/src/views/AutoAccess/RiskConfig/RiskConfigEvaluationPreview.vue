<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BAlert
      v-if="error"
      show
      variant="danger">
      <i class="material-icons-outlined">
        error_outline
      </i>
      {{ error }}
    </BAlert>
    <div :class="error ? 'd-none' : ''">
      <BOverlay :show="loading">
        <div
          class="d-flex flex-row align-items-center mb-2 justify-content-between"
          style="margin-top: -0.5rem;">
          <h5
            class="m-0"
            v-if="riskEvaluation.length > 0">
            Preview First {{ riskEvaluation.length }} Events
          </h5>
          <div>
            <BButton
              variant="link"
              class="px-2 py-1"
              :disabled="index === 0"
              @click="() => this.index = this.index - 1"
            >
              <span class="material-icons-outlined">
                chevron_left
              </span>
            </BButton>
            <BButton
              variant="link"
              class="px-2 py-1"
              :disabled="index === riskEvaluation.length - 1"
              @click="() => this.index = this.index + 1"
            >
              <span class="material-icons-outlined">
                chevron_right
              </span>
            </BButton>
          </div>
        </div>
        <div
          id="risk-config-evaluation-preview"
          class="p-4 border-top"
          style="min-height: 500px;" />
      </BOverlay>
    </div>
  </div>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import { BAlert, BButton, BOverlay } from 'bootstrap-vue';
import { getConfigurationChangesPreview } from './api/RiskConfigAPI';

const ace = require('brace');
require('brace/mode/json');

export default {
  name: 'RiskConfigEvaluationPreview',
  components: {
    BAlert,
    BButton,
    BOverlay,
  },
  props: {
    dataSource: {
      type: Object,
      default: () => ({}),
    },
    processJSON: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: true,
      error: false,
      riskEvaluation: [],
      index: -1,
    };
  },
  mounted() {
    this.reset();
    this.loading = true;
    getConfigurationChangesPreview(this.dataSource, this.processJSON).then((res) => {
      if (res.length > 0) {
        this.riskEvaluation = res;
        this.index = 0;
      } else {
        this.riskEvaluation = [];
        this.error = 'Risk evaluation unavailable.';
      }
    }).catch(() => {
      this.error = 'An error occured fetching risk evaluation preview.';
    }).finally(() => {
      this.loading = false;
    });
  },
  watch: {
    index: {
      handler(val) {
        if (val > -1) {
          this.setPreview();
        }
      },
    },
  },
  methods: {
    reset() {
      this.index = -1;
      this.error = '';
      this.riskEvaluation = [];
    },
    setPreview() {
      const editor = ace.edit('risk-config-evaluation-preview');
      editor.getSession().setMode('ace/mode/json');
      editor.setOption('printMargin', 120);
      editor.setValue(JSON.stringify(this.riskEvaluation[this.index], null, '\t'));
      editor.getSession().setUseWrapMode(true);
      editor.moveCursorTo(0, 0);
      editor.clearSelection();
    },
  },
};
</script>
