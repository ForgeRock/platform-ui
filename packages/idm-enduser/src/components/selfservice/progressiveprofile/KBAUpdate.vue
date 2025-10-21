<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrKBADefinitionFormGroup
    @update:data="setKbaFormGroupData"
    :self-service-details="selfServiceDetails" />
</template>

<script setup>
/**
 * @description Selfservice stage for progressive profile, handles the case where a resource is requested to change their KBA questions
 * */
import { ref } from 'vue';
import FrKBADefinitionFormGroup from '@/components/selfservice/common/KBADefinitionFormGroup';

const emit = defineEmits(['update:data']);

defineProps({
  selfServiceDetails: {
    type: Object,
    required: true,
  },
});

const kbaFormGroupData = ref(null);

/**
 * Sets the kba form group data and emits it to the parent component.
 * @param kbaData the kba data object
 */
function setKbaFormGroupData(kbaData) {
  kbaFormGroupData.value = kbaData;
  emit('update:data', kbaFormGroupData.value);
}
</script>
