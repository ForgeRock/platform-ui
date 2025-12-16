<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <path
    :d="drawLine"
    marker-end="url(#arrowhead)"
    stroke-width="2"
    fill="none"
    :class="{'fr-active-line': active}"
    v-bind="$attrs"
  />
</template>

<script>
/**
  * Calculate tree line (svg path) used for connecting two different nodes
  */
export default {
  name: 'SimpleConnection',
  components: {},
  props: {
    source: {
      required: true,
      type: Object,
      x: Number,
      y: Number,
    },
    target: {
      type: Object,
      required: true,
      x: Number,
      y: Number,
    },
    lineId: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      MIN_CONTROL_POINT_LENGTH: 50,
      MAX_VERTICAL_DISTANCE: 150,
    };
  },
  computed: {
    /**
      * Computed function that will dynamically update a svg path as source and target node positioning changes
      *
      * @returns {string} Returns a svg path with a cubic bezier curve
      */
    drawLine() {
      const isWithinVerticalRange = Math.abs(this.source.y - this.target.y) < this.MAX_VERTICAL_DISTANCE;
      const isEndNodeBehindStartNode = this.target.x + this.source.width <= this.source.x;

      return isEndNodeBehindStartNode && isWithinVerticalRange
        ? this.createFourPointBezierCurve(this.source, this.target) : this.createSixPointBezierCurve(this.source, this.target);
    },
  },
  methods: {
    /**
      * Line calculations for calculating the appropriate curves and offset.
      */
    bezierCurve({
      start, startCp, center, endCp, end,
    }) {
      const startControlPoints = `M${start.x} ${start.y} C${startCp.x} ${startCp.y}, `;
      const centerControlPoints = center ? `${center.x} ${center.y} , ${center.x} ${center.y} S` : '';
      const endControlPoints = `${endCp.x} ${endCp.y}, ${end.x} ${end.y}`;

      return `${startControlPoints}${centerControlPoints}${endControlPoints}`;
    },
    /**
      * Calculates the X position offset for bezier control points
      * @param {Object} start Starting node with X / Y position
      * @param {Object} end Ending node with X / Y position
      *
      * @returns {number} returns x point offset
      */
    calculateOffsetX(start, end) {
      const strength = 0.2;
      let minXLength = this.MIN_CONTROL_POINT_LENGTH;

      if (Math.abs(start.y - end.y) < this.MIN_CONTROL_POINT_LENGTH) {
        minXLength = Math.abs(start.y - end.y);
      }
      const offSetX = Math.abs((start.x - end.x) * strength);

      return offSetX < minXLength ? minXLength : offSetX;
    },
    /**
      * Calculates a standard four point bezier curve.
      * @param {Object} start Starting node with X / Y position
      * @param {Object} end Ending node with X / Y position
      *
      * @returns {*|string} - Returns calculated bezier curve line
      */
    createFourPointBezierCurve(start, end) {
      const clearance = (start.height + start.width) / 2 || 0;
      const offsetX = this.calculateOffsetX(start, end);
      const startCp = {
        x: start.x + offsetX,
        y: start.y + clearance,
      };
      const endCp = {
        x: end.x - offsetX,
        y: end.y + this.MIN_CONTROL_POINT_LENGTH,
      };

      return this.bezierCurve({
        start, startCp, endCp, end,
      });
    },
    /**
      * Calculates a six point bezier curve. This is used to generate an extra curve effect
      * when the line is behind the node.
      * @param {Object} start Starting node with X / Y position
      * @param {Object} end Ending node with X / Y position
      *
      * @returns {*|string} - Returns calculated bezier curve line
      */
    createSixPointBezierCurve(start, end) {
      const offsetX = this.calculateOffsetX(start, end);
      const center = {
        x: start.x - (start.x - end.x) / 2,
        y: start.y - (start.y - end.y) / 2,
      };
      const startCp = {
        x: start.x + offsetX,
        y: start.y,
      };
      const endCp = {
        x: end.x - offsetX,
        y: end.y,
      };

      return this.bezierCurve({
        start, startCp, center, endCp, end,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
path {
  stroke: $fr-tree-accent;
  opacity: 1;
}

.fade-connection {
  animation: fade 1s forwards;
}

@keyframes fade {
  to {
    opacity: 0;
  }
}

.accented-connection {
  animation: glow 1s forwards;
}

@keyframes glow {
  to {
    opacity: 1;
  }
}
</style>
