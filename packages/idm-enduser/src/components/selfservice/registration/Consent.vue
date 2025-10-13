<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <h3 v-if="!inline">
      {{ $t("pages.selfservice.registration.consent.title") }}
    </h3>
    <p>{{ selfServiceDetails.requirements.consent }}</p>

    <BButton
      v-if="!inline"
      @click="save"
      block
      size="lg"
      variant="primary">
      {{ $t("common.form.agree") }}
    </BButton>
  </div>
</template>

<script setup>
/**
 * @description Selfservice stage for consent depending on all in one displays as a dialog or a basic page text display
 */
import { BButton } from 'bootstrap-vue';

const emit = defineEmits(['advanceStage']);

defineProps({
  selfServiceDetails: {
    type: Object,
    required: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

function getData() {
  return {
    consentGiven: 'true',
  };
}

function save() {
  emit('advanceStage', getData());
}
</script>
