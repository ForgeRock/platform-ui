<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

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
 * on to a PingOne Protect Result node
 * */
import Spinner from '@forgerock/platform-shared/src/components/Spinner';
import { CallbackType } from '@forgerock/javascript-sdk';
import { PIProtect } from '@forgerock/ping-protect';
import { onMounted } from 'vue';

const props = defineProps({
  callback: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['next-step']);

const type = props.callback.getType();

onMounted(() => {
  if (type === CallbackType.PingOneProtectInitializeCallback) {
    PIProtect.start(props.callback.getConfig()).then(() => {
      emit('next-step');
    }).catch((err) => {
      props.callback.setClientError(err.message);
      emit('next-step');
    });
  } else {
    PIProtect.getData().then((data) => {
      props.callback.setData(data);
      emit('next-step');
    }).catch((err) => {
      props.callback.setClientError(err.message);
      emit('next-step');
    });
  }
});
</script>
