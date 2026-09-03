<!-- Copyright (c) 2026 Ping Identity. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="fr-bounce-loader"
    role="status"
    aria-busy="true">
    <span class="sr-only">
      {{ $t('common.loadingEtc') }}
    </span>
    <div
      class="fr-bounce-loader__dot-wrapper"
      :style="spinnerBasicStyle">
      <div
        class="fr-bounce-loader__dot spinner-primary"
        :style="spinnerStyle" />
      <div
        class="fr-bounce-loader__dot spinner-primary"
        :style="spinnerStyle" />
    </div>
  </div>
</template>

<script setup>
/**
 * Bouncing loader, heavily inspired by the existing vue-spinner implementation (MIT).
 * Only props actually used in the platform are kept.
 */
import { computed } from 'vue';
import styles from '@/scss/main.scss';

defineOptions({
  name: 'BounceLoader',
});

const props = defineProps({
  /**
   * Colour of the bouncing dots.
   */
  color: {
    type: String,
    // Themed `$primary`, exported by scss/main.scss. Call sites should pass a themed colour.
    default: styles.basecolor,
  },
  /**
   * Overall size of the loader (dots are the same size as the wrapper).
   */
  size: {
    type: Number,
    default: 60,
  },
});

const spinnerStyle = computed(() => ({
  backgroundColor: props.color,
  height: `${props.size}px`,
  width: `${props.size}px`,
  borderRadius: '100%',
  opacity: 0.6,
  position: 'absolute',
  top: 0,
  left: 0,
}));

const spinnerBasicStyle = computed(() => ({
  height: `${props.size}px`,
  width: `${props.size}px`,
  position: 'relative',
}));
</script>

<style scoped>
.fr-bounce-loader {
  text-align: center;
}

/* Dot animations are scoped here rather than inline so both dots can share one rule
   with staggered delays. */
.fr-bounce-loader__dot:nth-of-type(1) {
  animation: fr-bounceStretchDelay 2s 1s infinite ease-in-out;
  animation-fill-mode: both;
}

.fr-bounce-loader__dot:nth-of-type(2) {
  animation: fr-bounceStretchDelay 2s 0s infinite ease-in-out;
  animation-fill-mode: both;
}

@keyframes fr-bounceStretchDelay {
  0%,
  100% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.0);
  }
}
</style>
