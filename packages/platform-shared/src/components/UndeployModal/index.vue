<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="id"
    :ref="id"
    :static="isTesting"
    @hidden="$emit('hidden')"
    :hide-header-close="isUndeploying"
    no-close-on-backdrop
    no-close-on-esc
    :title="$t('undeployPanel.undeployTypeQuestion', { type: translatedItemType })"
    data-testid="modal-undeploy">
    <div
      data-testid="undeploy-modal-custom-message"
      v-if="customMessage"
      v-html="customMessage" />
    <div
      data-testid="undeployPanel-body"
      v-else>
      {{ $t('undeployPanel.body', { type: translatedItemType.toLowerCase() }) }}
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        data-testid="btn-undeploy-cancel"
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.undeploy')"
        :disabled="isUndeploying"
        :show-spinner="isUndeploying"
        :spinner-text="$t('common.undeploying')"
        variant="warning"
        :data-testid="`btn-undeploy-${translatedItemType.toLowerCase()}-okay`"
        @click="$emit('undeploy-item')" />
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
 * Generic undeploy modal emits an event undeployItem on undeploy.
 * Shows a spinner if isUndeploying attribute provided
 * Expects to be closed by method undeploying the item
 * Takes the translation of the item's type for use in text and optionally a custom message for modal body
 */
export default {
  name: 'UndeployModal',
  components: {
    BButton,
    BModal,
    FrButtonWithSpinner,
  },
  props: {
    id: {
      type: String,
      default: 'undeployModal',
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
    isUndeploying: {
      type: Boolean,
      default: false,
    },
    /**
     * Type of item being undeployed. Displayed in modal title
     */
    translatedItemType: {
      type: String,
      default: '',
    },
    testid: {
      type: String,
      default: 'btn-undeploy',
    },
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
