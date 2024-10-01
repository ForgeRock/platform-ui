<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BMedia
    v-if="item.details"
    data-testId="request-detail-header"
    class="mb-4 align-items-center">
    <template #aside>
      <div class="d-flex align-items-center justify-content-center p-3 mr-2 rounded border border-darkened app-logo">
        <BImg
          v-if="item.details.isCustom"
          :src="require('@forgerock/platform-shared/src/assets/images/custom.svg')"
          :alt="$t('governance.accessRequest.customRequestAltText')"
          width="48"
          height="48" />
        <FrIcon
          v-else-if="isTypeRole(item.rawData.requestType)"
          icon-class="mr-1 md-48 rounded-circle"
          :name="item.details.icon" />
        <img
          v-else
          width="54"
          height="54"
          class="align-self-center"
          :onerror="onImageError"
          :src="item.details.icon"
          :alt="$t('common.logo')">
      </div>
    </template>
    <BMediaBody class="align-self-center text-truncate">
      <h2 class="h5 text-muted mb-1">
        {{ item.details.type }}
      </h2>
      <h1
        v-if="item.details.name"
        class="mb-1 text-truncate">
        {{ item.details.name }}
      </h1>
      <div>
        <span class="text-dark">
          {{ item.details.requestedBy }}
        </span>
        <span class="text-muted ml-1">
          {{ $t('governance.accessRequest.submittedRequest') }}
        </span>
        <template v-if="item.details.requestedFor">
          <span class="text-muted ml-1">
            {{ $t('common.for').toLowerCase() }}
          </span>
          {{ item.details.requestedFor }}
        </template>
        <template v-if="item.details.date">
          <span class="text-muted ml-1">
            {{ $t('common.on').toLowerCase() }} {{ item.details.date }}
          </span>
        </template>
      </div>
    </BMediaBody>
  </BMedia>
</template>

<script setup>
import {
  BImg,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { isTypeRole } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';

defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
});

</script>
