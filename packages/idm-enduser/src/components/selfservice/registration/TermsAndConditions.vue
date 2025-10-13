<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="inline">
    <small class="form-text text-muted">
      {{ $t("pages.selfservice.registration.termsAndConditions.singlePage") }} <a
        href="#"
        @click.prevent="showModal">{{ $t("pages.selfservice.registration.termsAndConditions.title") }}</a>.
    </small>

    <BModal
      id="termsModal"
      hide-footer
      no-close-on-backdrop
      no-close-on-esc
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="$t('pages.selfservice.registration.termsAndConditions.title')">
      <div class="d-block text-center">
        <p v-html="terms" />
      </div>
    </BModal>
  </div>
  <div v-else>
    <h3>{{ $t("pages.selfservice.registration.termsAndConditions.title") }}</h3>
    <div class="d-block text-center">
      <p v-html="terms" />
    </div>

    <BButton
      @click="save"
      block
      size="lg"
      variant="primary">
      {{ $t("common.agree") }}
    </BButton>
  </div>
</template>

<script setup>
/**
 * @description Selfservice stage for terms and conditions depending on all in one displays as a dialog or inline text depending at allinone
 */
import { computed } from 'vue';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import { termsAndConditionsSanitizerConfig, sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';

const emit = defineEmits(['advanceStage']);

const { bvModal } = useBvModal();

const props = defineProps({
  selfServiceDetails: {
    type: Object,
    required: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const terms = computed(() => sanitize(props.selfServiceDetails.requirements.terms, termsAndConditionsSanitizerConfig));

/**
 * Saves the user's acceptance of the terms and conditions.
 */
function save() {
  emit('advanceStage', { accept: 'true' });
}

/**
 * Show the terms and conditions modal
 */
function showModal() {
  bvModal.value.show('termsModal');
}
</script>
