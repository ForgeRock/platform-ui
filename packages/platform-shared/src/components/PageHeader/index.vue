<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <h1>
      {{ title }}
    </h1>
    <p
      v-if="subtitle !== ''"
      class="text-muted mb-4">
      {{ subtitle }}
    </p>
  </div>
</template>

<script>

/**
 * Standard page header
 */
export default {
  name: 'PageHeader',
  props: {
    /**
     * Main text displayed in large font.
     */
    title: {
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
