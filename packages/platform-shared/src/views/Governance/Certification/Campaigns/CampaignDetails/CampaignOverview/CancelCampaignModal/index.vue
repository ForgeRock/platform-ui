<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="CancelCampaignModal"
    no-close-on-backdrop
    title-class="h5"
    title-tag="h2"
    :title="$t('governance.certificationDetails.cancelCampaignModal.title')">
    <div class="mb-4 d-block">
      {{ $t('governance.certificationDetails.cancelCampaignModal.text') }}
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
        :button-text="$t('governance.certificationDetails.cancelCampaignModal.saveButtonText')"
        :spinner-text="$t('common.canceling')"
        @click="save" />
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
  name: 'FrCancelCampaignModal',
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
    save() {
      this.$emit('cancel-campaign');
    },
  },
};
</script>
