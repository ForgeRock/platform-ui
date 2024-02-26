<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-25px">
    <div class="p-25px">
      {{ $t('governance.requestModal.subtitle', { modal: $t('common.reject').toLowerCase() }) }}
    </div>
    <FrField
      @input="$emit('request-comment', $event);"
      class="mb-4"
      type="textarea"
      validation="required"
      name="rejectComment"
      :label="$t('governance.requestModal.reject.justification')"
      :description="$t('governance.requestModal.reject.footer')" />
  </div>
</template>

<script setup>
/**
 * Displays the modal subtitle for reject a request.
 * @component RejectRequest
 */
import FrField from '@forgerock/platform-shared/src/components/Field';

defineEmits(['request-comment']);
</script>
<style scoped>
  .p-25px {
    padding-bottom: 25px;
  }
</style>
