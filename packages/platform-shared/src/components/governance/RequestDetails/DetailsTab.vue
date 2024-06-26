<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <BRow
      v-for="(detail, key) in details"
      :key="key"
      class="row-height"
    >
      <BCol
        lg="4"
        class="font-weight-bold">
        {{ $t(`governance.requestModal.detailsTab.${key}`) }}
      </BCol>
      <BCol
        lg="8"
        class="mb-4">
        <BBadge
          v-if="key === 'status'"
          class="px-4"
          :variant="detail.variant">
          {{ detail.name }}
        </BBadge>
        <BMedia
          v-else-if="key === 'requested'">
          <template #aside>
            <FrIcon
              v-if="isTypeRole(item.rawData.requestType)"
              icon-class="mr-1 md-28 rounded-circle"
              :name="item.details.icon" />
            <BImg
              v-else
              height="24"
              class="mt-2"
              :src="detail.icon" />
          </template>
          <BMediaBody>
            <p class="h5 m-0">
              {{ detail.name }}
            </p>
            <small class="mb-0">
              {{ detail.description }}
            </small>
          </BMediaBody>
        </BMedia>
        <BMedia
          v-else-if="key === 'requestedFor' || key === 'requestedBy'">
          <template #aside>
            <BImg
              class="rounded-circle"
              height="28"
              width="28"
              alt=""
              :aria-hidden="true"
              :src="detail.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          </template>
          <BMediaBody>
            <p class="h5 m-0">
              {{ $t('common.userFullName', { givenName: detail.givenName, sn: detail.sn }) }}
            </p>
            <small class="mb-0">
              {{ detail.userName }}
            </small>
          </BMediaBody>
        </BMedia>
        <span
          v-else-if="key === 'priority'">
          <BImg
            class="mr-3"
            height="24"
            :src="getPriorityImageSrc(detail)" />
          {{ $t(`governance.accessRequest.priorities.${detail}Priority`) }}
        </span>
        <p
          v-else
          class="font-weight-normal">
          {{ detail || blankValueIndicator }}
        </p>
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
/**
 * Displays the details of the item
 * @component DetailsTab
 * @prop {Object} item - All details info
 */
import {
  BRow,
  BCol,
  BMedia,
  BMediaBody,
  BImg,
  BBadge,
} from 'bootstrap-vue';
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import getPriorityImageSrc, { isTypeRole } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const details = ref({});

function setDecisionValue(type) {
  switch (type) {
    case 'approved':
      return {
        name: i18n.global.t('governance.decisions.approved'),
        variant: 'success',
      };
    case 'cancelled':
      return {
        name: i18n.global.t('governance.decisions.canceled'),
        variant: 'light',
      };
    case 'rejected':
      return {
        name: i18n.global.t('governance.decisions.rejected'),
        variant: 'danger',
      };
    default:
      return {
        name: i18n.global.t('governance.decisions.pending'),
        variant: 'light',
      };
  }
}

/**
 * Returns request status
 * @param {Object} decision Request decision object
 * @returns {String} Request status
 */
function getStatus(decision) {
  return decision.decision || decision.status;
}

onMounted(() => {
  details.value = {
    requested: {
      icon: props.item.details.icon,
      name: props.item.details.name,
      description: props.item.details.description,
    },
    requestedFor: {
      ...props.item.details.requestedFor,
    },
    requestedBy: {
      ...props.item.details.requestedBy,
    },
    requestId: props.item.details.id,
    requestDate: dayjs(props.item.details.date).format('MMM D, YYYY h:mm A'),
    requestType: props.item.details.type,
    status: setDecisionValue(getStatus(props.item.rawData.decision)),
    priority: props.item.details.priority,
    justification: props.item.rawData.request.common.justification,
  };
});
</script>

<style lang="scss" scoped>
.row-height {
  min-height: 52.5px;

  p {
    margin-bottom: 0px;
  }
}
</style>
