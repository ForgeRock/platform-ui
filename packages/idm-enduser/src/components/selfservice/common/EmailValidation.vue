<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrAlert show>
    {{ $t(`pages.selfservice.headers.${apiType}.emailSent`) }}
  </FrAlert>
</template>

<script setup>
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
/**
 * @description Selfservice stage for multiple selfservice flows, displays a email sent message
 *
 * */
defineProps({
  apiType: { type: String, required: true },
});
</script>
