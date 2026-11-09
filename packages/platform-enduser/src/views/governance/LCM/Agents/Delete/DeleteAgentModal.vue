<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="delete-agent-modal"
    size="lg"
    no-close-on-backdrop
    no-close-on-esc
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('deletePanel.deleteTypeQuestion', { type: $t('governance.administer.agents.agent') })"
    @show="initializeModal"
    @hidden="resetModal">
    <FrSpinner
      v-if="isLoadingForm"
      class="py-5" />
    <template v-else>
      <template v-if="step === 0">
        <FrFormBuilder
          v-if="form"
          v-model:model-value="formValue"
          :form="form.form"
          @is-valid="isValidForm = $event" />
        <div v-else>
          {{ $t('deletePanel.body', { type: $t('governance.administer.agents.agent').toLowerCase() }) }}
        </div>
      </template>
      <FrRequestSubmitSuccess
        v-else-if="step === 1"
        :request-id="requestId"
        :success-text="$t('governance.administer.agents.deleteSuccess')" />
    </template>
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

const emit = defineEmits(['agent-deleted']);

const props = defineProps({
  agentId: {
    type: String,
    required: true,
  },
  isTesting: {
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

function resetModal() {
  setDefaultFormValues();
  isSaving.value = false;
  requestId.value = '';
  step.value = 0;
}

async function submitRequest(agentId) {
  const requestPayload = form.value
    ? {
      common: { ...formValue.value?.common },
      custom: { ...formValue.value?.custom },
      agent: { agentId, ...formValue.value?.agent },
    }
    : { common: {}, custom: {}, agent: { agentId } };
  return submitCustomRequest(requestTypes.DELETE_AGENT.value, requestPayload);
}

async function nextStep(ok) {
  switch (step.value) {
    case 0:
      try {
        isSaving.value = true;
        const { data } = await submitRequest(props.agentId);
        requestId.value = data.id;
        step.value += 1;
        emit('agent-deleted');
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
    lcmType: 'agent',
    operation: 'delete',
    setInitialModel: true,
  };
  await getFormDefinitionByType(formTypes.LCM, options);
  isLoadingForm.value = false;
}
</script>
