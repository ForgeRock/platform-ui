<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="delete-user-modal"
    size="lg"
    no-close-on-backdrop
    no-close-on-esc
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('deletePanel.deleteTypeQuestion', { type: $t('common.user.user') })"
    @show="initializeModal"
    @hidden="resetModal">
    <!-- body -->
    <FrSpinner
      v-if="isLoadingForm"
      class="py-5" />
    <template v-else>
      <template v-if="step === 0">
        <FrFormBuilder
          v-if="form"
          v-model:model-value="formValue"
          @is-valid="isValidForm = $event"
          :schema="form.form?.fields" />
        <div v-else>
          {{ $t('deletePanel.body', { type: $t('common.user.user').toLowerCase() }) }}
        </div>
      </template>
      <FrRequestSubmitSuccess
        v-else-if="step === 1"
        :request-id="requestId"
        :success-text="$t('governance.user.deleteSuccess')" />
    </template>
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
        :disabled="isSaving || !isValidForm"
        :variant="modalProperties.buttonVariant"
        :button-text="modalProperties.buttonText"
        :spinner-text="$t('common.submitting')"
        :show-spinner="isSaving"
        @click="nextStep(ok)" />
    </template>
  </BModal>
</template>
<script setup>
import { computed, ref } from 'vue';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import useForm from '@forgerock/platform-shared/src/composables/governance/forms';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrRequestSubmitSuccess from '@/views/governance/LCM/RequestSubmitSuccess';
import i18n from '@/i18n';

const props = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
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
  setDefaultFormValues,
} = useForm();

const isSaving = ref(false);
const requestId = ref('');
const step = ref(0);

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
  setDefaultFormValues();
  isSaving.value = false;
  requestId.value = '';
  step.value = 0;
}

/**
 * Submits an access request to delete a user.
 *
 * @param {string} userId - The ID of the user to be deleted.
 * @returns {Promise<void>} A promise that resolves when the request has been submitted.
 */
async function submitRequest(userId) {
  let requestPayload = {};

  if (form.value) {
    requestPayload = {
      common: { ...formValue.value?.common },
      custom: { ...formValue.value?.custom },
      user: {
        userId,
        ...formValue.value?.user,
      },
    };
  } else {
    requestPayload = {
      common: {},
      custom: {},
      user: { userId },
    };
  }
  return submitCustomRequest(requestTypes.DELETE_USER.value, requestPayload);
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
        const { data } = await submitRequest(props.userId);
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

async function initializeModal() {
  const options = {
    lcmType: 'user',
    operation: 'delete',
    setInitialModel: true,
  };
  await getFormDefinitionByType(formTypes.LCM, options);
  isLoadingForm.value = false;
}

</script>
