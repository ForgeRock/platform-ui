<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    @ok="forwardItem"
    :id="modalId"
    :static="isTesting"
    :title="$t('governance.violations.forwardViolation')"
    cancel-variant="link"
    size="lg">
    <FrForwardModalContent
      :description-text="$t('governance.certificationTask.actionsModal.forwardItemDescription')"
      :comment-label="$t('governance.certificationTask.actionsModal.comment')"
      @request-comment="updateComment"
      @request-update-actors="updateActors" />
  </BModal>
</template>

<script setup>
/**
 * Modal for forwarding a violation to another actor
 */
import { ref } from 'vue';
import { BModal } from 'bootstrap-vue';
import FrForwardModalContent from '@forgerock/platform-shared/src/views/Governance/ForwardModalContent';

const emit = defineEmits(['forward-item']);

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  modalId: {
    type: String,
    default: 'violation-forward-modal',
  },
});

const actorId = ref('');
const comment = ref('');

function updateActors(value) {
  actorId.value = value;
}

function updateComment(value) {
  comment.value = value;
}

function forwardItem() {
  emit('forward-item', { actorId: actorId.value, comment: comment.value });
}
</script>
