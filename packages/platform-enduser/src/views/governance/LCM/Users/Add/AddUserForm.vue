<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="formFields.userName"
      class="mb-4"
      validation="required"
      :label="$t('governance.user.username')" />
    <FrField
      v-model="formFields.givenName"
      class="mb-4"
      validation="required"
      :label="$t('governance.user.firstName')" />
    <FrField
      v-model="formFields.sn"
      class="mb-4"
      validation="required"
      :label="$t('governance.user.lastName')" />
    <FrField
      v-model="formFields.mail"
      class="mb-4"
      :label="$t('governance.user.email')"
      :validation="{ required: true, email: true }" />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';

defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

const formFields = ref({
  userName: '',
  givenName: '',
  sn: '',
  mail: '',
});

watch(formFields.value, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

</script>
