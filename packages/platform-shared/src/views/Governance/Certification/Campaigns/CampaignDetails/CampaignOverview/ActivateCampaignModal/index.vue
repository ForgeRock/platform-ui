<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="ActivateCampaignModal"
    no-close-on-backdrop
    title-class="h5"
    title-tag="h2"
    :title="$t('governance.certificationDetails.activateCampaignModal.title')">
    <div class="mb-4 d-block">
      {{ $t('governance.certificationDetails.activateCampaignModal.text') }}
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        variant="primary"
        :disabled="loading"
        :show-spinner="loading"
        :button-text="$t('governance.certificationDetails.activateCampaignModal.activateButtonText')"
        :spinner-text="$t('governance.certificationDetails.activateCampaignModal.activateButtonSpinnerText')"
        @click="activateCampaign" />
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
  name: 'FrActivateCampaignModal',
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
    activateCampaign() {
      this.$emit('activate-campaign');
    },
  },
};
</script>
