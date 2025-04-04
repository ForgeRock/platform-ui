<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid }}"
    as="span">
    <BModal
      id="add-user-modal"
      size="lg"
      no-close-on-backdrop
      no-close-on-esc
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="$t('governance.user.newUser')"
      @hidden="resetModal">
      <!-- body -->
      <FrAddUserForm
        v-if="step === 0"
        :model-value="userValues"
        @update:modelValue="userValues = $event" />
      <FrRequestSubmitSuccess
        v-else-if="step === 1"
        :request-id="requestId"
        :success-text="$t('governance.user.createSuccess')" />

      <!-- footer -->
      <template #modal-footer="{ cancel, ok }">
        <BButton
          v-if="step === 0"
          class="ml-auto"
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :disabled="!valid || isSaving"
          :variant="modalProperties.buttonVariant"
          :button-text="modalProperties.buttonText"
          :spinner-text="$t('common.submitting')"
          :show-spinner="isSaving"
          @click="nextStep(ok)" />
      </template>
    </BModal>
  </VeeForm>
</template>
<script setup>
import { computed, ref } from 'vue';
import { Form as VeeForm } from 'vee-validate';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrRequestSubmitSuccess from '@/views/governance/LCM/RequestSubmitSuccess';
import FrAddUserForm from './AddUserForm';
import i18n from '@/i18n';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const isSaving = ref(false);
const requestId = ref('');
const step = ref(0);

const userValues = ref({});
const CREATE_ENTITLEMENT_REQUEST_TYPE = 'createUser';

const modalProperties = computed(() => {
  if (step.value === 0) {
    return {
      buttonText: i18n.global.t('common.submit'),
      buttonVariant: 'primary',
    };
  }
  return {
    buttonText: i18n.global.t('common.done'),
    buttonVariant: 'outline-primary',
  };
});

/**
 * Resets the state of the modal.
 */
function resetModal() {
  isSaving.value = false;
  requestId.value = '';
  step.value = 0;
  userValues.value = {};
}

/**
 * Submits an access request to create a new user.
 * @returns {Promise<void>} A promise that resolves when the request has been submitted.
 */
async function submitRequest() {
  const requestPayload = {
    common: {},
    custom: {},
    user: userValues.value,
  };
  return submitCustomRequest(CREATE_ENTITLEMENT_REQUEST_TYPE, requestPayload);
}

/**
 * Proceeds to the next step in the modal.
 * @param {Function} ok - modal ok function.
 */
async function nextStep(ok) {
  switch (step.value) {
    case 0:
      try {
        isSaving.value = true;
        const { data } = await submitRequest();
        requestId.value = data.id;
        step.value += 1;
      } catch (error) {
        showErrorMessage(error, i18n.global.t('governance.requestForm.errorSubmittingRequest'));
      } finally {
        isSaving.value = false;
      }
      break;
    case 1:
      ok();
      break;
    default:
      break;
  }
}
</script>
