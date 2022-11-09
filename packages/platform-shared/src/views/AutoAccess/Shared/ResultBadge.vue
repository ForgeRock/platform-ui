<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <span>
    <BBadge
      pill
      class="text-capitalize"
      :variant="result === 'success' ? 'success' : 'danger'"
    >
      {{ result }}
    </BBadge>
  </span>
</template>

<script>
import { BBadge } from 'bootstrap-vue';

export default {
  name: 'ResultBadge',
  components: {
    BBadge,
  },
  props: {
    result: {
      type: String,
      default: '',
    },
  },
};
</script>
