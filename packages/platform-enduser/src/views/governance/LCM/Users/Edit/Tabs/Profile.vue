<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="px-4 pt-4">
    <FrDefaultUserForm
      @update:modelValue="updatedUser = $event"
      :user="props.user" />
  </div>
  <div class="p-4 border-top">
    <FrButtonWithSpinner
      class="d-block ml-auto"
      variant="primary"
      :disabled="isSaving"
      :show-spinner="isSaving"
      @click="submitRequest" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { findChanges } from '@forgerock/platform-shared/src/utils/object';
import FrDefaultUserForm from './DefaultUserForm';
import i18n from '@/i18n';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const MODIFY_USER_REQUEST_TYPE = 'modifyUser';
const isSaving = ref(false);
const updatedUser = ref({});

/**
 * Submits a modifyUser request with values from the forms
 */
async function submitRequest() {
  isSaving.value = true;
  try {
    const changedValues = findChanges(updatedUser.value, props.user);
    const userPayload = {};
    changedValues.forEach((change) => {
      userPayload[change.name] = change.value;
    });
    const requestPayload = {
      common: {},
      custom: {},
      user: {
        userId: props.user._id,
        user: userPayload,
      },
    };
    await submitCustomRequest(MODIFY_USER_REQUEST_TYPE, requestPayload);
    displayNotification('success', i18n.global.t('governance.requestForm.requestSubmitted'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.requestForm.errorSubmittingRequest'));
  } finally {
    isSaving.value = false;
  }
}

watch(() => props.user, (newVal) => {
  updatedUser.value = newVal;
}, { immediate: true, deep: true });

</script>
