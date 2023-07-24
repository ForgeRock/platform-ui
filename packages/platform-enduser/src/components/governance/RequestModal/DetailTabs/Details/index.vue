<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <h2 class="h5 mb-4 pb-2">
      {{ $t('common.details') }}
    </h2>
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
          v-if="key === 'decision'"
          class="px-4"
          :variant="detail.variant">
          {{ detail.name }}
        </BBadge>
        <BMedia
          v-else-if="key === 'requested'">
          <template #aside>
            <BImg
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
          v-else-if="key === 'requestedFor'">
          <template #aside>
            <BImg
              class="rounded-circle"
              height="28"
              width="28"
              alt=""
              :aria-hidden="true"
              :src="item.details.requesteeInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
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

<script>
import {
  BRow,
  BCol,
  BMedia,
  BMediaBody,
  BImg,
  BBadge,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import resolveImage from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';

export default {
  name: 'RequestModalDetails',
  components: {
    BRow,
    BCol,
    BMedia,
    BMediaBody,
    BImg,
    BBadge,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blankValueIndicator,
      details: {},
    };
  },
  mounted() {
    this.details = {
      requestId: this.item.details.id,
      requestDate: dayjs(this.item.details.date).format('MMM D, YYYY h:mm A'),
      requestType: this.item.details.type,
      decision: this.setDecisionValue(this.item.rawData.decision.decision),
      requested: {
        icon: resolveImage(this.item.details.icon),
        name: this.item.details.name,
        description: this.item.details.description,
      },
      requestedFor: {
        ...this.item.details.requesteeInfo,
      },
      priority: this.item.details.priority,
      justification: this.item.rawData.request.common.justification,
    };
  },
  methods: {
    getPriorityImageSrc,
    setDecisionValue(type) {
      switch (type) {
        case 'approved':
          return {
            name: this.$t('governance.decisions.approved'),
            variant: 'success',
          };
        case 'cancelled':
          return {
            name: this.$t('governance.decisions.cancelled'),
            variant: 'light',
          };
        case 'rejected':
          return {
            name: this.$t('governance.decisions.rejected'),
            variant: 'danger',
          };
        default:
          return {
            name: this.$t('governance.decisions.pending'),
            variant: 'light',
          };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.row-height {
  min-height: 52.5px;

  p {
    margin-bottom: 0px;
  }
}
</style>
