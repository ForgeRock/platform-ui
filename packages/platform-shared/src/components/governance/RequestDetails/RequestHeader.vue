<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

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
          v-else-if="isTypeRole(item.rawData.requestType) || isTypeLcm(item.rawData.requestType)"
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
      <div class="d-flex flex-column-reverse">
        <h1
          :class="[item.details.name ? 'mb-1 text-truncate' : 'h5 text-muted']">
          {{ item.details.name || item.details.type }}
        </h1>
        <h2
          v-if="item.details.name"
          class="h5 text-muted mb-1">
          {{ item.details.type }}
        </h2>
      </div>
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
  <slot name="request-actions" />
  <BCard
    v-if="!isDraft && details"
    class="mb-4">
    <div>
      <BRow class="mt-2">
        <BCol sm="3">
          <div class="d-inline mr-2 mb-2 label-text">
            {{ $t(`governance.requestModal.detailsTab.status`) }}:
          </div>
          <BBadge
            class="px-4"
            :variant="details.status.variant">
            {{ details.status.name }}
          </BBadge>
        </BCol>
        <BCol
          sm="3">
          <div class="d-inline mr-2 mb-2 mt-2 label-text">
            {{ $t(`governance.requestModal.detailsTab.decision`) }}:
          </div>
          <BBadge
            v-if="details.decision"
            class="px-4"
            :variant="details.decision.variant">
            {{ details.decision.name }}
          </BBadge>
        </BCol>
        <BCol
          sm="3">
          <div class="d-inline mr-2 mb-2 mt-2 label-text">
            {{ $t(`governance.requestModal.detailsTab.outcome`) }}:
          </div>
          <BBadge
            v-if="details.outcome"
            class="px-4"
            :variant="details.outcome.variant">
            {{ details.outcome.name }}
          </BBadge>
          <BBadge
            v-else
            class="px-4"
            variant="warning">
            {{ $t('governance.decisions.pending') }}
          </BBadge>
        </BCol>
        <BCol sm="3">
          <BButton
            variant="link"
            class="p-0"
            aria-controls="request-additional-details"
            @click="showAllDetails = !showAllDetails">
            {{ $t('common.showAdditionalDetails') }}
            <FrIcon
              :name="showAllDetails ? 'keyboard_arrow_down' : 'keyboard_arrow_right'" />
          </BButton>
        </BCol>
      </BRow>
      <BCollapse
        id="request-additional-details"
        :visible="showAllDetails">
        <BRow
          class="mt-2">
          <BCol
            md="6"
            sm="12">
            <div class="d-inline mr-2 mb-2 label-text">
              {{ $t(`governance.request.requestId`) }}:
            </div>
            <span>{{ details.requestId }}</span>
          </BCol>
          <BCol
            md="6"
            sm="12">
            <div class="d-inline mr-2 mb-2 label-text">
              {{ $t(`governance.request.externalRequestId`) }}:
            </div>
            <span>{{ details.externalRequestId ?? blankValueIndicator }}</span>
          </BCol>
        </BRow>
        <BRow
          class="mt-2">
          <BCol
            md="6"
            sm="12">
            <div class="d-inline mr-2 mb-2 label-text">
              {{ $t(`common.priority`) }}:
            </div>
            <span>{{ details.priority ?? blankValueIndicator }}</span>
          </BCol>
          <BCol
            md="12"
            sm="12"
            class="mt-2">
            <div class="d-inline mr-2 mb-2 label-text">
              {{ $t(`governance.request.justification`) }}:
            </div>
            <span>{{ details.justification ?? blankValueIndicator }}</span>
          </BCol>
        </BRow>
      </BCollapse>
    </div>
  </BCard>
</template>

<script setup>
import {
  onMounted,
  ref,
} from 'vue';
import {
  BCard,
  BCol,
  BCollapse,
  BImg,
  BMedia,
  BMediaBody,
  BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { isTypeRole, isTypeLcm } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

const details = ref(null);
const showAllDetails = ref(false);

const props = defineProps({
  isDraft: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
});

/**
 * Set the decision value based on type and status.
 * @param {String} type - The outcome of the request.
 * @param {String} status - The current status of the request.
 * @returns {Object} - The decision name and variant.
 */
function setDecisionValue(type, status) {
  switch (type) {
    case 'approved':
      return {
        name: i18n.global.t('governance.decisions.approved'),
        variant: 'success',
      };
    case 'rejected':
      return {
        name: i18n.global.t('governance.decisions.rejected'),
        variant: 'danger',
      };
    default:
      if (status === 'complete' || status === 'cancelled') {
        return {};
      }
      return {
        name: i18n.global.t('governance.decisions.pending'),
        variant: 'warning',
      };
  }
}

/**
 * Set the status value based on type.
 * @param {String} type - The outcome of the request.
 * @returns {Object} - The status name and variant.
 */
function setStatusValue(type) {
  switch (type) {
    case 'suspended':
      return {
        name: i18n.global.t('governance.status.suspend'),
        variant: 'warning',
      };
    case 'cancelled':
      return {
        name: i18n.global.t('governance.status.canceled'),
        variant: 'danger',
      };
    case 'complete':
      return {
        name: i18n.global.t('governance.status.complete'),
        variant: 'success',
      };
    case 'provisioning':
      return {
        name: i18n.global.t('common.provisioning'),
        variant: 'warning',
      };
    default:
      return {
        name: i18n.global.t('governance.status.in-progress'),
        variant: 'warning',
      };
  }
}

/**
 * Set the outcome value based on type.
 * @param {String} type - The outcome of the request.
 * @returns {Object} - The outcome name and variant.
 */
function setOutcomeValue(type) {
  switch (type) {
    case 'provisioned':
      return {
        name: i18n.global.t('governance.outcomes.provisioned'),
        variant: 'success',
      };
    case 'not provisioned':
      return {
        name: i18n.global.t('governance.outcomes.notProvisioned'),
        variant: 'danger',
      };
    case 'denied':
      return {
        name: i18n.global.t('governance.decisions.denied'),
        variant: 'danger',
      };
    case 'pending':
      return {
        name: i18n.global.t('common.pending'),
        variant: 'warning',
      };
    case 'cancelled':
      return {
        name: i18n.global.t('governance.decisions.canceled'),
        variant: 'danger',
      };
    case 'fulfilled':
      return {
        name: i18n.global.t('governance.decisions.fulfilled'),
        variant: 'success',
      };
    default:
      return null;
  }
}

/**
 * Builds the status details object.
 * @param {Object} item - The request item.
 * @returns {Object} - The status details object.
 */
function getStatusDetails(item) {
  const newDetails = {
    status: setStatusValue(item.rawData?.decision?.status),
    decision: setDecisionValue(item.rawData?.decision?.decision, item.rawData?.decision?.status),
    outcome: setOutcomeValue(item.rawData.decision?.outcome),
    externalRequestId: item.rawData.request?.common?.externalRequestId,
    requestId: item.details.id,
    priority: item.details.priority || null,
    justification: item.rawData.request?.common?.justification,
  };

  return newDetails;
}

onMounted(() => {
  details.value = getStatusDetails(props.item);
});

</script>

<style lang="scss" scoped>
  .label-text {
    font-weight: 600;
  }
</style>
