<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-wrap">
    <div
      class="mr-2 mb-2"
      v-for="(reason, index) in reasons"
      :key="`reason-${reason}-${index}`"
    >
      <ExplainabilityBadge :title="reason" />
    </div>
  </div>
</template>
<script>
import ExplainabilityBadge from './Badge';

export default {
  name: 'Explainability',
  components: {
    ExplainabilityBadge,
  },
  props: {
    reasons: {
      default: () => [],
      type: Array,
    },
  },
};
</script>
