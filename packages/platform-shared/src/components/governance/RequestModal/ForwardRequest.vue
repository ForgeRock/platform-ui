<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrForwardModalContent
      :description-text="$t('governance.requestModal.forward.description')"
      :comment-label="$t('governance.certificationTask.actionsModal.comment')"
      @request-comment="updateComment"
      @request-update-actors="updateActors"
    />
  </div>
</template>

<script setup>
/**
 * Centralizes the modal for forwarding a request.
 * @component ForwardRequest
 */
import FrForwardModalContent from '@forgerock/platform-shared/src/views/Governance/ForwardModalContent';

const emit = defineEmits(['request-update-actors', 'request-comment']);

/**
 * Update the 'actors' array of the request
 * @param {Object} value request info
 */
function updateActors(value) {
  emit('request-update-actors', value);
}

/**
 * Update the 'comments' on the request
 * @param {Object} value request info
 */
function updateComment(value) {
  emit('request-comment', value);
}
</script>
