<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BListGroup>
    <BListGroupItem
      v-for="(entitlement, index) in entitlements"
      class="border-left-0 border-right-0"
      :key="index">
      <h3 class="h5 text-truncate">
        {{ entitlement.name }}
      </h3>
      <BMedia no-body>
        <BMediaAside>
          <img
            :src="getApplicationLogo(entitlement.app)"
            :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: entitlement.app })"
            class="mr-2"
            :onerror="onImageError"
            width="24">
        </BMediaAside>
        <BMediaBody class="align-self-center text-truncate">
          <h4 class="h5 mb-0 text-truncate">
            {{ entitlement.appName }}
          </h4>
          <small class="text-muted text-truncate">
            {{ entitlement.description }}
          </small>
        </BMediaBody>
      </BMedia>
    </BListGroupItem>
  </BListGroup>
</template>

<script setup>
import {
  BListGroup, BListGroupItem, BMedia, BMediaAside, BMediaBody,
} from 'bootstrap-vue';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';

/**
* component to display a list of entitlements
*/

defineProps({
  entitlements: {
    type: Array,
    default: () => [],
  },
});
</script>
