<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="id"
    :ref="id"
    @hidden="$emit('hidden')"
    :title="$t('statePanel.title', { type: translatedItemType, futureState })">
    <div
      v-if="customMessage"
      v-html="customMessage" />
    <div v-else>
      {{ $t('statePanel.body', { type: translatedItemType.toLowerCase(), futureState: futureState.toLowerCase() }) }}
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        :class="`text-${variant}`"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="futureState"
        :disabled="isChanging"
        :show-spinner="isChanging"
        :spinner-text="futureState"
        :variant="variant"
        @click="$emit('change-state', !currentState)" />
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
 * Generic state modal emits an event changeState to request a state change.
 * Shows a spinner if isChanging attribute is provided
 * Expects to be closed by the method in charge of the state transition
 * Takes the translation of the item's type for use in text and optionally a custom message for modal body
 * Shows a default message that indicates the intention to change the current item's state to the opposite state or an optional custom message for the body
 */
export default {
  name: 'StateModal',
  components: {
    BButton,
    BModal,
    FrButtonWithSpinner,
  },
  computed: {
    futureState() {
      return this.currentState ? this.$t('common.deactivate') : this.$t('common.activate');
    },
    variant() {
      return this.currentState ? 'danger' : 'primary';
    },
  },
  props: {
    id: {
      type: String,
      default: 'stateModal',
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
    isChanging: {
      type: Boolean,
      default: false,
    },
    /**
     * Type of item being changed. Displayed in modal title
     */
    translatedItemType: {
      type: String,
      default: '',
    },
    /**
     * Current item's state
     */
    currentState: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
