<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <span>
    <slot name="prepend" /><span
      aria-hidden="true"
      :class="`notranslate ${computedClass}`">
      {{ name }}
    </span><slot name="default" />
  </span>
</template>

<script>
/**
 * Material icon
 */
export default {
  name: 'Icon',
  props: {
    iconClass: {
      type: String,
      default: '',
    },
    /**
     * Icon name
     */
    name: {
      type: String,
      required: true,
    },
    /**
     * Use outline variant
     */
    outlined: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    computedClass() {
      const classes = [
        this.iconClass,
        this.outlined ? 'material-icons-outlined' : 'material-icons',
      ].join(' ');
      return classes;
    },
  },
};
</script>
