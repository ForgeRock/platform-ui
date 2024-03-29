<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard
      class="mb-5"
      data-testid="delete-panel">
      <h5 class="card-title">
        {{ $t('deletePanel.deleteType', {type: translatedItemType}) }}
      </h5>
      <p class="text-danger">
        {{ $t('common.cannotBeUndone') }}
      </p>
      <BButton
        variant="danger"
        @click="showModal">
        {{ $t('deletePanel.deleteType', {type: translatedItemType}) }}
      </BButton>
    </BCard>
    <FrDeleteModal
      :custom-message="customModalMessage"
      :is-deleting="isDeleting"
      :is-testing="isTesting"
      :translated-item-type="translatedItemType"
      @delete-item="deleteItem" />
  </div>
</template>

<script>
import {
  BButton,
  BCard,
} from 'bootstrap-vue';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';

/**
 * Generic delete panel shown in a Bootstrap card. Clicking the delete button
 * shows a modal for confirmation and emits an event delete-item on delete.
 */
export default {
  name: 'DeletePanel',
  components: {
    BButton,
    BCard,
    FrDeleteModal,
  },
  props: {
    /**
     * Custom message to show in modal body
     */
    customModalMessage: {
      type: String,
      default: null,
    },
    /**
     * Variable to determine when to show spinner in button in modal
     */
    isDeleting: {
      type: Boolean,
      default: false,
    },
    /**
     * Variable to determine when to show modal for component testing
     */
    isTesting: {
      type: Boolean,
      default: false,
    },
    /**
     * Type of item being deleted. Displayed in card header, button text, and modal title
     */
    translatedItemType: {
      type: String,
      default: '',
    },
  },
  methods: {
    deleteItem() {
      /**
        * triggered when delete confirmation button is clicked in modal
        */
      this.$emit('delete-item');
    },
    showModal() {
      this.$root.$emit('bv::show::modal', 'deleteModal');
    },
  },
};
</script>
