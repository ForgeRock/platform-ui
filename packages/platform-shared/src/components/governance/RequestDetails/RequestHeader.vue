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
          {{ requestedBy }}
        </span>
        <span class="text-muted ml-1">
          {{ $t('governance.accessRequest.submittedRequest') }}
        </span>
        <template v-if="requestedFor">
          <span class="text-muted ml-1">
            {{ $t('common.for').toLowerCase() }}
          </span>
          {{ requestedFor }}
        </template>
        <template v-if="requestedDate">
          <span class="text-muted ml-1">
            {{ $t('common.on').toLowerCase() }} {{ requestedDate }}
          </span>
        </template>
      </div>
    </BMediaBody>
  </BMedia>
</template>

<script setup>
import { computed } from 'vue';
import {
  BImg,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import {
  isTypeRole,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import dayjs from 'dayjs';
import i18n from '@/i18n';

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
});

const requestedBy = computed(() => {
  const value = props.item?.details?.requestedBy || null;
  if (value?.id === 'SYSTEM') return i18n.global.t('common.system');
  if (value?.givenName || value?.sn) return i18n.global.t('common.userFullName', { givenName: value.givenName, sn: value.sn });
  return value?.userName || '';
});

const requestedFor = computed(() => {
  const value = props.item?.details?.requestedFor || null;
  if (value?.givenName || value?.sn) return i18n.global.t('common.userFullName', { givenName: value.givenName, sn: value.sn });
  return value?.userName || '';
});

const requestedDate = computed(() => {
  if (!props.item?.details?.date) return '';
  return dayjs(props.item.details.date).format('MMM D, YYYY');
});

</script>
