<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    size="lg"
    :title="$t('governance.certificationTask.lineItemCommentsModal.addComment')"
    title-class="h5"
    title-tag="h2"
    @hidden="resetModal">
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
  BModal,
  BButton,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';

export default {
  name: 'AddCommentModal',
  components: {
    FrButtonWithSpinner,
    BModal,
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
