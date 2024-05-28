<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

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
      class="access-request-list"
      thead-class="d-none"
      tbody-tr-class="cursor-pointer d-flex justify-content-between border-top"
      hover
      :fields="fields"
      :items="items"
      @row-clicked="$emit('open-detail', $event);">
      <template #cell(details)="{ item }">
        <div class="mb-2">
          <small data-testid="request-type">
            {{ item.details.type }}
          </small>
        </div>
        <BMedia
          no-body
          class="mb-2">
          <BMediaAside class="align-self-center">
            <FrIcon
              v-if="isTypeRole(item.rawData.requestType)"
              icon-class="mr-1 md-28 rounded-circle"
              :name="item.details.icon" />
            <BImg
              v-else
              width="24"
              height="24"
              class="align-self-center"
              :src="item.details.icon"
              :alt="$t('common.logo')" />
          </BMediaAside>
          <BMediaBody>
            <h2
              class="m-0 h5"
              data-testid="request-item-name">
              {{ item.details.name }}
            </h2>
            <small
              class="text-muted"
              data-testid="request-item-description">
              {{ item.details.description }}
            </small>
          </BMediaBody>
        </BMedia>
        <BMedia
          no-body
          class="mb-2">
          <BMediaAside class="align-self-center mr-2">
            <BImg
              class="rounded-circle"
              height="18"
              width="18"
              :alt="item.details.requestedFor.givenName"
              :aria-hidden="true"
              :src="item.details.requestedFor.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          </BMediaAside>
          <BMediaBody class="align-self-center">
            <div
              class="text-truncate"
              data-testid="request-item-user">
              {{ $t('common.userFullName', { givenName: item.details.requestedFor.givenName, sn: item.details.requestedFor.sn }) }}
            </div>
          </BMediaBody>
        </BMedia>
        <div class="d-flex align-items-center">
          <div>
            <small
              class="text-muted"
              data-testid="request-item-date">
              {{ getDateString(item.details.date) }}
            </small>
          </div>
          <span
            style="padding-bottom: 5px;"
            class="mx-2 opacity-50">
            .
          </span>
          <div>
            <small
              class="text-muted"
              data-testid="request-item-id">
              {{ $t('governance.accessRequest.idLabel', { id: item.details.id }) }}
            </small>
          </div>
          <div class="ml-2">
            <BImg
              height="24"
              :src="getPriorityImageSrc(item.details.priority)" />
          </div>
        </div>
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
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import { ref, watch } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import getPriorityImageSrc, { buildRequestDisplay, getRequestObjectType } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';

const prop = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  requests: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['open-detail']);

const items = ref([]);
const fields = ref([
  {
    key: 'details',
    label: '',
    class: 'border-top-0',
  },
  {
    key: 'actions',
    label: '',
    class: 'd-flex align-items-center border-top-0',
  },
]);

watch(() => prop.requests, (newRequests) => {
  items.value = buildRequestDisplay(newRequests);
}, { immediate: true });

/**
 * Gets a user friendly date string from an ISO date
 * @param {String} date ISO formatted date string
 * @returns {String} user friendly formatted string
 */
function getDateString(date) {
  if (!date) return '';
  return dayjs(date).format('MMM D, YYYY');
}

/**
 * Checks if it is role type according to the type of request
 * @param {String} requestType type of the request
 * @returns {Boolean} value to determine if it is a role or not
 */
function isTypeRole(requestType) {
  return getRequestObjectType(requestType) === 'role';
}
</script>
<style lang="scss" scoped>
.w-200px {
  width: 200px;
}
</style>
