<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <DonutChart
    :segments="segments || []"
  />
</template>

<script>
import * as d3 from 'd3';
import DonutChart from '../DonutChart';

export default {
  name: 'RiskHeuristics',
  components: {
    DonutChart,
  },
  props: {
    heuristics: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    segments() {
      return this.heuristics.map((h) => {
        const heuristicKey = Object.keys(h).find((propName) => propName.indexOf('is_') === 0);
        return {
          ...h,
          key: heuristicKey,
          value: h.risk_score,
        };
      });
    },
  },
  methods: {
    arc() {
      d3.arc()
        .innerRadius((this.dim.width / 2) * 0.905)
        .outerRadius(this.dim.width / 2);
    },
    pie() {

    },
  },
  // watch: {
  //     riskInfo: function(newValue) {
  //         console.log(newValue)
  //         if (!this.init) {
  //             RiskInfoDonutChartD3.init(this.$refs.d3Container);
  //             RiskInfoDonutChartD3.update(this.$refs.d3Container, newValue);
  //             this.init = true;
  //         } else {
  //             RiskInfoDonutChartD3.update(this.$refs.d3Container, newValue);
  //         }
  //     },
  // }
};
</script>
