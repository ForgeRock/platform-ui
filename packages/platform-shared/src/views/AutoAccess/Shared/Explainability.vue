<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="riskScoreData.is_risky_event">
    <div
      v-if="heuristics.length > 0"
      class="d-flex"
      :class="{ 'flex-row': !showDetail, 'flex-column': showDetail }"
    >
      <div
        v-for="(h) in heuristics"
        :key="h.key"
        class="mr-2"
        :class="{ 'mt-2': showDetail }"
      >
        <div class="text-nowrap">
          <span class="text-danger">
            <i class="material-icons-outlined">
              check
            </i>
          </span>
          <span>
            {{ $t(`autoAccess.access.reasons["${h.key}"]`) }}
          </span>
        </div>
      </div>
    </div>
    <div
      v-else-if="feature"
      :class="{ 'mt-2': showDetail, 'text-nowrap': showDetail }"
    >
      <span class="text-danger">
        <i class="material-icons-outlined">
          check
        </i>
      </span>
      <span>
        Unusual {{ getUEBALabel(feature) }}
      </span>
    </div>
    <div
      v-else-if="cluster.length > 0"
      class="d-flex"
      :class="{ 'flex-row': !showDetail, 'flex-column': showDetail }">
      <div
        v-for="(key) in cluster"
        :key="key"
        class="mr-2"
        :class="{ 'mt-2': showDetail }"
      >
        <div class="text-nowrap">
          <span class="text-danger">
            <i class="material-icons-outlined">
              check
            </i>
          </span>
          <span>
            Unusual {{ getUEBALabel(key) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { get } from 'lodash';
import { causeMap } from '../Activity/api/ActivityAPI';

export default {
  name: 'Explainability',
  props: {
    riskScoreData: {
      type: Object,
      default: () => ({}),
    },
    uebaSignal: {
      type: Object,
      default: () => ({}),
    },
    showDetail: {
      type: Boolean,
      required: false,
    },
  },
  computed: {
    feature() {
      const feature = this.uebaSignal.explainable_features || null;

      if (feature === 'failed' || feature === 'unknown') {
        return null;
      }

      return feature;
    },
    heuristics() {
      const heuristics = this.riskScoreData.heuristic_agg_result;
      if (!heuristics) {
        return [];
      }
      return heuristics.raw_results.map((h) => {
        const heuristicKey = Object.keys(h).find((propName) => propName.indexOf('is_') === 0);
        return {
          key: heuristicKey,
          isCause: h[heuristicKey],
          value: h.risk_score,
        };
      }).filter((h) => h.isCause)
        .sort((a, b) => a.key.localeCompare(b.key));
    },
    cluster() {
      const cluster = get(this.riskScoreData, 'clustering_result.top_cluster_explainability', []);

      return cluster;
    },
  },
  methods: {
    getUEBALabel(reason) {
      return causeMap[reason];
    },
  },
};
</script>
