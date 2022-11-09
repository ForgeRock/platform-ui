<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <svg preserveAspectRatio="xMidYMid meet">
    <g
      v-for="(segment, i) in segments"
      :key="`segment-${i}`">
      <path />
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'DonutChart',
  data() {
    return {
      dim: {
        width: 168,
        height: 168,
      },
    };
  },
  props: {
    segments: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
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
};
</script>
