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
    :title="i18n.global.t('governance.certificationTask.exportModal.title')"
    :static="isTesting"
    @shown="resetModal"
    @hidden="resetModal">
    <div class="modal-container mt-2">
      <BRow>
        <BCol class="mx-1 mb-2">
          <span>{{ descriptionHeader }}</span>
        </BCol>
      </BRow>
      <BRow v-if="step === STEPS.EXPORT_ITEM_TYPE">
        <FrCardRadioInput
          v-for="itemTypeOption in [allTypesOption, ...itemTypeOptions]"
          :key="itemTypeOption.value"
          class="my-2 mx-4"
          name="itemTypeOptionRadio"
          :radio-value="itemTypeOption.value"
          v-model="downloadOptions.itemType">
          <BMedia no-body>
            <BMediaBody>
              <h3 class="h5">
                {{ itemTypeOption.title }}
              </h3>
              <div class="d-block">
                {{ itemTypeOption.description }}
              </div>
            </BMediaBody>
          </BMedia>
        </FrCardRadioInput>
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
              <h3 class="h5">
                {{ rowOption.title }}
              </h3>
              <div class="d-block">
                {{ rowOption.description }}
              </div>
            </BMediaBody>
          </BMedia>
        </FrCardRadioInput>
      </BRow>
      <BRow v-if="step === STEPS.EXPORT_TYPE">
        <FrCardRadioInput
          v-for="formatOption in formatOptions"
          :key="formatOption.value"
          class="my-2 mx-4"
          name="formatOptionRadio"
          :radio-value="formatOption.value"
          v-model="downloadOptions.format">
          <BMedia no-body>
            <BMediaBody>
              <h3 class="h5">
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
        v-if="step !== firstStep"
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
  EXPORT_ITEM_TYPE: 'EXPORT_ITEM_TYPE',
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
  /**
   * Skips the "Current Page / All Rows" step and opens straight on the format
   * options. For exports with no pagination context behind the totals (e.g.
   * the campaign revokes worklist), where the scope choice would be ignored
   * anyway.
   */
  skipScopeStep: {
    type: Boolean,
    default: false,
  },
  /**
   * Per-item-type export choices for campaigns whose worklist mixes item
   * types (identity/agentAccess campaigns hold account grants, entitlement
   * grants and role memberships). Each entry: { value, count } — value is the
   * REVOKES_ITEM_TYPES key, count the group's pending-revoke total. When
   * provided, the modal opens on an item-type step where an "all types"
   * choice exports one file per type in a single run; null keeps the
   * single-file behavior.
   */
  itemTypeOptions: {
    type: Array,
    default: null,
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
// Per-item-type choices — each type downloads as its own file with its own
// columns, so mixed campaigns pick which slice to export. The leading 'all'
// choice exports every type in one go (one file per type). A single entry
// presets the choice without showing the step; an empty list behaves like
// null (no type dimension).
const itemTypeOptions = computed(() => (props.itemTypeOptions || []).map((option) => ({
  value: option.value,
  count: option.count ?? 0,
  title: i18n.global.t(`governance.certificationDetails.exportRevocationDecisionsTypes.${option.value}`),
  description: i18n.global.t('governance.certificationDetails.exportRevocationDecisionsTypeCount', { count: (option.count ?? 0).toLocaleString() }),
})));
const hasTypeStep = computed(() => itemTypeOptions.value.length > 1);
const allTypesOption = computed(() => ({
  value: 'all',
  title: i18n.global.t('governance.certificationDetails.exportRevocationDecisionsTypes.all'),
  description: i18n.global.t('governance.certificationDetails.exportRevocationDecisionsTypeAllDescription', {
    count: itemTypeOptions.value.reduce((sum, option) => sum + (option.count ?? 0), 0).toLocaleString(),
  }),
}));

/**
 * The steps this modal instance shows, in order: the item-type step only for
 * mixed-type campaigns, the rows-scope step only when not skipped.
 * @returns {Array<string>} step ids in display order.
 */
function visibleSteps() {
  const steps = [];
  if (hasTypeStep.value) {
    steps.push(STEPS.EXPORT_ITEM_TYPE);
  }
  if (!props.skipScopeStep) {
    steps.push(STEPS.EXPORT_SCOPE);
  }
  steps.push(STEPS.EXPORT_TYPE);
  return steps;
}

const firstStep = computed(() => visibleSteps()[0]);
const step = ref(firstStep.value);
const descriptionHeader = computed(() => {
  if (step.value === STEPS.EXPORT_ITEM_TYPE) {
    return i18n.global.t('governance.certificationDetails.exportRevocationDecisionsTypeDescription');
  }
  if (step.value === STEPS.EXPORT_SCOPE) {
    return i18n.global.t('governance.certificationTask.exportModal.descriptionRows', { type: i18n.global.t(`governance.certificationTask.exportModal.types.${props.grantType}`) });
  }
  return i18n.global.t('governance.certificationTask.exportModal.descriptionFormat', { type: i18n.global.t(`governance.certificationTask.exportModal.types.${props.grantType}`) });
});
const downloadOptions = ref({
  format: 'csv',
  rows: 'currentPage',
  // a single available type is preset without showing the step
  itemType: itemTypeOptions.value.length === 1 ? itemTypeOptions.value[0].value : null,
});

/**
 * Handler for the modal's Next button. Moves to the confirm step.
 */
function nextStep() {
  const stepOrder = visibleSteps();
  const index = stepOrder.indexOf(step.value);
  step.value = stepOrder[Math.min(index + 1, stepOrder.length - 1)];
}

/**
 * Handler for the modal's Previous button. Moves back one step.
 */
function prevStep() {
  const stepOrder = visibleSteps();
  const index = stepOrder.indexOf(step.value);
  step.value = stepOrder[Math.max(index - 1, 0)];
}

/**
 * Resets the modal to the default state. Called when the modal is closed and
 * again when it finishes showing: the step ref initializes at setup, before
 * the caller's async probes populate itemTypeOptions, so a first open would
 * otherwise land on a stale step (e.g. straight to the format options on a
 * mixed-type campaign).
 */
function resetModal() {
  step.value = firstStep.value;
  downloadOptions.value = {
    format: 'csv',
    rows: 'currentPage',
    itemType: itemTypeOptions.value.length === 1 ? itemTypeOptions.value[0].value : null,
  };
}

/**
 * Handler for the modal's OK button. If not on the final step, moves to the
 * next step. If on the confirm step, calls the okFunction prop and closes the modal.
 * @param {Function} ok - The function to call to close the modal
 */
async function okHandler(ok) {
  if (step.value !== STEPS.EXPORT_TYPE) {
    nextStep();
  } else {
    await props.okFunction(downloadOptions.value);
    ok();
  }
}

</script>
