<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-row flex-wrap bg-light mt-2">
    <template
      v-for="({label, value}, index) in runData"
      :key="index">
      <div class="px-4 py-3">
        <small class="text-muted">
          {{ label }}
        </small>
        <div>
          {{ value }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import useRunReport from './composables/RunReport';

const props = defineProps({
  parameters: {
    type: Object,
    default: () => ({}),
  },
});

const { _REPORT_FIELDS_CONTROLLER } = useRunReport();
const runData = computed(() => Object.keys(props.parameters).map((key) => {
  const paramValue = props.parameters[key];
  const value = Array.isArray(paramValue) ? paramValue.join(', ') : paramValue;
  return {
    label: _REPORT_FIELDS_CONTROLLER[key].label,
    value,
  };
}));
</script>
