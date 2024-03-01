<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pb-25px">
    <div class="pb-25px">
      {{ $t('governance.requestModal.subtitle', { modal: $t('common.reject').toLowerCase() }) }}
    </div>
    <FrField
      @input="$emit('request-comment', $event);"
      class="mb-4"
      type="textarea"
      :validation="{ required: requireJustification }"
      name="rejectComment"
      :label="$t('governance.requestModal.justification')"
      :description="$t('governance.requestModal.reject.justificationDescription')" />
  </div>
</template>

<script setup>
/**
 * Displays the modal with a subtitle and justification field to reject a request.
 * @component RejectRequest
 */
import FrField from '@forgerock/platform-shared/src/components/Field';

defineProps({
  requireJustification: {
    default: false,
    type: Boolean,
  },
});

defineEmits(['request-comment']);
</script>

<style lang="scss" scoped>
.pb-25px {
  padding-bottom: 25px;
}
</style>
