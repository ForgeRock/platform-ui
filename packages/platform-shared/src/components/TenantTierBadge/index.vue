<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BBadge
    :class="`bg-white border my-auto mr-2 ${tierColor}-tenant tenant-badge`"
    data-testid="tenant-tier-badge">
    {{ $t(`tenantTierAbbreviation.${tenantTier}`) }}
  </BBadge>
</template>

<script>
import { BBadge } from 'bootstrap-vue';
import { getTierColor } from '@forgerock/platform-shared/src/utils/tenantTier';

/**
 * Shows a bootstrap badge with a border colour and text content that represents a given ID cloud tenant tier
 */
export default {
  name: 'TenantTierBadge',
  components: {
    BBadge,
  },
  props: {
    tenantTier: {
      type: String,
      default: 'other',
    },
  },
  data() {
    return {
      tierColor: getTierColor(this.tenantTier),
    };
  },
};
</script>
