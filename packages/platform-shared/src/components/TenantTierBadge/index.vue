<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BBadge
    class="'badge-light bg-white border my-auto mr-2"
    :class="styling[tenantTier]"
    data-testid="tenant-tier-badge">
    {{ $t(`tenantTierAbbreviation.${tenantTier}`) }}
  </BBadge>
</template>

<script>
import { BBadge } from 'bootstrap-vue';

/**
 * Shows a bootstrap badge with a border colour and text content that represents a given ID cloud tenant tier
 */
export default {
  name: 'TenantTierBadge',
  components: {
    BBadge,
  },
  data() {
    return {
      styling: {
        dev: 'border-primary text-primary',
        staging: 'border-warning text-warning',
        prod: 'border-success text-success',
        other: 'border-darkened text-secondary',
      },
    };
  },
  props: {
    tenantTier: {
      type: String,
      default: 'other',
    },
  },
};
</script>
