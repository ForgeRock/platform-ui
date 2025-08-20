<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

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
    :static="isTesting"
    :title="modalTitle"
    @hidden="handleModalHide"
    @ok="handleNextClick">
    <FrReportSettingsDetailsForm
      :model-value="newReportFormData"
      :report-names="reportNames"
      @update:modelValue="newReportFormData = $event" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="submitButtonText"
        :disabled="!meta.valid || reportIsSaving"
        :show-spinner="reportIsSaving"
        :spinner-text="submitButtonText"
        @click="handleNextClick" />
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description Modal for creating or duplicating an Analytics Report
 */
import { BButton, BModal } from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import { useForm } from 'vee-validate';
import FrReportSettingsDetailsForm from '../ReportTemplate/ReportSettingsDetailsForm';
import i18n from '@/i18n';

const { meta } = useForm();

// globals
const emit = defineEmits(['duplicate-report', 'hidden', 'new-report-save']);
const props = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  reportDataForDuplication: {
    type: Object,
    default: () => ({}),
  },
  reportIsSaving: {
    type: Boolean,
    default: false,
  },
  reportNames: {
    type: Array,
    default: () => [],
  },
});
const newReportFormData = ref({
  description: '',
  viewers: [],
  displayName: '',
});

// Methods
/**
 * Resets the form values
 */
function resetFormValues() {
  newReportFormData.value.description = '';
  newReportFormData.value.viewers = [];
  newReportFormData.value.displayName = '';
}

/**
 * Resets the settings details form on modal hide
 */
function handleModalHide() {
  resetFormValues();
  emit('hidden');
}

/**
 * Handles the form submission
 */
function handleNextClick() {
  const {
    description,
    viewers,
    displayName,
  } = newReportFormData.value;
  const emitType = Object.keys(props.reportDataForDuplication).length ? 'duplicate-report' : 'new-report-save';

  emit(emitType, {
    description,
    viewers,
    displayName,
    // conditional properties
    ...(emitType === 'duplicate-report' && { originalReportName: props.reportDataForDuplication.name }),
    ...(emitType === 'duplicate-report' && { status: props.reportDataForDuplication.status }),
  });
}

// Computed
const modalTitle = computed(() => (Object.keys(props.reportDataForDuplication).length
  ? i18n.global.t('reports.duplicateReport')
  : i18n.global.t('reports.newReportModal.title')));
const submitButtonText = computed(() => (Object.keys(props.reportDataForDuplication).length
  ? i18n.global.t('common.duplicate')
  : i18n.global.t('common.next')));

// Watchers
watch(() => props.reportDataForDuplication, (report) => {
  if (report && Object.keys(report).length) {
    newReportFormData.value.description = report.description || '';
    newReportFormData.value.viewers = report.viewers || [];
    newReportFormData.value.displayName = report.displayName ? i18n.global.t('common.copyOfItem', { item: report.displayName }) : '';
  } else {
    resetFormValues();
  }
});

</script>
