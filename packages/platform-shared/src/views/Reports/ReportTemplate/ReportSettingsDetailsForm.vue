<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BForm>
    <BFormGroup label-for="name-field">
      <FrField
        v-model="reportData.name"
        name="name-field"
        type="text"
        :disabled="!isNameEditable"
        :description="$t('reports.newReportModal.nameInputDescription')"
        :label="$t('common.name')"
        :validation="validationRules"
        :validation-immediate="false" />
    </BFormGroup>
    <BFormGroup label-for="description-field">
      <FrField
        v-model="reportData.description"
        name="description-field"
        type="textarea"
        :label="$t('common.optionalFieldTitle', { fieldTitle: $t('common.description') })" />
    </BFormGroup>
    <div class="pt-3 border-top">
      <h5 class="mb-3">
        {{ $t('reports.newReportModal.labelViewers') }}
      </h5>
      <FrReportSettingsAssignViewersForm
        :model-value="reportData.viewers"
        @update:modelValue="reportData.viewers = $event" />
    </div>
  </BForm>
</template>

<script setup>
/**
 * @description Component that contains the Detail Settings form for Report Templates
 */
import {
  computed,
  watch,
  reactive,
} from 'vue';
import {
  BForm,
  BFormGroup,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { isEqual } from 'lodash';
import FrReportSettingsAssignViewersForm from './ReportSettingsAssignViewersForm';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  isNameEditable: {
    type: Boolean,
    default: true,
  },
  reportNames: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

// Globals
const reportData = reactive({
  name: props.modelValue.name || '',
  description: props.modelValue.description || '',
  viewers: props.modelValue.viewers ? [...props.modelValue.viewers] : [],
});

// Computed
const vanityReportNames = computed(() => props.reportNames.map((name) => name.replace(/-/g, ' ').toLowerCase()));
const validationRules = computed(() => ({
  alpha_num_spaces: true,
  ...(props.reportNames.length && { unique: vanityReportNames.value }),
}));

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (!isEqual(reportData, newValue)) {
    reportData.name = newValue.name || '';
    reportData.description = newValue.description || '';
    reportData.viewers = newValue.viewers ? [...newValue.viewers] : [];
  }
}, { deep: true });

watch(reportData, (newValue) => {
  emit('update:modelValue', {
    name: newValue.name,
    description: newValue.description,
    viewers: newValue.viewers,
  });
});
</script>
