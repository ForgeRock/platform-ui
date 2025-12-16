<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BMedia
    class="align-items-center text-truncate"
    no-body>
    <div
      class="rounded-circle d-flex align-items-center justify-content-center mr-3 size-28">
      <FrIcon
        :name="getAccessIcon()" />
    </div>
    <BMediaBody class="text-truncate">
      <h4 class="h6 mb-1 text-truncate">
        {{ getAccessTypeDisplayName(access.type) }}
      </h4>
      <h3
        class="text-truncate w-100 m-0 h5">
        {{ access.displayName }}
      </h3>
    </BMediaBody>
  </BMedia>
</template>

<script setup>
/**
 * User access display component
 */
import { BMedia, BMediaBody } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getAccessTypeDisplayName } from '../../utils/accessUtility';
import accessConstants from '../../utils/accessConstants';

const props = defineProps({
  access: {
    type: Object,
    required: true,
  },
});

/**
 * Returns icon for access given the access's type
 */
function getAccessIcon() {
  return props.access.icon || accessConstants.NODE_ICONS[props.access.type]?.icon;
}
</script>

<style lang="scss" scoped>
.h5 {
  font-size: .875rem;
}

.h6 {
  font-size: .625rem;
  text-transform: uppercase;
  font-weight: 400;
}
</style>
