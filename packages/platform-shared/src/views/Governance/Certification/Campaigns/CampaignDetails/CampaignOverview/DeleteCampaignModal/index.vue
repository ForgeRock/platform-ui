<!-- Copyright 2023 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="DeleteCampaignModal"
    no-close-on-backdrop
    no-close-on-esc
    title-class="h5"
    title-tag="h2"
    :title="$t('governance.certificationDetails.deleteCampaignModal.title')">
    <div class="mb-4 d-block">
      {{ $t('governance.certificationDetails.deleteCampaignModal.text') }}
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        class="text-danger"
        @click="cancel">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        variant="danger"
        :disabled="loading"
        :show-spinner="loading"
        :button-text="$t('governance.certificationDetails.deleteCampaignModal.deleteButtonText')"
        :spinner-text="$t('common.deleting')"
        @click="deleteCampaign" />
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';

export default {
  name: 'FrDeleteCampaignModal',
  components: {
    BButton,
    BModal,
    FrButtonWithSpinner,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    deleteCampaign() {
      this.$emit('delete-campaign');
    },
  },
};
</script>
