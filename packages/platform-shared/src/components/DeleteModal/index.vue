<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="deleteModal"
    ref="deleteModal"
    @hidden="$emit('hidden')"
    :title="$t('deletePanel.header', {type: translatedItemType})">
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

/**
 * Generic delete panel shown in a Bootstrap card. Shows a BModal for confirmation and emits an event deleteItem on delete.
 * Takes the name of the item being deleted and a translation of the item's type for use in text.
 */
<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';

export default {
  name: 'DeleteModal',
  components: {
    BButton,
    BModal,
  },
  props: {
    itemName: {
      type: String,
      default: '',
    },
    translatedItemType: {
      type: String,
      default: '',
    },
  },
  methods: {
    deleteItem() {
      this.$refs.deleteModal.hide();
      this.$emit('delete-item');
    },
  },
};
</script>
