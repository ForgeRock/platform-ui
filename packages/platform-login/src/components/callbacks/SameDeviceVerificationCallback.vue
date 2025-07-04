<!-- Copyright (c) 2025 Ping Identity. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="form-group">
    <BButton
      id="continueOnDeviceBtn"
      :name="`callback_${index}`"
      :value="value"
      variant="link"
      class="mt-2"
      @click="handleClick">
      {{ $t('common.continueOnDevice') }}
    </BButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BButton } from 'bootstrap-vue';

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  callback: {
    type: Object,
    required: true,
  },
});

const value = ref('true');

function handleClick() {
  props.callback.setInputValue(value.value);
}
</script>
