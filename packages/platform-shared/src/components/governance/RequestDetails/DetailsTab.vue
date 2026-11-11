<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrRequestRoleDetails
    v-if="isRoleRequestType && props.item?.rawData"
    @save="modifyRequest"
    :update-role="updateRoleData"
    :saving-request="savingRequest"
    :is-approval="props.isApproval"
    :item="props.item || {}"
    :request="props.item?.rawData || {}"
    :read-only="props.readOnly" />
  <template v-else-if="isAccountRequestType && props.item?.rawData">
    <BRow
      class="mb-2">
      <BCol
        class="mb-2"
        sm="12"
        :md="props.item?.rawData?.user ? '6' : '12'">
        <FrRequestedItemCard
          :request="{ ...props.item.rawData, application: accountApplication || props.item.rawData.application }"
          :request-type="requestType" />
      </BCol>
      <BCol
        v-if="props.item?.rawData?.user"
        class="mb-2"
        sm="12"
        md="6">
        <FrUserInfoCard :user="props.item.rawData.user" />
      </BCol>
    </BRow>
    <FrRequestAccountDetails
      v-if="showAccountRequestDetails"
      @save="modifyRequest"
      :saving-request="savingRequest"
      :request="props.item.rawData.request || {}"
      :request-type="requestType"
      :read-only="!isAccountRequestEditable" />
  </template>
  <BRow
    v-else-if="isOotbNoFormRequestType"
    class="mb-2">
    <BCol
      class="mb-2"
      sm="12"
      :md="props.item?.rawData?.user ? '6' : '12'">
      <FrRequestedItemCard
        :request="props.item?.rawData || {}"
        :glossary-schema="glossarySchema"
        :request-type="requestType" />
    </BCol>
    <BCol
      v-if="props.item?.rawData?.user"
      class="mb-2"
      sm="12"
      md="6">
      <FrUserInfoCard
        :manager="props.item.rawData.manager || null"
        :user="props.item.rawData.user" />
    </BCol>
  </BRow>
  <div
    v-if="!isRoleRequestType && isOOTBNoFormRequestType && details"
    class="bg-light p-4 mt-4 rounded mb-3">
    <BRow class="mb-4">
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
  </div>
  <div>
    <FrRequestFormManager
      @save="modifyRequest"
      @form-resolved="accountRequestFormResolved = $event"
      :saving-request="savingRequest"
      :is-approval="props.isApproval"
      :request="props.item?.rawData || {}"
      :read-only="props.readOnly"
    />
    <div
      v-if="isRoleRequestType"
      class="float-right d-flex justify-content-end m-4">
      <FrButtonWithSpinner
        v-if="!readOnly && isDraft"
        class="mr-2"
        variant="outline-primary"
        :disabled="isLoading"
        :show-spinner="isLoading"
        :button-text="$t('common.saveAsDraft')"
        @click="modifyRequestRoleData(true)" />
      <FrButtonWithSpinner
        v-if="!readOnly"
        variant="primary"
        :button-text="isDraft ? $t('common.submit') : $t('common.save')"
        :disabled="isLoading || savingRequest"
        :show-spinner="isLoading || savingRequest"
        @click="modifyRequestRoleData()" />
    </div>
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
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import { compact, map } from 'lodash';
import { requestAction, putCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { OOTB_NO_FORM_REQUEST_TYPES } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getApplication } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrRequestedItemCard from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestedItemCard';
import FrUserInfoCard from '@forgerock/platform-shared/src/components/governance/RequestDetails/UserInfoCard';
import FrRequestFormManager from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestFormManager';
import FrRequestRoleDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestRoleDetails';
import FrRequestAccountDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestAccountDetails';
import i18n from '@/i18n';

const router = useRouter();
const userStore = useUserStore();

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
  isDraft: {
    type: Boolean,
    default: false,
  },
});

const details = ref(null);
const savingRequest = ref(false);
const isLoading = ref(false);
const phaseId = computed(() => props.item.rawData.phases?.[0]?.name);
const requestType = computed(() => props.item.rawData.requestType);
const glossarySchema = ref({ application: [], entitlement: [], role: [] });
const accountApplication = ref(null);
const roleSchema = ref(null);
const requestRoleData = ref(null);
const isInitialized = ref(false);
const isOOTBNoFormRequestType = computed(() => OOTB_NO_FORM_REQUEST_TYPES.some((type) => type?.value === requestType?.value));
const isRoleRequestType = computed(() => ['createRole', 'modifyRole', 'publishRole', 'deleteRole'].includes(requestType.value));
const isAccountRequestType = computed(() => ['createAccount', 'modifyAccount', 'deleteAccount'].includes(requestType.value));
const isOotbNoFormRequestType = computed(() => OOTB_NO_FORM_REQUEST_TYPES.some((type) => type?.value === requestType.value));
// Agent requests resolve their target in RequestedItemCard; the glossary schema fetch only feeds application/entitlement/role cards
const isAgentRequestType = computed(() => ['createAgent', 'modifyAgent', 'deleteAgent'].includes(requestType.value));
/**
 * Finds the active actor entry, if any, that corresponds to the current user —
 * preferring one scoped to the request's current phase, and falling back to any
 * matching-user entry otherwise.
 */
