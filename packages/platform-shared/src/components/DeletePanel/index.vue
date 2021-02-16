<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard
      class="mb-5">
      <h5 class="card-title">
        {{ $t('deletePanel.header', {type: translatedItemType}) }}
      </h5>
      <p class="text-danger">
        {{ $t('common.cannotBeUndone') }}
      </p>
      <BButton
        variant="danger"
        @click="showModal">
        {{ $t('deletePanel.header', {type: translatedItemType}) }}
      </BButton>
    </BCard>
    <FrDeleteModal
      :item-name="itemName"
      :translated-item-type="translatedItemType"
      @delete-item="deleteItem" />
  </div>
</template>

/**
 * Generic delete panel shown in a Bootstrap card. Shows a BModal for confirmation and emits an event deleteItem on delete.
 * Takes the name of the item being deleted and a translation of the item's type for use in text.
 */
<script>
import {
  BButton,
  BCard,
} from 'bootstrap-vue';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';

export default {
  name: 'DeletePanel',
  components: {
    BButton,
    BCard,
    FrDeleteModal,
  },
  props: {
    translatedItemType: {
      type: String,
      default: '',
    },
    itemName: {
      type: String,
      default: '',
    },
  },
  methods: {
    deleteItem() {
      this.$emit('delete-item');
    },
    showModal() {
      this.$root.$emit('bv::show::modal', 'deleteModal');
    },
  },
};
</script>
