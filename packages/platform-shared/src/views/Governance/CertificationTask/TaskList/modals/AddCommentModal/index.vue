<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    @hidden="resetModal">
    <template #modal-header="{ close }">
      <h5 class="modal-title">
        {{ $t('governance.certificationTask.lineItemCommentsModal.addComment') }}
      </h5>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <FrTextArea
      v-model="comment"
      name="comment"
      :label="$t('common.comment')"
      :rows="3" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('governance.certificationTask.actions.addComment')"
        :disabled="!comment || isSaving"
        :show-spinner="isSaving"
        :spinner-text="$t('common.saving')"
        variant="primary"
        @click="addComment" />
    </template>
  </BModal>
</template>

<script>
import {
  BButtonClose,
  BModal,
  BButton,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';

export default {
  name: 'AddCommentModal',
  components: {
    BButtonClose,
    FrButtonWithSpinner,
    BModal,
    FrIcon,
    FrTextArea,
    BButton,
  },
  props: {
    modalId: {
      type: String,
      default: 'CertificationTaskAddCommentAccountModal',
    },
  },
  data() {
    return {
      comment: null,
      isSaving: false,
    };
  },
  methods: {
    addComment() {
      this.isSaving = true;
      this.$emit('add-comment', this.comment);
    },
    resetModal() {
      this.comment = null;
      this.isSaving = false;
    },
  },
};
</script>
