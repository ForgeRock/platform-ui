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
              class="mr-1 md-28 rounded-circle"
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
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import getPriorityImageSrc, { isTypeRole } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';

export default {
  name: 'DetailsTab',
  components: {
    BRow,
    BCol,
    BMedia,
    BMediaBody,
    BImg,
    BBadge,
    FrIcon,
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
      requested: {
        icon: this.item.details.icon,
        name: this.item.details.name,
        description: this.item.details.description,
      },
      requestedFor: {
        ...this.item.details.requesteeInfo,
      },
      requestId: this.item.details.id,
      requestDate: dayjs(this.item.details.date).format('MMM D, YYYY h:mm A'),
      requestType: this.item.details.type,
      status: this.setDecisionValue(this.item.rawData.decision.decision),
      priority: this.item.details.priority,
      justification: this.item.rawData.request.common.justification,
    };
  },
  methods: {
    getPriorityImageSrc,
    isTypeRole,
    setDecisionValue(type) {
      switch (type) {
        case 'approved':
          return {
            name: this.$t('governance.decisions.approved'),
            variant: 'success',
          };
        case 'cancelled':
          return {
            name: this.$t('governance.decisions.canceled'),
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
