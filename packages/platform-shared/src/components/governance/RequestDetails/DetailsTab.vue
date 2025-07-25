<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div
      v-if="details"
      class="bg-light p-4 m-4 rounded mb-3">
      <BRow class="mb-4">
        <BCol lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.status`) }}
          </small>
          <BBadge
            class="px-4"
            :variant="details.status.variant">
            {{ details.status.name }}
          </BBadge>
        </BCol>
        <BCol lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.requestId`) }}
          </small>
          {{ details.requestId }}
        </BCol>
      </BRow>
      <BRow class="mb-4">
        <BCol
          lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.decision`) }}
          </small>
          <BBadge
            v-if="details.decision"
            class="px-4"
            :variant="details.decision.variant">
            {{ details.decision.name }}
          </BBadge>
        </BCol>
        <BCol lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.priority`) }}
          </small>
          <template v-if="details.priority">
            <BImg
              alt=""
              class="mr-1"
              height="24"
              :src="getPriorityImageSrc(details.priority)" />
            {{ $t(`governance.accessRequest.priorities.${details.priority}Priority`) }}
          </template>
          <template v-else>
            {{ blankValueIndicator }}
          </template>
        </BCol>
      </BRow>
      <BRow class="mb-4">
        <BCol
          lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.outcome`) }}
          </small>
          <BBadge
            v-if="details.outcome"
            class="px-4"
            :variant="details.outcome.variant">
            {{ details.outcome.name }}
          </BBadge>
        </BCol>
        <BCol lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.externalRequestId`) }}
          </small>
          {{ details.externalRequestId || blankValueIndicator }}
        </BCol>
      </BRow>
      <BRow
        v-if="details.startDate || details.endDate"
        class="mb-4">
        <BCol lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.startDate`) }}
          </small>
          {{ getFormattedDate(details.startDate) }}
        </BCol>
        <BCol lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.endDate`) }}
          </small>
          {{ getFormattedDate(details.endDate) }}
        </BCol>
      </BRow>
      <BRow class="mb-4">
        <BCol lg="12">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.justification`) }}
          </small>
          {{ details.justification || blankValueIndicator }}
        </BCol>
      </BRow>
    </div>
    <FrRequestFormManager
      @save="modifyRequest"
      :saving-request="savingRequest"
      :is-approval="props.isApproval"
      :request="props.item?.rawData || {}"
      :read-only="props.readOnly"
    />
  </div>
</template>

<script setup>
/**
 * Displays the details of the item
 * @component DetailsTab
 * @prop {Boolean} isApproval - Flag to determine if this is an approval item
 * @prop {Object} item - Request details info
 * @prop {String} type - The details type for this item
 * @prop {Boolean} readOnly - Flag to determine if this item is read-only
 */
import {
  computed,
  onMounted,
  ref,
} from 'vue';
import dayjs from 'dayjs';
import {
  BBadge,
  BCol,
  BImg,
  BRow,
} from 'bootstrap-vue';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getPriorityImageSrc } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrRequestFormManager from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestFormManager';
import i18n from '@/i18n';

const props = defineProps({
  isApproval: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const details = ref(null);
const savingRequest = ref(false);
const phaseId = computed(() => props.item.rawData.phases?.[0]?.name);

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
 * Retrieves the details for a given item.
 *
 * @param {Object} item - The item for which to retrieve the details.
 * @returns {Object} - The details of the item.
 */
function getDetails(item) {
  const newDetails = {
    externalRequestId: item.rawData.request?.common?.externalRequestId,
    requestId: item.details.id,
    status: setStatusValue(item.rawData?.decision?.status),
    decision: setDecisionValue(item.rawData?.decision?.decision, item.rawData?.decision?.status),
    priority: item.details.priority || null,
    justification: item.rawData.request?.common?.justification,
    outcome: setOutcomeValue(item.rawData.decision?.outcome),
    startDate: item.rawData.request?.common?.startDate,
    endDate: item.rawData.request?.common?.endDate,
  };

  return newDetails;
}

/**
 * Modifies a request with the provided values.
 *
 * @param {Object} values - The values to modify the request with.
 */
async function modifyRequest(requestPayload) {
  savingRequest.value = true;

  try {
    await requestAction(props.item.rawData.id, 'modify', phaseId.value, requestPayload);
    displayNotification('success', i18n.global.t('governance.accessRequest.requestSaveSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.requestSaveError'));
  } finally {
    savingRequest.value = false;
  }
}

/**
 * Return a properly formatted date to display
 * @param date Date value
 */
function getFormattedDate(date) {
  if (!date) {
    return blankValueIndicator;
  }
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

onMounted(() => {
  details.value = getDetails(props.item);
});
</script>
