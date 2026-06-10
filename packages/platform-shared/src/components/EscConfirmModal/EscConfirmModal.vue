<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="id"
    :cancel-title="$t('common.keepEditing')"
    cancel-variant="link"
    :ok-title="$t('common.discardChanges')"
    ok-variant="danger"
    :ref="id"
    :static="isTesting"
    title-tag="h2"
    title-class="h5"
    :title="title || $t('common.unsavedChangesTitle')"
    @ok="$emit('ok')"
    @cancel="$emit('cancel')">
    <p class="mb-0">
      {{ body || $t('common.unsavedChangesBody') }}
    </p>
  </BModal>
</template>

<script setup>
import {
  BModal,
} from 'bootstrap-vue';

/**
 * Confirmation modal shown when the user presses Esc inside a complex modal with unsaved changes.
 * The parent modal intercepts the BModal `@hide` event, calls `bvEvent.preventDefault()` when
 * `bvEvent.trigger === 'esc'`, and shows this component. Emits `confirm` when the user chooses
 * to discard changes and `cancel` when the user wants to keep editing.
 */

defineProps({
  /**
   * The BModal id attribute. Used to programmatically show/hide via $bvModal.
   */
  id: {
    type: String,
    default: 'escConfirmModal',
  },
  /**
   * Render the modal in static mode (inline, no teleport). Set true in unit tests.
   */
  isTesting: {
    type: Boolean,
    default: false,
  },
  /**
   * Optional override for the modal title. Defaults to the `common.unsavedChangesTitle` i18n key.
   */
  title: {
    type: String,
    default: '',
  },
  /**
   * Optional override for the modal body text. Defaults to the `common.unsavedChangesBody` i18n key.
   */
  body: {
    type: String,
    default: '',
  },
});

defineEmits(['ok', 'cancel']);
</script>
