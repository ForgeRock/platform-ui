<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="px-4 pb-4">
      <FrFormBuilder
        v-if="form && !isLoadingForm"
        v-model:model-value="formValue"
        :form="form.form"
        :read-only="readOnly"
        @is-valid="isValidForm = $event" />
      <FrDefaultFormManager
        v-if="showDefaultForm"
        :read-only="readOnly"
        :request-type="requestType"
        :options="defaultFormOptions"
        @input="defaultFormValues = $event" />
    </div>
    <div
      v-if="showSaveButton"
      class="border-top p-4 d-flex justify-content-end">
      <FrButtonWithSpinner
        @click="handleSave()"
        :disabled="savingRequest || !isValidForm"
        :show-spinner="savingRequest"
        variant="primary" />
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue';
import { cloneDeep, pickBy } from 'lodash';
import { isSupportedRequestType, requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { convertRelationshipPropertiesToFormBuilder, convertRelationshipPropertiesToRef } from '@forgerock/platform-shared/src/components/FormEditor/utils/formGeneratorSchemaTransformer';
import { findChanges } from '@forgerock/platform-shared/src/utils/object';
import { useGovernanceStore } from '@forgerock/platform-shared/src/stores/governance';
import useForm from '@forgerock/platform-shared/src/composables/governance/forms';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrDefaultFormManager from '@forgerock/platform-shared/src/components/governance/DefaultLCMForms/DefaultFormManager';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';

const { schema, setSchema } = useGovernanceStore();
const emit = defineEmits(['save']);

const props = defineProps({
  isApproval: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  request: {
    type: Object,
    required: true,
  },
  savingRequest: {
    type: Boolean,
    default: false,
  },
});

const {
  isLoadingForm,
  isValidForm,
  form,
  formTypes,
  formValue,
  getFormDefinitionByType,
} = useForm();

// data
const isWorkflowForm = ref(false);

const propertySchema = ref({});

// default form data
const defaultFormOptions = ref({});
const defaultFormValues = ref({});
const showDefaultForm = ref(false);

// computed
const phaseId = computed(() => props.request.phases?.[0]?.name);
const requestType = computed(() => props.request.requestType || '');
const isCustomRequestType = computed(() => !isSupportedRequestType(requestType.value));
const showSaveButton = computed(() => (
  (form?.value?.form?.fields
    || requestType.value === requestTypes.MODIFY_ENTITLEMENT.value
    || requestType.value === requestTypes.CREATE_ENTITLEMENT.value
    || requestType.value === requestTypes.CREATE_USER.value
    || requestType.value === requestTypes.MODIFY_USER.value
  ) && !props.readOnly));

/**
 * Gets and sets the form definition for a given request.
 * If in approvals, attempt to show workflow form if available.
 * If not, fall back to the default form based on request type.
 *
 * @param {Object} request - The request object containing details about the request.
 */
async function setFormDefinition(request) {
  // workflow form
  if (props.isApproval && request.workflow?.id) {
    await getFormDefinitionByType(formTypes.WORKFLOW, { workflowId: request.workflow?.id, phaseId: phaseId.value });
    if (form.value) {
      isWorkflowForm.value = true;
      return;
    }
  }

  switch (requestType.value) {
    case requestTypes.CREATE_USER.value:
      await getFormDefinitionByType(formTypes.LCM, { lcmType: 'user', operation: 'create' });
      return;
    case requestTypes.MODIFY_USER.value:
      await getFormDefinitionByType(formTypes.LCM, { lcmType: 'user', operation: 'update' });
      return;
    case requestTypes.DELETE_USER.value:
      await getFormDefinitionByType(formTypes.LCM, { lcmType: 'user', operation: 'delete' });
      return;
    case requestTypes.ACCOUNT_GRANT.value:
      await getFormDefinitionByType(formTypes.APPLICATION, { application: request.application, applicationId: request.application.id });
      break;
    default:
      // custom request
      if (!props.isApproval && isCustomRequestType.value) {
        await getFormDefinitionByType(formTypes.CUSTOM, { requestTypeId: requestType.value });
      }
      break;
  }
}

/**
 * Sets the form values based on the request type and whether a custom form is configured
 *
 * @param {Object} request - The request object containing details about the request.
 */
async function setFormValues(request) {
  // workflow form
  if (props.isApproval && request.workflow?.id) {
    if (isWorkflowForm.value) {
      if (isCustomRequestType.value) formValue.value = request.request || {};
      else formValue.value = request.request?.common?.blob?.form || {};
      return;
    }
  }

  // OOTB request types
  let userValues;
  switch (requestType.value) {
    case requestTypes.ACCOUNT_GRANT.value:
      formValue.value = request.request?.common?.blob?.form || {};
      return;
    case requestTypes.CREATE_USER.value:
    case requestTypes.MODIFY_USER.value:
      await setSchema('managed/alpha_user');
      propertySchema.value = schema['managed/alpha_user'].properties;
      userValues = requestType.value === requestTypes.CREATE_USER.value
        ? request.request?.user?.object
        : {
          ...request.user,
          ...request.request?.user?.object,
        };
      if (form.value) {
        formValue.value = { user: convertRelationshipPropertiesToFormBuilder(userValues || {}, propertySchema.value) };
      } else {
        defaultFormOptions.value = {
          userValues: userValues || {},
        };
        if (requestType.value === requestTypes.MODIFY_USER.value) {
          defaultFormOptions.value.userId = request.request.user?.userId;
        }
        showDefaultForm.value = true;
      }
      return;
    case requestTypes.DELETE_USER.value:
      if (form.value) formValue.value = request.request || {};
      return;
    case requestTypes.MODIFY_ENTITLEMENT.value:
    case requestTypes.CREATE_ENTITLEMENT.value:
      defaultFormOptions.value = {
        entitlement: {
          entitlement: { ...request.request?.entitlement?.object || {} },
          glossary: { idx: { '/entitlement': request.request?.entitlement?.glossary || {} } },
        },
        applicationId: request.application.id,
        objectType: requestType.value === requestTypes.CREATE_ENTITLEMENT.value
          ? request.request?.entitlement?.objectType
          : request.application?.objectTypes?.find((type) => type.accountAttribute === request.assignment?.attributes?.[0]?.name)?.name || '',
      };
      showDefaultForm.value = true;
      break;
    default:
      // custom request form
      if (isCustomRequestType.value) {
        formValue.value = request.request || {};
      }
      break;
  }
}

/**
 * Retrieves the form for the specified item.
 *
 * @param {Object} item - The item for which to retrieve the form.
 */
async function getForm(request) {
  const clonedRequest = cloneDeep(request);

  await setFormDefinition(clonedRequest);
  await setFormValues(clonedRequest);
  isLoadingForm.value = false;
}

function getUserRequestPayload(originalRequest, updatedRequest) {
  const clonedRequest = cloneDeep(originalRequest);
  const userObject = { ...updatedRequest.user };
  const commonObject = { ...updatedRequest.common };
  const customObject = { ...updatedRequest.custom };

  // merges updated request values into the cloned request
  clonedRequest.request = {
    common: {
      ...clonedRequest.request.common,
      ...commonObject,
    },
    custom: {
      ...clonedRequest.request.custom,
      ...customObject,
    },
    user: {
      ...clonedRequest.request.user,
    },
  };

  // user object values should only contain changes that differ from the original request
  if (requestType.value === requestTypes.MODIFY_USER.value || requestType.value === requestTypes.CREATE_USER.value) {
    const userComparison = pickBy(clonedRequest.user, (value, key) => Object.keys(userObject).includes(key));
    const changedValues = findChanges(userObject, userComparison);
    const userPayload = {};
    changedValues.forEach((change) => {
      userPayload[change.name] = change.value;
    });

    clonedRequest.request.user.object = {
      ...clonedRequest.request.user.object,
      ...convertRelationshipPropertiesToRef(userPayload, propertySchema.value),
    };
  }

  return clonedRequest.request;
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
  requestPayload.request.entitlement = {
    ...requestPayload.request.entitlement,
    object: {
      ...requestPayload.request.entitlement.object,
      ...object,
    },
    glossary: {
      ...requestPayload.request.entitlement.glossary,
      ...glossary,
    },
  };
  return requestPayload.request;
}

/**
 * Emits the save event with the current form values.
 * Builds the request payload based on the request type and form values.
 */
async function handleSave() {
  const clonedRequest = cloneDeep(props.request);
  let requestPayload = {};

  if (isCustomRequestType.value) {
    requestPayload = formValue.value;
    emit('save', requestPayload);
    return;
  }

  // OOTB request types
  switch (requestType.value) {
    case requestTypes.CREATE_USER.value:
    case requestTypes.MODIFY_USER.value:
    case requestTypes.DELETE_USER.value:
      requestPayload = form.value
        ? getUserRequestPayload(clonedRequest, formValue.value)
        : getUserRequestPayload(clonedRequest, { user: defaultFormValues.value });
      break;
    case requestTypes.CREATE_ENTITLEMENT.value:
    case requestTypes.MODIFY_ENTITLEMENT.value:
      requestPayload = getEntitlementRequestPayload(clonedRequest, defaultFormValues.value.glossary, defaultFormValues.value.entitlement);
      break;
    case requestTypes.ACCOUNT_GRANT.value:
      requestPayload = cloneDeep(props.request.request);
      if (!requestPayload.common.blob) requestPayload.common.blob = {};
      requestPayload.common.blob.form = {
        ...requestPayload.common.blob.form,
        ...formValue.value,
      };
      break;
    default:
      requestPayload = cloneDeep(props.request.request);
      break;
  }
  emit('save', requestPayload);
}

onMounted(() => {
  getForm(props.request);
});
</script>
