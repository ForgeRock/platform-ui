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
              class="mr-1 md-28 rounded-circle"
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
              :alt="item.details.requesteeInfo.givenName"
              :aria-hidden="true"
              :src="item.details.requesteeInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          </BMediaAside>
          <BMediaBody class="align-self-center">
            <div
              class="text-truncate"
              data-testid="request-item-user">
              {{ item.details.requesteeInfo.givenName }} {{ item.details.requesteeInfo.sn }}
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

<script>
import {
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import getPriorityImageSrc, { buildRequestDisplay, getRequestObjectType } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';

/**
 * A table that displays an array of access request objects
 */
export default {
  name: 'AccessRequestList',
  components: {
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrIcon,
    FrSpinner,
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    requests: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      items: [],
      fields: [
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
      ],
    };
  },
  watch: {
    requests: {
      immediate: true,
      handler(requestList) {
        this.items = buildRequestDisplay(requestList);
      },
    },
  },
  methods: {
    getPriorityImageSrc,
    /**
     * Gets a user friendly date string from an ISO date
     * @param {String} date ISO formatted date string
     * @returns {String} user friendly formatted string
     */
    getDateString(date) {
      if (!date) return '';
      return dayjs(date).format('MMM D, YYYY');
    },
    isTypeRole(requestType) {
      return getRequestObjectType(requestType) === 'role';
    },
  },
};
</script>
<style lang="scss" scoped>
.w-200px {
  width: 200px;
}
</style>
