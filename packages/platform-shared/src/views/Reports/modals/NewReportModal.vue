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
    :static="isTesting"
    :title="modalTitle"
    @hidden="handleModalHide"
    @ok="handleNextClick">
    <FrReportSettingsDetailsForm
      v-model="newReportFormData"
      :is-testing="isTesting"
      :report-names="reportNames"
      @valid-change="valid = $event" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="submitButtonText"
        :disabled="!valid || reportIsSaving"
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
import { startCase } from 'lodash';
import { BButton, BModal } from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import { defaultGroups } from '../composables/ManagedUsers';
import FrReportSettingsDetailsForm from '../ReportTemplate/ReportSettingsDetailsForm';
import i18n from '@/i18n';

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
const valid = ref(false);
const newReportFormData = ref({
  name: '',
  description: '',
  report_viewer: false,
  viewers: [],
});

// Methods
/**
 * Resets the settings details form on modal hide
 */
function handleModalHide() {
  newReportFormData.value.name = '';
  newReportFormData.value.description = '';
  newReportFormData.value.report_viewer = false;
  newReportFormData.value.viewers = [];
  emit('hidden');
}

/**
 * Handles the form submission
 */
function handleNextClick() {
  const { name, description, viewers } = newReportFormData.value;
  const checkedGroups = defaultGroups.filter((group) => newReportFormData.value[group]);
  const emitType = Object.keys(props.reportDataForDuplication).length ? 'duplicate-report' : 'new-report-save';

  emit(emitType, {
    description,
    name,
    viewers: [...checkedGroups, ...viewers],
    // conditional properties
    ...(emitType === 'duplicate-report' && { originalReportName: props.reportDataForDuplication.id }),
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
    newReportFormData.value.name = report.id ? i18n.global.t('common.copyOfItem', { item: startCase(report.id.toLowerCase()) }) : '';
    newReportFormData.value.description = report.description || '';
    newReportFormData.value.viewers = report.viewers ? report.viewers.filter((viewer) => !viewer.includes('report_viewer')) : [];
    newReportFormData.value.report_viewer = report.viewers ? report.viewers.includes('report_viewer') : false;
  }
});
</script>
