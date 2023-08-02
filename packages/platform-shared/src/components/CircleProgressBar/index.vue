<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VueEllipseProgress
    :color="styles.blue"
    :empty-color="emptyColor"
    :progress="progress"
    :size="size"
    :thickness="thickness"
    :empty-thickness="emptyThickness">
    <template #default="{ counterTick }">
      <slot
        name="count"
        :count="counterTick" />
    </template>
    <template #legend-caption>
      <slot name="caption" />
    </template>
  </VueEllipseProgress>
</template>

<script>
import { VueEllipseProgress } from 'vue-ellipse-progress';
import styles from '@/scss/main.scss';

/*
 * @description Animated circular progress bar, it has two slots one for the text inside the circle named 'count' and
 * other for the caption below the count named 'caption'
 * this component uses vue-ellipse-progress library behind scenes
 * @tutorial https://github.com/setaman/vue-ellipse-progress
 *
 * @param {number}  progress        - progress value to show in the bar
 * @param {number}  thickness       - line width for the progress segment 14px by default
 * @param {number}  emptyThickness  - line width for the empty segment 14px by default
 * @param {number}  size            - defines the width and height of the circle, 200px by default
 * @param {number}  emptyColor      - color of the empty segment #f5f7f9 by default
 */
export default {
  name: 'CircleProgressBar',
  components: {
    VueEllipseProgress,
  },
  props: {
    progress: {
      type: Number,
      required: true,
    },
    thickness: {
      type: Number,
      default: 14,
    },
    emptyThickness: {
      type: Number,
      default: 14,
    },
    size: {
      type: Number,
      default: 200,
    },
    emptyColor: {
      type: String,
      default: styles.whitesmoke,
    },
  },
  data() {
    return {
      styles,
    };
  },
};
</script>
