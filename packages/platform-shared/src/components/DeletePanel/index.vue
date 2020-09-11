<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
        v-b-modal.deleteModal
        variant="danger">
        {{ $t('deletePanel.header', {type: translatedItemType}) }}
      </BButton>
    </BCard>

    <BModal
      id="deleteModal"
      ref="deleteModal"
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
  BModal,
  VBModal,
} from 'bootstrap-vue';

export default {
  name: 'DeletePanel',
  components: {
    BButton,
    BCard,
    BModal,
  },
  directives: {
    'b-modal': VBModal,
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
      this.$emit('deleteItem');
      this.$refs.deleteModal.hide();
    },
  },
};
</script>
