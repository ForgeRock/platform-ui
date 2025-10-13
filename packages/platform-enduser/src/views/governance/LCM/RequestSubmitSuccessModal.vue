<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="successful-submit"
    size="lg"
    no-close-on-backdrop
    no-close-on-esc
    title-class="h5"
    title-tag="h2"
    header-class="p-3"
    :title="$t('common.success')"
    :static="isTesting"
    @hidden="$router.push({ name: routerPath})">
    <!-- header -->

    <!-- body -->
    <FrRequestSubmitSuccess
      :request-id="requestId"
      :success-text="successText" />

    <template #modal-footer="{ hide }">
      <BButton
        class="ml-auto"
        variant="link"
        @click="hide">
        {{ $t('common.close') }}
      </BButton>
    </template>
  </BModal>
</template>

<script setup>
import { BButton, BModal } from 'bootstrap-vue';

import FrRequestSubmitSuccess from '@/views/governance/LCM/RequestSubmitSuccess';

defineProps({
  requestId: {
    type: String,
    default: '',
  },
  successText: {
    type: String,
    default: '',
  },
  routerPath: {
    type: String,
    default: '',
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

</script>
