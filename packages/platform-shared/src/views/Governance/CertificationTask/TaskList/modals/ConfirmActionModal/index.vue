<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    size="lg"
    ok-variant="primary"
    cancel-variant="link"
    :title="$t(`governance.certificationTask.actionsModal.${step === STEPS.DETAILS ? modalOptions.title : modalOptions.confirmTitle}`)"
    :static="isTesting"
    @hidden="reset">
    <template v-if="step === STEPS.DETAILS">
      <div class="modal-container">
        <span>{{ $t(`governance.certificationTask.actionsModal.${modalOptions.description}`) }}</span>
        <FrField
          v-model="confirmMessage"
          class="mb-4 mt-4"
          type="textarea"
          :label=" $t(`governance.certificationTask.actionsModal.${modalOptions.placeHolder}`)"
          :rows="4"
          :max-rows="4"
        />
      </div>
    </template>
    <template v-if="step === STEPS.CONFIRM">
      <div class="modal-container">
        <p>{{ $t(`governance.certificationTask.actionsModal.${modalOptions.confirmDescription}`) }}</p>
        <div class="alert fr-alert alert-warning">
          <FrIcon
            class="mr-2"
            name="error_outline"
          /><span>{{ $t('governance.certificationTask.actionsModal.warningDataMayBeInaccurate') }}</span>
        </div>
      </div>
    </template>
    <template #modal-footer="{ cancel, ok }">
      <div
        v-if="step === STEPS.CONFIRM && modalOptions.initialStep === STEPS.DETAILS"
        class="flex-grow-1">
        <BButton
          variant="link"
          @click="prevStep">
          {{ $t('common.previous') }}
        </BButton>
      </div>
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="primary"
        data-testid="btn-adv-step"
        @click="okHandler(ok)">
        {{ step === STEPS.DETAILS ? $t('common.next') : $t(`governance.certificationTask.actionsModal.${modalOptions.okLabel}`) }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export const STEPS = {
  DETAILS: 'DETAILS',
  CONFIRM: 'CONFIRM',
};

export default {
  name: 'ConfirmActionModal',
  components: {
    BButton,
    BModal,
    FrField,
    FrIcon,
  },
  data() {
    return {
      confirmMessage: '',
      isTesting: false,
      step: this.modalOptions.initialStep,
      STEPS,
    };
  },
  props: {
    modalOptions: {
      type: Object,
      default: () => ({}),
    },
    modalId: {
      type: String,
      default: 'CertificationTaskActionConfirmAccountModal',
    },
  },
  methods: {
    reset() {
      this.confirmMessage = '';
    },
    okHandler(ok) {
      if (this.step === STEPS.DETAILS) {
        this.nextStep();
      } else {
        this.modalOptions.okFunction(this.confirmMessage);
        ok();
      }
    },
    nextStep() {
      this.step = STEPS.CONFIRM;
    },
    prevStep() {
      this.step = STEPS.DETAILS;
    },
  },

  watch: {
    modalOptions: {
      deep: true,
      handler(val) {
        this.step = val.initialStep;
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-alert {
    display: flex;
    line-height: 1.25;

  &.alert-warning {
    border-left: 5px solid $warning;
    background-color: $fr-alert-warning-bg-color;
    color: $fr-alert-text-color;
  }
}
</style>
