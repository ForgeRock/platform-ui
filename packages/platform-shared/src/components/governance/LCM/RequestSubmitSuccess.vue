<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="text-center mb-5">
    <BImg
      class="m-4"
      :src="require('@forgerock/platform-shared/src/assets/images/check.svg')"
      alt=""
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
      @click="navigateToRequestDetails()">
      {{ $t('common.viewRequest') }}
    </BButton>
  </div>
</template>

<script setup>
import { BButton, BImg } from 'bootstrap-vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';

const router = useRouter();
const userStore = useUserStore();

const props = defineProps({
  requestId: {
    type: String,
    default: '',
  },
  successText: {
    type: String,
    default: '',
  },
});

function navigateToRequestDetails() {
  const componentName = userStore.adminUser ? 'RequestDetails' : 'MyRequestDetails';
  router.push({ name: componentName, params: { requestId: props.requestId } });
}

</script>
