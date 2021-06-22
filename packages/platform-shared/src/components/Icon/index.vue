<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <i
    aria-hidden="true"
    :class="outlined ? `material-icons-outlined` : `material-icons`">
    {{ name }}
  </i>
</template>

<script>

/**
 * Material icon
 */
export default {
  name: 'Icon',
  props: {
    /**
     * Use outline variant
     */
    outlined: {
      type: Boolean,
      default: true,
    },
    /**
     * Icon name
     */
    name: {
      type: String,
      required: true,
    },
  },
};
</script>
