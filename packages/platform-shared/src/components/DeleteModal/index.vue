<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="deleteModal"
    ref="deleteModal"
    @hidden="$emit('hidden')"
    :title="$t('deletePanel.header', { type: translatedItemType })">
    <div>
      {{ $t('deletePanel.body', { itemName }) }}
    </div>
    <template v-slot:modal-footer="{ cancel }">
      <BButton
        variant="link"
        class="text-danger"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="danger"
        @click="deleteItem">
        {{ $t('common.delete') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';

/**
 * Generic delete panel shown in a Bootstrap card.
 * Shows a BModal for confirmation and emits an event deleteItem on delete.
 * Takes the name of the item being deleted and a translation of the item's type for use in text.
 */
export default {
  name: 'DeleteModal',
  components: {
    BButton,
    BModal,
  },
  props: {
    /**
     * Name of item being deleted. Displayed in modal body
     */
    itemName: {
      type: String,
      default: '',
    },
    /**
     * Type of item being deleted. Displayed in modal title
     */
    translatedItemType: {
      type: String,
      default: '',
    },
  },
  methods: {
    /**
     * Hide modal and emit delete-item event
     */
    deleteItem() {
      this.$refs.deleteModal.hide();
      /**
        * triggered when delete confirmation button is clicked
        */
      this.$emit('delete-item');
    },
  },
};
</script>
