<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrRequestRoleDetails
    v-if="isRoleRequestType && props.item?.rawData"
    @save="modifyRequest"
    @update-role="updateRoleData"
    :saving-request="savingRequest"
    :is-approval="props.isApproval"
    :item="props.item || {}"
    :request="props.item?.rawData || {}"
    :read-only="props.readOnly" />
  <div
    v-else-if="isOOTBNoFormRequestType && details"
    class="bg-light p-4 m-4 rounded mb-3">
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
        @click="modifyRequestRoleData()" />
      <FrButtonWithSpinner
        v-if="!readOnly"
        variant="primary"
        :disabled="isLoading"
        :show-spinner="isLoading"
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
} from 'vue';
import dayjs from 'dayjs';
import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import { map } from 'lodash';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { OOTB_NO_FORM_REQUEST_TYPES } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrRequestFormManager from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestFormManager';
import FrRequestRoleDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestRoleDetails';
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
const glossarySchema = ref(null);
const roleSchema = ref(null);
const requestRoleData = ref(null);
const isInitialized = ref(false);
const isOOTBNoFormRequestType = computed(() => OOTB_NO_FORM_REQUEST_TYPES.some((type) => type?.value === requestType?.value));
const isRoleRequestType = computed(() => ['createRole', 'modifyRole', 'publishRole', 'deleteRole'].includes(requestType.value));
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
  try {
    // get glossary schema and values
    const glossaryData = await getGlossarySchema('role');
    glossarySchema.value = glossaryData;
    const roleData = await getSchema('managed/alpha_role');
    roleSchema.value = map(roleData?.data.properties, (prop, key) => ({
      ...prop,
      propName: key,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.certificationTask.errors.glossaryError'));
  }
}

/**
 * Updates the locally saved request role data.
 * @param {Object} roleData - The new role data for the request.
 */
function updateRoleData(roleData) {
  requestRoleData.value = roleData;
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
/**
 * Modifies a request with the provided values.
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
 * Creates the role payload to send in the modifyRole request.
 */
async function modifyRequestRoleData() {
  const { role } = requestRoleData.value;
  const payload = {
    role: {
      ...role,
      object: {
        ...role.object,
        entitlements: map(requestRoleData.value.entitlements, 'id'),
        members: map(requestRoleData.value.members, 'id'),
      },
      glossary: requestRoleData.value.glossary,
    },
  };

  await modifyRequest(payload);
}

onMounted(async () => {
  details.value = getDetails(props.item);
  if (isRoleRequestType.value) {
    await getSchemaData();
    isInitialized.value = true;
  }
});
</script>
