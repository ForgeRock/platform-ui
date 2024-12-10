<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    ref="observer"
    as="span">
    <BModal
      :id="modalId"
      :title="$t('governance.certificationTask.actionsModal.forwardItem')"
      :static="isTesting"
      @hidden="resetModal"
      cancel-variant="link"
      ok-variant="info"
      size="lg">
      <FrForwardModalContent
        v-if="step === STEPS.DETAILS"
        :description-text="$t('governance.certificationTask.actionsModal.forwardItemDescription')"
        :comment-label="$t('governance.certificationTask.actionsModal.comment')"
        @request-comment="updateComment"
        @request-update-actors="updateActors"
      />
      <template v-if="step === STEPS.CONFIRM">
        <div class="modal-container">
          <p>{{ $t(`governance.certificationTask.actionsModal.forwardItemConfirmDescription`) }}</p>
          <div class="alert fr-alert alert-warning">
            <FrIcon
              icon-class="mr-2"
              name="error_outline">
              {{ $t('governance.certificationTask.actionsModal.warningDataMayBeInaccurate') }}
            </FrIcon>
          </div>
        </div>
      </template>
      <template #modal-footer="{ cancel, ok }">
        <div
          v-if="step === STEPS.CONFIRM"
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
          :disabled="!valid"
          @click="okHandler(ok)">
          {{ step === STEPS.DETAILS && showConfirm ? $t('common.next') : $t('governance.certificationTask.actionsModal.forwardItem') }}
        </BButton>
      </template>
    </BModal>
  </VeeForm>
</template>

<script>
import { BButton, BModal } from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrForwardModalContent from '@forgerock/platform-shared/src/views/Governance/ForwardModalContent';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const STEPS = {
  DETAILS: 'DETAILS',
  CONFIRM: 'CONFIRM',
};

export default {
  name: 'CertificationForwardModal',
  components: {
    BButton,
    BModal,
    FrForwardModalContent,
    FrIcon,
    VeeForm,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
    bulk: {
      type: Boolean,
      default: false,
    },
    modalId: {
      type: String,
      default: 'CertificationTaskForwardAccountModal',
    },
    showConfirm: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      comment: '',
      isTesting: false,
      newActorId: '',
      step: STEPS.DETAILS,
      STEPS,
    };
  },

  methods: {
    forwardItem() {
      const payload = {
        id: this.bulk ? undefined : this.id,
        comment: this.comment,
        newActorId: this.newActorId,
      };
      const emitter = this.bulk ? 'forward-bulk' : 'forward-item';
      this.$emit(emitter, payload);
    },
    updateActors(value) {
      this.newActorId = value;
    },
    updateComment(value) {
      this.comment = value;
    },
    okHandler(ok) {
      if (this.step === STEPS.DETAILS) {
        this.nextStep();
      } else {
        this.forwardItem();
        ok();
      }
    },
    resetModal() {
      this.step = STEPS.DETAILS;
      this.comment = '';
      this.newActorId = '';
    },
    nextStep() {
      this.step = STEPS.CONFIRM;
    },
    prevStep() {
      this.step = STEPS.DETAILS;
    },
  },
};
</script>

<style lang="scss" scoped>
.input-line-height {
  line-height: 1.2;
}

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
