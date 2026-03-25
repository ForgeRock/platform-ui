<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    size="lg"
    title-class="h5"
    title-tag="h2"
    no-close-on-backdrop
    no-close-on-esc
    :title="i18n.global.t('governance.certificationTask.actionsModal.completeDecisionsModalTitle')"
    :static="isTesting"
    @hidden="step = STEPS.DETAILS">
    <div class="modal-container mt-4">
      <template v-if="step === STEPS.DETAILS">
        <BRow>
          <BCol
            class="d-flex justify-content-center"
            cols="12"
            md="12"
            lg="12">
            <div>
              <h2 class="h5 pie-header">
                {{ i18n.global.t('governance.certificationTask.decisionsTaken') }}
              </h2>
              <div class="pie-container mb-4">
                <FrPieChart
                  id="modal-decisions-chart"
                  hide-tooltip
                  legend-class="decisions-legend"
                  show-legend-count
                  :data="chartDecisions"
                  :no-data-label="i18n.global.t('governance.certificationTask.noDecisions')"
                  :height="120"
                  :radius="50"
                  :stroke-width="1"
                  :width="120"
                />
              </div>
            </div>
          </BCol>
        </BRow>
        <BRow>
          <BCol class="mx-1">
            <span>{{ i18n.global.t('governance.certificationTask.actionsModal.completeDecisionsModalDescription') }}</span>
          </BCol>
        </BRow>
      </template>
      <template v-else-if="step === STEPS.CONFIRM">
        <p>{{ i18n.global.t('governance.certificationTask.actionsModal.completeDecisionsModalConfirmDescription') }}</p>
        <div class="alert d-flex fr-alert alert-warning">
          <FrIcon
            icon-class="mr-2"
            name="error_outline">
            {{ i18n.global.t('governance.certificationTask.actionsModal.completeDecisionsModalConfirmWarning') }}
          </FrIcon>
        </div>
      </template>
    </div>
    <template #modal-footer="{ cancel, ok }">
      <BButton
        v-if="step === STEPS.CONFIRM"
        variant="link"
        @click="prevStep">
        {{ i18n.global.t('common.back') }}
      </BButton>
      <BButton
        v-if="step === STEPS.DETAILS"
        variant="link"
        @click="cancel()">
        {{ i18n.global.t('governance.certificationTask.actionsModal.completeDecisionsModalContinue') }}
      </BButton>
      <BButton
        variant="primary"
        :class="{ 'ml-auto': step === STEPS.CONFIRM }"
        @click="okHandler(ok)">
        {{ i18n.global.t('governance.certificationTask.actionsModal.completeDecisionsModalSignOff') }}
      </BButton>
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
import FrPieChart from '@forgerock/platform-shared/src/components/Visualization/Charts/PieChart';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';
import styles from '@/scss/main.scss';

const STEPS = {
  DETAILS: 'DETAILS',
  CONFIRM: 'CONFIRM',
};

const props = defineProps({
  modalId: {
    type: String,
    default: 'certification-task-decisions-complete-modal',
  },
  campaign: {
    type: Object,
    required: true,
  },
  totals: {
    type: Object,
    default: () => ({}),
  },
  okFunction: {
    type: Function,
    required: true,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});
const step = ref(STEPS.DETAILS);

/**
 * Handler for the modal's Next button. Moves to the confirm step.
 */
function nextStep() {
  step.value = STEPS.CONFIRM;
}

/**
 * Handler for the modal's Previous button. Moves back to the details step.
 */
function prevStep() {
  step.value = STEPS.DETAILS;
}

/**
 * Handler for the modal's OK button. If on the details step, moves to the confirm step. If on the confirm step, calls the okFunction prop and closes the modal.
 * @param {Function} ok - The function to call to close the modal
 */
function okHandler(ok) {
  if (step.value === STEPS.DETAILS) {
    nextStep();
  } else {
    props.okFunction();
    ok();
  }
}

/**
 * Automatically calculates the data for the decisions pie chart based on totals and campaign properties
 */
const chartDecisions = computed(() => {
  if (!props.totals) return [];
  const certified = props.totals.certify || 0;
  const revoke = props.totals.revoke || 0;
  const exception = props.totals.exception || 0;
  const decisions = [
    {
      label: i18n.global.t('governance.certificationTask.certified'),
      color: styles.green,
      value: certified,
    },
    {
      label: i18n.global.t('governance.certificationTask.revoked'),
      color: styles.blue,
      value: revoke,
    },
  ];
  if (props.campaign?.exceptionDuration > 0) {
    decisions.push({
      label: i18n.global.t('governance.certificationTask.exception'),
      color: styles.yellow,
      value: exception,
    });
  }
  return decisions;
});
</script>

<style lang="scss" scoped>
.fr-alert {
  line-height: 1.25;

  &.alert-warning {
    border-left: 5px solid $warning;
    background-color: $fr-alert-warning-bg-color;
    color: $fr-alert-text-color;
  }
}

.pie-header {
  margin-bottom: 1rem;
  text-align: center;
}

.pie-container {
  :deep(> div) {
    display: flex;
    justify-content: center;
  }
  :deep(.decisions-legend) {
    margin-top: 1.5rem;
    margin-left: 1rem;
  }
}
</style>
