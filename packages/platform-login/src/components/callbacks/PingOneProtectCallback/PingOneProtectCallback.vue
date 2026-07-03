<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="row justify-content-center">
    <Spinner
      label="Spinning"
      class="mb-4" />
  </div>
</template>

<script setup>
/**
 * @description Handles both PingOneProtectInitializeCallback and PingOneProtectEvaluationCallback
 * Displays a spinner while waiting PingOneProtectInitializeCallback to start,
 * and waiting for PingOneProtectEvaluationCallback to return its data to send
 * on to a PingOne Protect Result node.
 *
 * Init + eval renders share the Protect client via `./protectClient` (the SDK's
 * `protectApiInitialized` is per-instance).
 * */
import Spinner from '@forgerock/platform-shared/src/components/Spinner';
import { callbackType } from '@forgerock/journey-client';
import { protect } from '@forgerock/protect';
import { onMounted } from 'vue';
import i18n from '@/i18n';
import { useProtectClientStore } from '@/stores/protectClient';

const props = defineProps({
  callback: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['next-step']);

const type = props.callback.getType();
const protectClientStore = useProtectClientStore();

onMounted(() => {
  if (type === callbackType.PingOneProtectInitializeCallback) {
    protectClientStore.$reset();
    const client = protect(props.callback.getConfig());
    client.start().then((result) => {
      if (result?.error) {
        props.callback.setClientError(result.error);
      } else {
        protectClientStore.client = client;
      }
      emit('next-step');
    }).catch((err) => {
      props.callback.setClientError(err.message);
      emit('next-step');
    });
  } else {
    const { client } = protectClientStore;
    if (!client) {
      props.callback.setClientError(i18n.global.t('login.pingOneProtect.clientNotInitialized'));
      emit('next-step');
      return;
    }
    client.getData().then((data) => {
      if (data?.error) {
        props.callback.setClientError(data.error);
      } else {
        props.callback.setData(data);
      }
      emit('next-step');
    }).catch((err) => {
      props.callback.setClientError(err.message);
      emit('next-step');
    });
  }
});
</script>
