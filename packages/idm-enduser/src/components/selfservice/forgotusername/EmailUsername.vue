<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrAlert
    variant="success"
    show>
    {{ $t('pages.selfservice.forgotUsername.emailSent') }}
  </FrAlert>
</template>

<script setup>
/**
  * @description Selfservice stage for username recovery, displays a message notifying a user they have been sent an email
  *
  * */
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
</script>
