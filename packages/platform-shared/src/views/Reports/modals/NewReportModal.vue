<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="new-report-modal"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-title="$t('common.next')"
    :title="$t('reports.newReportModal.title')"
    @hide="handleModalHide"
    @ok="handleNextClick">
    <FrReportSettingsDetailsForm
      ref="form"
      v-model="newReportFormData"
      :is-testing="isTesting"
      @valid-change="valid = $event" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.next')"
        :disabled="!valid || props.reportIsSaving"
        :show-spinner="props.reportIsSaving"
        :spinner-text="$t('common.next')"
        @click="handleNextClick" />
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description Modal for creating a new Analytics Report Template
 */
import {
  BButton, BModal,
} from 'bootstrap-vue';
import { ref } from 'vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import { defaultGroups } from '../composables/ManagedUsers';
import FrReportSettingsDetailsForm from '../ReportTemplate/ReportSettingsDetailsForm';

const form = ref(null);
const valid = ref(false);
const newReportFormData = ref({
  name: '',
  description: '',
  report_admin: false,
  report_viewer: false,
  report_author: false,
  viewers: [],
});

const emit = defineEmits(['new-report-save']);

const props = defineProps({
  reportIsSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

/**
 * Resets the settings details form on modal hide
 */
function handleModalHide() {
  form.value.resetForm();
}

/**
 * Handle the form submission
 */
function handleNextClick() {
  const {
    name, description, viewers,
  } = newReportFormData.value;

  const checkedGroups = defaultGroups.filter((group) => newReportFormData.value[group]);

  emit('new-report-save', {
    description,
    name,
    viewers: [...checkedGroups, ...viewers],
  });
}
</script>
