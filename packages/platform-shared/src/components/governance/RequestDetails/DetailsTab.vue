<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="p-4">
      <div
        v-if="details"
        class="bg-light p-4 rounded mb-3">
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
        <BRow>
          <BCol lg="12">
            <small class="d-block mb-2">
              {{ $t(`governance.requestModal.detailsTab.justification`) }}
            </small>
            {{ details.justification || blankValueIndicator }}
          </BCol>
        </BRow>
      </div>
      <FrFormBuilder
        v-if="form"
        class="pt-4"
        @is-valid="isValidForm = $event"
        @update:model-value="formValue = $event"
        :model-value="formValue"
        :read-only="readOnly"
        :schema="form.form?.fields" />
      <FrDefaultEntitlementForm
        v-if="showEntitlementForm"
        :application-id="applicationId"
        :entitlement="entitlement"
        :object-type="objectType"
        :read-only="readOnly"
        :type="requestType === requestTypes.CREATE_ENTITLEMENT.value ? 'CREATE' : 'MODIFY'"
        @update:glossaryValues="glossaryValues = $event"
        @update:entitlementValues="entitlementValues = $event" />
    </div>
    <div
      v-if="showSaveButton"
      class="border-top p-4 d-flex justify-content-end">
      <FrButtonWithSpinner
        @click="modifyRequest(formValue)"
        :disabled="savingRequest || !isValidForm"
        :show-spinner="savingRequest"
        variant="primary" />
    </div>
  </div>
</template>

<script setup>
/**
 * Displays the details of the item
 * @component DetailsTab
 * @prop {Object} item - All details info
 */
import {
  computed,
  onMounted,
  ref,
} from 'vue';
import { cloneDeep } from 'lodash';
import {
  BBadge,
  BCol,
  BImg,
  BRow,
} from 'bootstrap-vue';
import {
  getApplicationRequestForm,
  getCustomRequestForm,
  getWorkflowRequestForm,
} from '@forgerock/platform-shared/src/utils/governance/requestFormAssignments';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getPriorityImageSrc, isSupportedRequestType, requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrDefaultEntitlementForm from '@forgerock/platform-shared/src/components/governance/DefaultEntitlementForm';
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
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const details = ref(null);
const form = ref(null);
const formValue = ref({});
const savingRequest = ref(false);
const isValidForm = ref(false);

const entitlement = ref({});
const entitlementValues = ref({});
const glossaryValues = ref({});
const showEntitlementForm = ref(false);
const applicationId = ref('');
const objectType = ref('');

const phaseId = computed(() => props.item.rawData.phases?.[0]?.name);
const isCustom = computed(() => !isSupportedRequestType(props.item.rawData.requestType));
const requestType = computed(() => props.item?.rawData?.requestType || '');
const showSaveButton = computed(() => (
  (form?.value?.form?.fields
    || requestType.value === requestTypes.MODIFY_ENTITLEMENT.value
    || requestType.value === requestTypes.CREATE_ENTITLEMENT.value
  ) && !props.readOnly));

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
  const newDetails = {
    externalRequestId: item.rawData.request?.common?.externalRequestId,
    requestId: item.details.id,
    status: setDecisionValue(getStatus(item.rawData.decision)),
    priority: item.details.priority || null,
    justification: item.rawData.request?.common?.justification,
    outcome: setOutcomeValue(item.rawData.decision?.outcome),
  };

  return newDetails;
}

/**
 * Retrieves the form for the specified item.
 *
 * @param {Object} item - The item for which to retrieve the form.
 */
async function getForm(item) {
  const request = cloneDeep(item.rawData);
  const workflowId = request.workflow?.id;
  let formDefinition;

  // when viewing an approval request, show the form associated with the workflow phase
  if (props.isApproval && workflowId) {
    formDefinition = await getWorkflowRequestForm(workflowId, phaseId.value);
    if (formDefinition) {
      form.value = formDefinition;
      if (isCustom.value) formValue.value = request.request || {};
      else formValue.value = request.request?.common?.blob?.form || {};
      return;
    }
  }

  // when viewing a custom request outside of approvals, show the form assocated with the request type
  if (isCustom.value && !props.isApproval) {
    formDefinition = await getCustomRequestForm(requestType.value);
    form.value = formDefinition;
    formValue.value = request.request || {};
    return;
  }

  // fallback to the default form if the workflow request form is not available
  if (requestType.value === requestTypes.ACCOUNT_GRANT.value) {
    formDefinition = await getApplicationRequestForm(request.application, request.application.id);
    form.value = formDefinition;
    formValue.value = request.request?.common?.blob?.form || {};
    return;
  }

  if (requestType.value === requestTypes.MODIFY_ENTITLEMENT.value || requestType.value === requestTypes.CREATE_ENTITLEMENT.value) {
    entitlement.value = {
      entitlement: { ...request.request?.entitlement?.object || {} },
      glossary: { idx: { '/entitlement': request.request?.entitlement?.glossary || {} } },
    };
    applicationId.value = request.application.id;
    objectType.value = requestType.value === requestTypes.CREATE_ENTITLEMENT.value
      ? request.request?.entitlement?.objectType
      : request.application?.objectTypes?.find((type) => type.accountAttribute === request.assignment?.attributes?.[0]?.name)?.name || '';
    showEntitlementForm.value = true;
    isValidForm.value = true;
  }
}

/**
 * Generates the entitlement request payload.
 *
 * @param {Object} requestPayload - The initial request payload object.
 * @param {Object} glossary - A glossary object containing relevant terms and definitions.
 * @param {Object} object - An object containing additional data required for the request.
 * @returns {Object} - The modified request payload with entitlement details.
 */
function getEntitlementRequestPayload(requestPayload, glossary, object) {
  requestPayload.entitlement = {
    ...requestPayload.entitlement,
    object: {
      ...requestPayload.entitlement.object,
      ...object,
    },
    glossary: {
      ...requestPayload.entitlement.glossary,
      ...glossary,
    },
  };
  return requestPayload;
}

/**
 * Modifies a request with the provided values.
 *
 * @param {Object} values - The values to modify the request with.
 */
async function modifyRequest(values) {
  savingRequest.value = true;

  try {
    let requestPayload = cloneDeep(props.item.rawData.request);

    if (isCustom.value) {
      requestPayload = values;
    } else if (requestType.value === requestTypes.MODIFY_ENTITLEMENT.value || requestType.value === requestTypes.CREATE_ENTITLEMENT.value) {
      requestPayload = getEntitlementRequestPayload(requestPayload, glossaryValues.value, entitlementValues.value);
    } else {
      if (!requestPayload.common.blob) requestPayload.common.blob = {};
      requestPayload.common.blob.form = {
        ...requestPayload.common.blob.form,
        ...values,
      };
    }
    await requestAction(props.item.rawData.id, 'modify', phaseId.value, requestPayload);
    displayNotification('success', i18n.global.t('governance.accessRequest.requestSaveSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.requestSaveError'));
  } finally {
    savingRequest.value = false;
  }
}

onMounted(() => {
  details.value = getDetails(props.item);
  getForm(props.item);
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
