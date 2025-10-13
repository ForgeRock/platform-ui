<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }">
    <FrUserDetails
      v-if="stages.idmUserDetails"
      inline
      @password-valid="passwordValid=$event"
      @update:data="formData = { ...formData, ...$event }"
      :self-service-details="selfServiceDetails" />
    <FrKBASecurityAnswerDefinitionStage
      v-if="stages.kbaSecurityAnswerDefinitionStage"
      inline
      @update:data="formData = { ...formData, ...$event }"
      :self-service-details="selfServiceDetails" />
    <FrCaptcha
      v-if="stages.captcha"
      @advance-stage="formData = { ...formData, ...$event }"
      :self-service-details="selfServiceDetails" />

    <BModal
      v-if="stages.consent && selfServiceDetails.requirements && selfServiceDetails.requirements.consent"
      id="consentModal"
      ok-variant="primary"
      ok-only
      :static="isTesting"
      :ok-title="$t('common.ok')"
      :ok-disabled="!consentCheck"
      :title="$t('pages.selfservice.registration.consent.title')"
      @ok="save"
      @hide="consentCheck = false">
      <template #default>
        <FrConsent
          inline
          :self-service-details="selfServiceDetails" />
        <FrField
          v-model="consentCheck"
          class="pb-0 ml-auto"
          type="checkbox"
          :label="$t('pages.selfservice.registration.consent.agreement')" />
      </template>
    </BModal>

    <FrButtonWithSpinner
      variant="primary"
      class="mt-2 mb-3 w-100"
      :disabled="!valid || !passwordValid || loading"
      :button-text="$t('common.signUp')"
      :spinner-text="$t('common.signUp')"
      :loading="loading"
      @click="saveCheck" />

    <FrTermsAndConditions
      v-if="stages.termsAndConditions && selfServiceDetails.requirements && selfServiceDetails.requirements.terms"
      inline
      :self-service-details="selfServiceDetails" />
  </VeeForm>
</template>

<script setup>
/**
 * @description Selfservice stage that is used for combing multiple selfservice stages (User details, Captcha, KBA, Terms and Confitions and Consent)
 * */
import { Form as VeeForm } from 'vee-validate';
import { ref, onMounted } from 'vue';
import {
  cloneDeep,
  each,
} from 'lodash';
import {
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrCaptcha from '../common/Captcha';
import FrConsent from './Consent';
import FrKBASecurityAnswerDefinitionStage from './KBASecurityAnswerDefinitionStage';
import FrTermsAndConditions from './TermsAndConditions';
import FrUserDetails from './UserDetails';

const props = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  selfServiceDetails: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['advanceStage']);

const { bvModal } = useBvModal();

const consentCheck = ref(false);
const formData = ref({});
const loading = ref(false);
const passwordValid = ref(false);
const stages = ref({});

/**
 * Retrieves and returns the necessary data for registration.
 * @returns {Object} The data object containing registration information.
 */
function getData() {
  const data = cloneDeep(formData.value);
  if (stages.value.termsAndConditions && props.selfServiceDetails.requirements && props.selfServiceDetails.requirements.terms) {
    data.accept = 'true';
  }

  if (props.selfServiceDetails.requirements.consentEnabled) {
    data.consentGiven = 'true';
  }
  return data;
}

/**
 * Handles the save action for the registration form.
 */
function save() {
  emit('advanceStage', getData());
  loading.value = false;
}

/**
 * Performs validation and saves registration data.
 * @returns {Promise<void>} Resolves when the save operation is complete.
 */
function saveCheck() {
  loading.value = true;
  if (props.selfServiceDetails.requirements.consentEnabled) {
    bvModal.value.show('consentModal');
  } else {
    save();
  }
}

onMounted(() => {
  each(props.selfServiceDetails.requirements.stages, (name) => {
    stages.value[name] = true;
  });
});
</script>
