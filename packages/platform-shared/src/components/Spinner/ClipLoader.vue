<!-- Copyright (c) 2026 Ping Identity. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="fr-clip-loader"
    role="status"
    aria-busy="true">
    <span class="sr-only">
      {{ $t('common.loadingEtc') }}
    </span>
    <div
      class="fr-clip-loader__clip spinner-primary"
      :style="spinnerStyle" />
  </div>
</template>

<script setup>
/**
 * Clip loader, heavily inspired by the existing vue-spinner implementation (MIT).
 * Only props actually used in the platform are kept.
 */
import { computed } from 'vue';
import styles from '@/scss/main.scss';

defineOptions({
  name: 'ClipLoader',
});

const props = defineProps({
  /**
   * Colour of the spinning border.
   */
  color: {
    type: String,
    // Themed `$primary`, exported by scss/main.scss. Call sites should pass a themed colour.
    default: styles.basecolor,
  },
  /**
   * Overall size of the loader.
   */
  size: {
    type: Number,
    default: 35,
  },
});

const spinnerStyle = computed(() => ({
  height: `${props.size}px`,
  width: `${props.size}px`,
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: `${props.color} ${props.color} transparent`,
  borderRadius: '100%',
  background: 'transparent',
}));
</script>

<style scoped>
.fr-clip-loader {
  text-align: center;
}

.fr-clip-loader__clip {
  animation: fr-clipDelay 0.75s 0s infinite linear;
  animation-fill-mode: both;
  display: inline-block;
}

@keyframes fr-clipDelay {
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(180deg) scale(0.8);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
