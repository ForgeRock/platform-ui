<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver
    v-slot="{ invalid }"
    ref="observer">
    <BModal
      :id="modalId"
      :ok-disabled="invalid"
      :ok-title="$t('governance.certificationTask.actionsModal.forwardItem')"
      :title="$t('governance.certificationTask.actionsModal.forwardItem')"
      :static="isTesting"
      @ok="forwardItem"
      cancel-variant="link"
      ok-variant="info"
      size="lg">
      <FrForwardModalContent
        :description-text="$t('governance.certificationTask.actionsModal.forwardItemDescription')"
        :comment-label="$t('governance.certificationTask.actionsModal.comment')"
        @request-comment="updateComment"
        @request-update-actors="updateActors"
      />
    </BModal>
  </ValidationObserver>
</template>

<script>
import { BModal } from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import FrForwardModalContent from '@forgerock/platform-shared/src/views/Governance/ForwardModalContent';

export default {
  name: 'CertificationForwardModal',
  components: {
    BModal,
    FrForwardModalContent,
    ValidationObserver,
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
  },
  data() {
    return {
      comment: '',
      isTesting: false,
      newActorId: '',
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
  },
};
</script>

<style lang="scss" scoped>
.input-line-height {
  line-height: 1.2;
}
</style>
