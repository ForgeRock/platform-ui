<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    size="lg"
    ok-variant="primary"
    cancel-variant="link"
    :ok-title="$t(`governance.certificationTask.actionsModal.${modalOptions.okLabel}`)"
    @ok="modalOptions.okFunction(confirmMessage)"
    :title="$t(`governance.certificationTask.actionsModal.${modalOptions.title}`)"
    :static="isTesting"
    @hidden="reset">
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
  </BModal>
</template>

<script>
import {
  BModal,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'CertificationTaskActionConfirmModal',
  components: {
    BModal,
    FrField,
  },
  data() {
    return {
      confirmMessage: '',
      isTesting: false,
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
  },
};
</script>
