<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      id="UpdateResumeDateModal"
      no-close-on-backdrop
      no-close-on-esc
      size="lg"
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="$t('governance.accessRequest.changeResumeDate')"
      @hidden="resetModal">
      <FrField
        class="mr-1"
        v-model="newResumeDate"
        name="resumeDate"
        type="datetime"
        :placeholder="$t('governance.accessRequest.resumeDate')"
        :adjust-for-timezone="false"
        :show-seconds="false"
        :min-date="minResumeDate" />
      <FrField
        name="justificationText"
        v-model="justificationText"
        class="mt-2"
        type="textarea"
        :label="$t('governance.accessRequest.newRequest.justification')"
        :description="$t('governance.requestModal.detailsTab.changeResumeDateJustification')"
        :max-rows="10"
        :rows="5"
        :validation="{ required: true }" />
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="primary"
          :disabled="loading || !newResumeDate || !valid"
          :show-spinner="loading"
          @click="save" />
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>

/**
 * @description Dialog used for updating a suspended request's resume date.
 *
 * @param {Boolean} loading - is true when the parent component is performing an endpoint call
 * @param {string} currentResumeDate - The current resume date for the suspended request
 */
import {
  computed,
  defineProps,
  ref,
  watch,
} from 'vue';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import dayjs from 'dayjs';
import { Form as VeeForm } from 'vee-validate';

const prop = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  currentResumeDate: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['get-entitlements']);

const newResumeDate = ref(null);
const justificationText = ref('');
const minResumeDate = computed(() => new Date());

watch(() => prop.currentResumeDate, (value) => {
  newResumeDate.value = value;
}, { immediate: true });

function resetModal() {
  newResumeDate.value = null;
  justificationText.value = '';
  emit('close-modal', 'UpdateResumeDateModal');
}

function save() {
  emit('update-resume-date', dayjs(newResumeDate.value).local().format(), justificationText.value);
}
</script>
