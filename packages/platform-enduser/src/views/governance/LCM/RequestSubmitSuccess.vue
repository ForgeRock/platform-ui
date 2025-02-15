<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="text-center mb-5">
    <BImg
      class="m-4"
      :src="require('@forgerock/platform-shared/src/assets/images/check.svg')"
      alt="success icon"
    />
    <h2 class="h4">
      {{ $t('common.requestSubmitted') }}
    </h2>
    <p v-if="successText">
      {{ successText }}
    </p>
    <BButton
      v-if="requestId"
      variant="outline-primary"
      @click="$router.push({ name: 'MyRequestDetails', params: { requestId } })">
      {{ $t('common.viewRequest') }}
    </BButton>
  </div>
</template>

<script setup>
import { BButton, BImg } from 'bootstrap-vue';

defineProps({
  requestId: {
    type: String,
    default: '',
  },
  successText: {
    type: String,
    default: '',
  },
});

</script>
