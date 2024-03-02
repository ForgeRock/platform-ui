<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      :id="modalId"
      size="lg"
      ok-variant="primary"
      cancel-variant="link"
      :title="$t(`governance.certificationTask.actionsModal.${step === STEPS.DETAILS ? modalOptions.title : modalOptions.confirmTitle}`)"
      :static="isTesting"
      @hidden="reset">
      <div class="modal-container">
        <template v-if="step === STEPS.DETAILS">
          <span>{{ $t(`governance.certificationTask.actionsModal.${modalOptions.description}`) }}</span>
          <FrField
            v-model="confirmMessage"
            class="mb-4 mt-4"
            type="textarea"
            :label=" $t(`governance.certificationTask.actionsModal.${modalOptions.placeHolder}`)"
            :rows="4"
            :max-rows="4"
            :validation="{ required: modalOptions.requireJustification }"
          />
        </template>
        <template v-else-if="step === STEPS.CONFIRM">
          <p>{{ $t(`governance.certificationTask.actionsModal.${modalOptions.confirmDescription}`) }}</p>
          <div class="alert d-flex fr-alert alert-warning">
            <FrIcon
              icon-class="mr-2"
              name="error_outline">
              {{ $t('governance.certificationTask.actionsModal.warningDataMayBeInaccurate') }}
            </FrIcon>
          </div>
        </template>
      </div>
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
          :disabled="!valid"
          @click="okHandler(ok)">
          {{ step === STEPS.DETAILS ? $t('common.next') : $t(`governance.certificationTask.actionsModal.${modalOptions.okLabel}`) }}
        </BButton>
      </template>
    </BModal>
  </VeeForm>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { Form as VeeForm } from 'vee-validate';

export const STEPS = {
  DETAILS: 'DETAILS',
  CONFIRM: 'CONFIRM',
};

export default {
  name: 'ConfirmActionModal',
  components: {
    BButton,
    BModal,
    VeeForm,
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
  line-height: 1.25;

  &.alert-warning {
    border-left: 5px solid $warning;
    background-color: $fr-alert-warning-bg-color;
    color: $fr-alert-text-color;
  }
}
</style>
