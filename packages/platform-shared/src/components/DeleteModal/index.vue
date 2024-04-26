<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="text-break"
    :id="id"
    :ref="id"
    :static="isTesting"
    @hidden="$emit('hidden')"
    :hide-header-close="isDeleting"
    no-close-on-backdrop
    no-close-on-esc
    title-tag="h2"
    title-class="h5"
    :title="$t('deletePanel.deleteTypeQuestion', { type: translatedItemType })">
    <div
      data-testid="delete-modal-custom-message"
      v-if="customMessage"
      v-html="customMessage" />
    <div
      data-testid="deletePanel-body"
      v-else>
      {{ $t('deletePanel.body', { type: translatedItemType.toLowerCase() }) }}
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        class="text-danger"
        :data-testid="`btn-cancel-${testid}`"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.delete')"
        :disabled="isDeleting"
        :show-spinner="isDeleting"
        :spinner-text="$t('common.deleting')"
        variant="danger"
        :data-testid="`btn-confirm-${testid}`"
        @click="$emit('delete-item')" />
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';

/**
 * Generic delete modal emits an event deleteItem on delete.
 * Shows a spinner if isDeleting attribute provided
 * Expects to be closed by method deleting the item
 * Takes the translation of the item's type for use in text and optionally a custom message for modal body
 */
export default {
  name: 'DeleteModal',
  components: {
    BButton,
    BModal,
    FrButtonWithSpinner,
  },
  props: {
    id: {
      type: String,
      default: 'deleteModal',
    },
    /**
     * Optional custom message to show in modal body-otherwise, type is used
     */
    customMessage: {
      type: String,
      default: null,
    },
    /**
     * Variable to determine when to show spinner in button
     */
    isDeleting: {
      type: Boolean,
      default: false,
    },
    /**
     * Type of item being deleted. Displayed in modal title
     */
    translatedItemType: {
      type: String,
      default: '',
    },
    testid: {
      type: String,
      default: '',
    },
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
