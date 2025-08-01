<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot name="header" />
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <BTable
      v-else-if="items.length"
      :aria-label="listName"
      class="border-top mb-0"
      hover
      tbody-tr-class="cursor-pointer"
      :fields="fields"
      :items="items"
      @row-clicked="$emit('open-detail', $event);">
      <template #cell(details)="{ item }">
        <BMedia
          v-if="item.details"
          data-testId="request-detail-header"
          class="align-items-center">
          <BMediaBody class="align-self-center text-truncate">
            <h2 class="h5 mb-2">
              {{ item.itemName }}
            </h2>
            <div class="mb-1">
              <span class="text-dark mr-1">
                {{ item.details.requestedBy }}
              </span>
              <span class="text-muted mr-1">
                {{ $t('governance.accessRequest.submittedARequest') }}
              </span>
              <template v-if="item.details.requestedFor">
                <span class="text-muted mr-1">
                  {{ $t('common.for').toLowerCase() }}
                </span>
                <span class="text-dark">
                  {{ item.details.requestedFor }}
                </span>
              </template>
            </div>
            <div>
              <small
                class="text-muted">
                {{ $t('governance.accessRequest.idLabel', { id: item.details.id }) }}
              </small>
              <BImg
                :alt="getPriorityImageAltText(item.details.priority)"
                class="ml-2"
                height="24"
                :src="getPriorityImageSrc(item.details.priority)" />
            </div>
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(prediction)="{ item }">
        <FrRecommendationIcon
          v-if="Boolean(item.details.prediction)"
          :prediction="item.details.prediction"
          :auto-id-settings="autoIdSettings"
          type="approval"
          :id="item.details.id" />
      </template>
      <template #cell(resumeDate)="{ item }">
        <small class="text-muted">
          {{ getItemResumeDate(item) }}
        </small>
      </template>
      <template #cell(date)="{ item }">
        <small class="text-muted">
          {{ item.details.date }}
        </small>
      </template>
      <template #cell(actions)="{ item }">
        <slot
          name="actions"
          :item="item" />
      </template>
    </BTable>
    <template v-else>
      <slot name="no-data" />
    </template>
    <slot name="footer" />
  </div>
</template>

<script setup>
/**
 * Displays the list of Access Request.
 * @component AccessRequestList
 * @prop {Boolean} isLoading - Determines if the information is loading
 * @prop {Array} requests - All users requests
 */
import {
  BImg,
  BTable,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import {
  ref,
  watch,
  computed,
} from 'vue';
import dayjs from 'dayjs';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { buildRequestDisplay, getPriorityImageSrc, getPriorityImageAltText } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrRecommendationIcon from '@forgerock/platform-shared/src/components/governance/Recommendations/RecommendationIcon';
import i18n from '@/i18n';

const prop = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  requestStatus: {
    type: String,
    default: '',
  },
  requests: {
    type: Array,
    default: () => [],
  },
  listName: {
    type: String,
    default: '',
  },
  autoIdSettings: {
    type: Object,
    default: () => ({}),
  },
  schema: {
    type: Object,
    default: () => ({
      user: [],
    }),
  },
});

defineEmits(['open-detail']);

const items = ref([]);
const isAutoIdEnabled = computed(() => prop.autoIdSettings?.enableAutoId);
const fields = computed(() => {
  const fieldList = [
    {
      key: 'details',
      label: i18n.global.t('governance.accessRequest.newRequest.request'),
      class: 'w-65',
    },
    {
      key: 'date',
      label: i18n.global.t('governance.accessRequest.requestDate'),
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  if (isAutoIdEnabled.value) {
    fieldList.splice(1, 0, {
      key: 'prediction',
      label: i18n.global.t('governance.accessRequest.recommended'),
    });
  }

  if (prop.requestStatus === 'suspended') {
    fieldList.splice(1, 0, {
      key: 'resumeDate',
      label: i18n.global.t('governance.accessRequest.resumeDate'),
    });
  }

  return fieldList;
});

function getItemResumeDate(item) {
  return item.details.resumeDate ? dayjs(item.details.resumeDate).format('MMM D, YYYY') : null;
}

watch(() => prop.requests, (newRequests) => {
  items.value = buildRequestDisplay(newRequests, prop.autoIdSettings, prop.schema.user).map((item) => ({
    ...item,
    itemName: item.details?.isCustom || !item.details.name
      ? item.details.type
      : `${item.details.type}: ${item.details.name}`,
  }));
}, { immediate: true });

</script>
<style lang="scss" scoped>
.w-200px {
  width: 200px;
}

:deep(.w-65) {
  width: 65% !important;
}
</style>
