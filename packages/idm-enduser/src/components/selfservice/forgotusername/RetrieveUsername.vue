<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrAlert
    v-if="selfServiceDetails?.additions?.userName"
    variant="success"
    show>
    {{ $t('pages.selfservice.forgotUsername.yourUsername', {username: selfServiceDetails.additions.userName}) }}
  </FrAlert>
  <template v-else>
    <FrAlert
      variant="danger"
      show>
      <b>{{ $t('pages.selfservice.forgotUsername.unableToRetrieve') }}</b>
    </FrAlert>
    <div class="mt-2">
      <BLink @click="emit('load-stage')">
        {{ $t("pages.selfservice.forgotUsername.tryAgain") }}
      </BLink>
    </div>
  </template>
</template>

<script setup>
/**
   * @description Selfservice stage for username recovery, displays the found username
   *
   * */
import { BLink } from 'bootstrap-vue';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';

defineProps({
  selfServiceDetails: {
    required: true,
    type: Object,
  },
});

const emit = defineEmits(['load-stage']);
</script>