const currentUserActor = computed(() => {
  const activeActors = props.item?.rawData?.decision?.actors?.active || [];
  const matchesCurrentUser = (actor) => actor.id === userStore.userId || actor.userName === userStore.userName;
  return activeActors.find((actor) => matchesCurrentUser(actor) && actor.phase === phaseId.value)
    || activeActors.find((actor) => matchesCurrentUser(actor));
});
const canModifyAccountRequest = computed(() => Boolean(currentUserActor.value?.permissions?.modify));
const isAccountRequestEditable = computed(() => ['createAccount', 'modifyAccount'].includes(requestType.value) && canModifyAccountRequest.value);
// the RequestFormManager resolves the account request's assigned form async —
// hold the OOTB account form back until it settles, then fall back to it only
// when no form was assigned (otherwise both forms would render)
const accountRequestFormResolved = ref(null);
const showAccountRequestDetails = computed(() => (
  isAccountRequestType.value
  && accountRequestFormResolved.value === false
));
/**
 * Retrieves the details for a given item.
 * @param {Object} item - The item for which to retrieve the details.
 * @returns {Object} - The details of the item.
 */
function getDetails(item) {
  const newDetails = {
    externalRequestId: item.rawData.request?.common?.externalRequestId,
    requestId: item.details.id,
    priority: item.details.priority || null,
    justification: item.rawData.request?.common?.justification,
    startDate: item.rawData.request?.common?.startDate,
    endDate: item.rawData.request?.common?.endDate,
  };

  return newDetails;
}

/**
 * Get the role glossary schema.
 */
async function getSchemaData() {
  if (isAgentRequestType.value) return;
  try {
    const glossaryData = await getGlossarySchema();
    glossarySchema.value = {
      application: glossaryData.data['/openidm/managed/application'] || [],
      entitlement: glossaryData.data['/openidm/managed/assignment'] || [],
      role: glossaryData.data['/openidm/managed/role'] || [],
    };
    if (isRoleRequestType.value) {
      const roleData = await getSchema('managed/alpha_role');
      roleSchema.value = map(roleData?.data.properties, (prop, key) => ({
        ...prop,
        propName: key,
      }));
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.certificationTask.errors.glossaryError'));
  }
}

/**
 * Loads the application referenced by an account request, so its name/logo
 * can be shown in the requested-item card.
 */
async function loadAccountApplication() {
  if (accountApplication.value) return;
  // account request payloads submitted through the custom request endpoint carry
  // the application id inside the request's account block
  const applicationId = props.item?.rawData?.request?.account?.applicationId
    || props.item?.rawData?.request?.applicationId
    || props.item?.rawData?.application?.id;
  if (!applicationId) return;
  try {
    const { data } = await getApplication(applicationId);
    accountApplication.value = data;
  } catch {
    // the plain lookup 404s for disconnected applications; retry with the flag
    try {
      const { data } = await getApplication(applicationId, { disconnected: true });
      accountApplication.value = data;
    } catch {
      // application info is supplementary — fall back to a blank card
      accountApplication.value = null;
    }
  }
}

/**
 * Modifies a request with the provided values.
 * @param {Object} values - The values to modify the request with.
 */
async function modifyRequest(requestPayload, saveAsDraft = false) {
  savingRequest.value = true;

  try {
    if (saveAsDraft || props.isDraft) {
      await putCustomRequest(props.item.rawData.id, requestPayload);
      if (!saveAsDraft) {
        router.push('/my-requests');
      }
    } else {
      await requestAction(props.item.rawData.id, 'modify', phaseId.value, requestPayload);
    }
    displayNotification('success', i18n.global.t('governance.accessRequest.requestSaveSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.requestSaveError'));
  } finally {
    savingRequest.value = false;
  }
}

/**
 * Creates the role payload to send in the modifyRole request.
 * @param {Boolean} saveAsDraft - Flag to determine if the role should be saved as a draft.
 */
async function modifyRequestRoleData(saveAsDraft = false) {
  const { role } = requestRoleData.value;
  const payload = {
    role: {
      ...role,
      object: {
        ...role.object,
        entitlements: compact(requestRoleData.value.entitlements),
        addedRoleMembers: compact(requestRoleData.value.members),
      },
      glossary: requestRoleData.value.glossary,
    },
    common: {
      ...role.common,
      isDraft: saveAsDraft,
    },
  };
  await modifyRequest(payload, saveAsDraft);
}

/**
 * Updates the locally saved request role data.
 * @param {Object} roleData - The new role data for the request.
 * @param {Boolean} triggerSave - Flag to determine if the draft role should be saved.
 */
async function updateRoleData(roleData, triggerSave = false) {
  requestRoleData.value = roleData;
  if (triggerSave) {
    await modifyRequestRoleData(props.isDraft);
  }
}
/**
 * Return a properly formatted date to display
 * @param {Date} date - The date to format
 * @returns {String} - The formatted date string
 */
function getFormattedDate(date) {
  if (!date) {
    return blankValueIndicator;
  }
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

onMounted(async () => {
  details.value = getDetails(props.item);
  if (isRoleRequestType.value || isOotbNoFormRequestType.value) {
    await getSchemaData();
    isInitialized.value = true;
  }
  if (isAccountRequestType.value) {
    await loadAccountApplication();
  }
});

// parents that populate the item asynchronously (task/approval flows) mount this
// tab before the request data exists — load once the account request arrives, or
// when its application id arrives after the request type was already set
watch(
  [() => props.item?.rawData?.requestType, () => props.item?.rawData?.request?.account?.applicationId],
  ([newRequestType, applicationId]) => {
    if (['createAccount', 'modifyAccount', 'deleteAccount'].includes(newRequestType) && applicationId) {
      loadAccountApplication();
    }
  },
);
</script>
