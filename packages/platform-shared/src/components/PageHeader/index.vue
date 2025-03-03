<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <h5
      v-if="topText"
      class="text-muted mb-2"
    >
      {{ topText }}
    </h5>
    <h1 :class="[{'d-inline': isBeta}]">
      {{ title }}
    </h1>
    <BBadge
      v-if="isBeta"
      class="beta-badge align-top ml-2 mt-4"
      pill
      variant="primary">
      {{ $t('common.beta') }}
    </BBadge>
    <p
      v-if="subtitle !== ''"
      class="text-muted mb-4">
      {{ subtitle }}
    </p>
  </div>
</template>

<script>
import { BBadge } from 'bootstrap-vue';

/**
 * Standard page header
 */
export default {
  name: 'PageHeader',
  components: { BBadge },
  props: {
    /**
     * Show the beta badge or not
     */
    isBeta: {
      type: Boolean,
      default: false,
    },
    /**
     * Main text displayed in large font.
     */
    title: {
      type: String,
      default: '',
    },
    /*
     * Muted text to be shown above the title
     */
    topText: {
      type: String,
      default: '',
    },
    /**
     * Smaller text displayed below title.
     */
    subtitle: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
  .beta-badge {
    margin-top: 9px;
  }
</style>
