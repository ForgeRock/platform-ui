<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div
      v-for="(priority, key) in priorities"
      :key="key"
      class="d-inline-block border rounded-pill px-3 py-2 mr-2 mb-2">
      <FrField
        v-model="formFields[priority.model]"
        inline
        class="d-inline"
        :label="priority.label"
        :name="priority.model"
        :testid="`priority-${priority.model}`"
        type="checkbox">
        <template
          #prepend
          v-if="priority.image">
          <BImg
            alt=""
            height="24"
            :src="getPriorityImageSrc(priority.model)" />
        </template>
      </FrField>
    </div>
  </div>
</template>

<script setup>
/**
 * Component used to select priorities
 */
import { ref, watch } from 'vue';
import { BImg } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getPriorityImageSrc } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:value']);

const formFields = ref({
  high: true,
  medium: true,
  low: true,
  none: true,
});

const priorities = [
  {
    label: i18n.global.t('governance.accessRequest.priorities.highPriority'),
    model: 'high',
    image: true,
  },
  {
    label: i18n.global.t('governance.accessRequest.priorities.mediumPriority'),
    model: 'medium',
    image: true,
  },
  {
    label: i18n.global.t('governance.accessRequest.priorities.lowPriority'),
    model: 'low',
    image: true,
  },
  {
    label: i18n.global.t('governance.accessRequest.priorities.noPriority'),
    model: 'none',
    image: false,
  },
];

watch(() => props.value, (value) => {
  Object.keys(value).forEach((key) => {
    formFields.value[key] = value[key];
  });
}, { immediate: true, deep: true });

watch(formFields.value, () => {
  emit('update:value', formFields.value);
}, { deep: true });

</script>
