<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="px-4 pt-4">
    <FrSpinner
      v-if="isLoadingForm"
      class="py-5" />
    <template v-else>
      <FrFormBuilder
        v-if="form"
        v-model:model-value="formValue"
        :read-only="readOnly"
        :schema="form.form?.fields"
        @is-valid="isValidForm = $event" />
      <FrModifyUserForm
        v-else
        @update:modelValue="formValue = $event"
        :privilege-data="userPrivilegeData"
        :read-only="readOnly"
        :user="props.user"
        :user-schema="userSchema" />
    </template>
  </div>
  <div class="p-4 border-top">
    <FrButtonWithSpinner
      class="d-block ml-auto"
      variant="primary"
      :disabled="isSaving || !isValidForm || readOnly"
      :show-spinner="isSaving"
      @click="submitRequest" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { cloneDeep } from 'lodash';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getResourceTypePrivilege } from '@forgerock/platform-shared/src/api/PrivilegeApi';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { findChanges } from '@forgerock/platform-shared/src/utils/object';
import { convertRelationshipPropertiesToFormBuilder, convertRelationshipPropertiesToRef } from '@forgerock/platform-shared/src/components/FormEditor/utils/formGeneratorSchemaTransformer';
import { requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import useForm from '@forgerock/platform-shared/src/composables/governance/forms';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrModifyUserForm from '@forgerock/platform-shared/src/components/governance/DefaultLCMForms/User/ModifyUserForm';
import i18n from '@/i18n';

const props = defineProps({
  user: {
    type: Object,
    required: true,
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

const isSaving = ref(false);
const originalUser = ref({});
const userSchema = ref({});
const userPrivilegeData = ref({});
const readOnly = ref(false);

/**
 * Generates the payload for a request using a custom form.
 *
 * @param {Object} newValues - The updated values from the form.
 * @param {Object} oldValues - The object containing the old values for comparison.
 * @returns {Object} The payload containing only the fields that have changed.
 */
function getFormRequestPayload(newValues, oldValues) {
  let userPayload = {};
  const userValues = newValues.user || {};
  const commonValues = newValues.common || {};
  const customValues = newValues.custom || {};

  const changedValues = findChanges(userValues, oldValues);

  changedValues.forEach((change) => {
    userPayload[change.name] = change.value;
  });

  userPayload = convertRelationshipPropertiesToRef(userPayload, userSchema.value.properties);

  return {
    common: { ...commonValues },
    custom: { ...customValues },
    user: {
      userId: props.user._id,
      object: userPayload,
    },
  };
}

/**
 * Submits a modifyUser request with values from the forms
 */
async function submitRequest() {
  isSaving.value = true;
  try {
    const userValues = form.value
      ? formValue.value
      : { user: formValue.value };
    const requestPayload = getFormRequestPayload(userValues, originalUser.value);

    await submitCustomRequest(requestTypes.MODIFY_USER.value, requestPayload);
    displayNotification('success', i18n.global.t('governance.requestForm.requestSubmitted'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.requestForm.errorSubmittingRequest'));
  } finally {
    isSaving.value = false;
  }
}

/**
 * Initializes the form with necessary data and configurations.
 * Gets a form if it exists, otherwise uses the default user form.
 */
async function initializeForm() {
  // get user schema
  const { data: schemaData } = await getSchema('/managed/alpha_user');
  userSchema.value = schemaData;
  const { data: privilegeData } = await getResourceTypePrivilege(`managed/alpha_user/${props.user._id}`);
  userPrivilegeData.value = privilegeData;
  readOnly.value = !privilegeData?.UPDATE?.allowed;
  // get form definition
  const options = {
    lcmType: 'user',
    operation: 'update',
    setInitialModel: false,
  };
  await getFormDefinitionByType(formTypes.LCM, options);

  // initialize user values
  const convertedUser = convertRelationshipPropertiesToFormBuilder(props.user, userSchema.value?.properties);
  formValue.value = { user: convertedUser };
  originalUser.value = cloneDeep(convertedUser);
  isLoadingForm.value = false;
}

initializeForm();
</script>
