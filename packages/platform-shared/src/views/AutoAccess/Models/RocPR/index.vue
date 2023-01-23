<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="error"
    class="my-3">
    <BAlert
      show
      variant="danger">
      <i class="material-icons-outlined">
        error_outline
      </i>
      <span>{{ error }}</span>
    </BAlert>
  </div>
  <div
    v-else
    class="container-fluid my-3">
    <FrSpinner
      class="my-4"
      v-if="isLoading"
      size="md" />
    <svg
      v-show="!isLoading && !error"
      preserveAspectRatio="xMidYMid meet"
      ref="d3Container" />
    <div v-if="modelId === 'cluster_curves' && centroidData">
      <Centroids :centroid-data="centroidData" />
    </div>
  </div>
</template>

<script>
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import { BAlert } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import fetchModelsData from '../api/ModelsAPI';
import Centroids from '../Centroids';
import '../scss/_roc-pr.scss';
import * as ROCPRChart from '../d3/_roc-pr-chart';

export default {
  name: 'RocPR',
  components: {
    FrSpinner,
    BAlert,
    Centroids,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      modelData: null,
      isLoading: false,
      error: false,
      init: false,
    };
  },
  props: {
    modelId: {
      type: String,
      default: '',
    },
    pipelineId: {
      type: String,
      default: '',
    },
  },
  watch: {
    modelId: {
      immediate: true,
      handler() {
        if (!this.modelData) {
          this.getData();
        }
      },
    },
    flatData() {
      if (this.flatData.length > 0) {
        if (!this.init) {
          ROCPRChart.init(this.$refs.d3Container, this.flatData, this.modelId, this.modelData[this.modelId].area_under_roc);
          this.init = true;
        } else {
          ROCPRChart.update(this.$refs.d3Container, this.flatData, this.modelId, this.modelData[this.modelId].area_under_roc);
        }
      }
    },
  },
  computed: {
    flatData() {
      let arr = [];
      const { modelData, modelId } = this;
      if (modelData) {
        try {
          const source = modelData[modelId];
          const scoreThreshhold = source.score_threshold;
          const tprData = source.tpr;
          const fprData = source.fpr;
          const { precision } = source;
          const { recall } = source;
          const { confusion_matrix: confusionMatrix } = source;
          arr = scoreThreshhold.map((threshold, index) => ({
            tpr: tprData[index],
            fpr: fprData[index],
            t: threshold,
            ppv: precision[index],
            rc: recall[index],
            tn: confusionMatrix[index].tn,
            tp: confusionMatrix[index].tp,
            fn: confusionMatrix[index].fn,
            fp: confusionMatrix[index].fp,
          }));
        } catch (e) {
          this.setError(this.$t('autoAccess.access.models.noDataError'));
        }
      }
      return arr;
    },
    centroidData() {
      return this.modelData.modelC || null;
    },
  },
  methods: {
    getData() {
      this.isLoading = true;
      this.error = false;
      fetchModelsData(this.pipelineId).then((data) => {
        this.modelData = data;
        this.$emit('update', data);
      })
        .catch(() => {
          this.setError(this.$t('autoAccess.access.models.fetchDataError'));
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    setError(err) {
      this.error = err;
    },
  },
};
</script>

<style lang="scss" scoped></style>
