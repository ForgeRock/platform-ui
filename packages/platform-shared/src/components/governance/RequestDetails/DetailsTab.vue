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
        <BCol lg="6">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.externalRequestId`) }}
          </small>
          {{ details.externalRequestId || blankValueIndicator }}
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
      <BRow v-if="details.statusRaw === 'suspended'" class="mb-4">
        <BCol
          lg="6"
          md="12"
          sm="12">
          <small class="d-block mb-2">
            {{ $t(`governance.requestModal.detailsTab.resumeDate`) }}
          </small>
          <span class="mr-2">
            {{ dayjs(details.resumeDate).format('MMM D, YYYY h:mm A') }}
          </span>
          <span class="mb-2">
            <BButton
              v-if="type === detailTypes.ADMIN_REQUEST"
              variant="link"
              class="ml-0 pl-0 pt-0 pb-1"
              @click="openResumeDateModal">
              <FrIcon
                name="edit">
                {{ $t(`common.edit`) }}
              </FrIcon>
            </BButton>
          </span>
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
    <FrUpdateResumeDateModal
      v-if="details"
      :loading="savingRequest"
      :current-resume-date="details.resumeDate"
      @update-resume-date="updateResumeDate" />
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
import { find, startsWith } from 'lodash';
import dayjs from 'dayjs';
import {
  BButton,
  BBadge,
  BCol,
  BImg,
  BRow,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { requestAction, updateRequestResumeDate } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getPriorityImageSrc, detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrRequestFormManager from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestFormManager';
import FrUpdateResumeDateModal from '@forgerock/platform-shared/src/components/governance/RequestDetails/UpdateResumeDateModal';
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

const emit = defineEmits(['update-item']);
const { bvModal } = useBvModal();
const details = ref(null);
const savingRequest = ref(false);
const phaseId = computed(() => props.item.rawData.phases?.[0]?.name);

/**
 * Shows the "Update Resume Date" modal
 */
function openResumeDateModal() {
  bvModal.value.show('UpdateResumeDateModal');
}

/**
 * Closes the "Update Resume Date" modal
 */
function closeModal() {
  bvModal.value.hide('UpdateResumeDateModal');
}

function setDecisionValue(type) {
  switch (type) {
    case 'approved':
      return {
        name: i18n.global.t('governance.decisions.approved'),
        variant: 'success',
      };
    case 'suspended':
      return {
        name: i18n.global.t('governance.decisions.suspended'),
        variant: 'warning',
      };
    case 'cancelled':
      return {
        name: i18n.global.t('governance.decisions.canceled'),
        variant: 'warning',
      };
    case 'rejected':
      return {
        name: i18n.global.t('governance.decisions.rejected'),
        variant: 'danger',
      };
    default:
      return {
        name: i18n.global.t('governance.decisions.pending'),
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
 * Returns request status
 * @param {Object} decision Request decision object
 * @returns {String} Request status
 */
function getStatus(decision) {
  return decision?.decision || decision?.status;
}

/**
 * Retrieves the details for a given item.
 *
 * @param {Object} item - The item for which to retrieve the details.
 * @returns {Object} - The details of the item.
 */
function getDetails(item) {
  const waitTask = find(item.rawData.decision?.phases, (phase) => startsWith(phase.name, 'waitTask'));
  const newDetails = {
    externalRequestId: item.rawData.request?.common?.externalRequestId,
    requestId: item.details.id,
    resumeDate: waitTask?.events?.scheduled?.date,
    waitTaskId: waitTask?.name,
    status: setDecisionValue(getStatus(item.rawData.decision)),
    statusRaw: getStatus(item.rawData.decision),
    priority: item.details.priority || null,
    justification: item.rawData.request?.common?.justification,
    outcome: setOutcomeValue(item.rawData.decision?.outcome),
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
 * Updates a suspended request's resume date.
 *
 * @param {Object} values - The values to modify the request with.
 */
async function updateResumeDate(newResumeTime, justification) {
  savingRequest.value = true;
  const payload = {
    events: {
      scheduled: {
        date: newResumeTime,
      },
    },
  };
  try {
    await updateRequestResumeDate(props.item.rawData.id, details.value.waitTaskId, payload);
    await requestAction(props.item.rawData.id, 'comment', phaseId.value, { comment: justification });
    displayNotification('success', i18n.global.t('governance.accessRequest.requestSaveSuccess'));
    closeModal(newResumeTime);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.requestSaveError'));
  } finally {
    savingRequest.value = false;
    emit('update-item');
  }
}

onMounted(() => {
  details.value = getDetails(props.item);
});
</script>
