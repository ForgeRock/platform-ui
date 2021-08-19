<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BBadge
    v-if="danger"
    variant="danger">
    {{ danger }}
  </BBadge>
  <BBadge
    v-else-if="light"
    variant="light">
    {{ light }}
  </BBadge>
  <BBadge
    v-else-if="success"
    variant="success">
    {{ success }}
  </BBadge>
  <BBadge
    v-else-if="warning"
    variant="warning">
    {{ warning }}
  </BBadge>
</template>

<script>
import {
  BBadge,
} from 'bootstrap-vue';

export default {
  name: 'BadgeCell',
  components: {
    BBadge,
  },
  props: {
    danger: {
      default: null,
      type: String,
    },
    light: {
      default: null,
      type: String,
    },
    success: {
      default: null,
      type: String,
    },
    warning: {
      default: null,
      type: String,
    },
  },
};
</script>
