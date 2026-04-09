<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    size="md"
    ok-variant="primary"
    cancel-variant="link"
    title-class="h5"
    title-tag="h2"
    no-close-on-backdrop
    no-close-on-esc
    :title="i18n.global.t('governance.certificationTask.exportModal.title')"
    :static="isTesting"
    @hidden="resetModal">
    <div class="modal-container mt-2">
      <BRow>
        <BCol class="mx-1 mb-2">
          <span>{{ descriptionHeader }}</span>
        </BCol>
      </BRow>
      <BRow v-if="step === STEPS.EXPORT_SCOPE">
        <FrCardRadioInput
          v-for="rowOption in rowsOptions"
          :key="rowOption.value"
          class="my-2 mx-4"
          name="rowOptionRadio"
          :radio-value="rowOption.value"
          v-model="downloadOptions.rows">
          <BMedia no-body>
            <BMediaBody>
              <h3
                class="h5"
                :aria-label="rowOption.title">
                {{ rowOption.title }}
              </h3>
              <div class="d-block">
                {{ rowOption.description }}
              </div>
            </BMediaBody>
          </BMedia>
        </FrCardRadioInput>
      </BRow>
      <BRow v-else-if="step === STEPS.EXPORT_TYPE">
        <FrCardRadioInput
          v-for="formatOption in formatOptions"
          :key="formatOption.value"
          class="my-2 mx-4"
          name="formatOptionRadio"
          :radio-value="formatOption.value"
          v-model="downloadOptions.format">
          <BMedia no-body>
            <BMediaBody>
              <h3
                class="h5"
                :aria-label="formatOption.title">
                {{ formatOption.title }}
              </h3>
              <div class="d-block">
                {{ formatOption.description }}
              </div>
            </BMediaBody>
          </BMedia>
        </FrCardRadioInput>
      </BRow>
    </div>
    <template #modal-footer="{ cancel, ok }">
      <div
        v-if="step === STEPS.EXPORT_TYPE"
        class="flex-grow-1">
        <BButton
          variant="link"
          @click="prevStep">
          {{ i18n.global.t('common.back') }}
        </BButton>
      </div>
      <BButton
        variant="link"
        @click="cancel()">
        {{ i18n.global.t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        variant="primary"
        :disabled="isLoading"
        :button-text="i18n.global.t(`governance.certificationTask.exportModal.buttons.${step === STEPS.EXPORT_TYPE ? 'export' : 'next'}`)"
        :spinner-text="i18n.global.t(`governance.certificationTask.exportModal.buttons.${step === STEPS.EXPORT_TYPE ? 'export' : 'next'}`)"
        :show-spinner="isLoading"
        @click="okHandler(ok)" />
    </template>
  </BModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  BButton,
  BCol,
  BModal,
  BRow,
} from 'bootstrap-vue';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import i18n from '@/i18n';

const STEPS = {
  EXPORT_SCOPE: 'EXPORT_SCOPE',
  EXPORT_TYPE: 'EXPORT_TYPE',
};
const props = defineProps({
  modalId: {
    type: String,
    required: true,
  },
  grantType: {
    type: String,
    required: true,
  },
  totals: {
    type: Object,
    required: true,
  },
  okFunction: {
    type: Function,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});
// Options for how many items to export
const rowsOptions = computed(() => [
  {
    value: 'currentPage',
    title: i18n.global.t('governance.certificationTask.exportModal.currentPageTitle'),
    description: i18n.global.t('governance.certificationTask.exportModal.currentPageDescription', { count: props.totals?.currentPage?.toLocaleString() }),
  },
  {
    value: 'all',
    title: i18n.global.t('governance.certificationTask.exportModal.allItemsTitle'),
    description: i18n.global.t('governance.certificationTask.exportModal.allItemsDescription', { count: props.totals?.all?.toLocaleString(), type: i18n.global.t(`governance.certificationTask.exportModal.types.${props.grantType}`) }),
  },
]);
// Options for export file formats
const formatOptions = [
  {
    value: 'csv',
    title: i18n.global.t('governance.certificationTask.exportModal.csv'),
    description: i18n.global.t('governance.certificationTask.exportModal.csvDescription'),
  },
  {
    value: 'xlsx',
    title: i18n.global.t('governance.certificationTask.exportModal.xlsx'),
    description: i18n.global.t('governance.certificationTask.exportModal.xlsxDescription'),
  },
  {
    value: 'pdf',
    title: i18n.global.t('governance.certificationTask.exportModal.pdf'),
    description: i18n.global.t('governance.certificationTask.exportModal.pdfDescription'),
  },
];
const step = ref(STEPS.EXPORT_SCOPE);
const descriptionHeader = computed(() => {
  if (step.value === STEPS.EXPORT_SCOPE) {
    return i18n.global.t('governance.certificationTask.exportModal.descriptionRows', { type: i18n.global.t(`governance.certificationTask.exportModal.types.${props.grantType}`) });
  }
  return i18n.global.t('governance.certificationTask.exportModal.descriptionFormat', { type: i18n.global.t(`governance.certificationTask.exportModal.types.${props.grantType}`) });
});
const downloadOptions = ref({
  format: 'csv',
  rows: 'currentPage',
});

/**
 * Handler for the modal's Next button. Moves to the confirm step.
 */
function nextStep() {
  step.value = STEPS.EXPORT_TYPE;
}

/**
 * Handler for the modal's Previous button. Moves back to the details step.
 */
function prevStep() {
  step.value = STEPS.EXPORT_SCOPE;
}

/**
 * Resets the modal to the default state. Called when the modal is closed.
 */
function resetModal() {
  step.value = STEPS.EXPORT_SCOPE;
  downloadOptions.value = {
    format: 'csv',
    rows: 'currentPage',
  };
}

/**
 * Handler for the modal's OK button. If on the details step, moves to the confirm step. If on the confirm step, calls the okFunction prop and closes the modal.
 * @param {Function} ok - The function to call to close the modal
 */
async function okHandler(ok) {
  if (step.value === STEPS.EXPORT_SCOPE) {
    nextStep();
  } else {
    await props.okFunction(downloadOptions.value);
    ok();
  }
}

</script>
