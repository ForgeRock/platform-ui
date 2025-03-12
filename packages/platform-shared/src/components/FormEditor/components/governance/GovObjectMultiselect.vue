<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pb-1 mb-4">
    <FrGovResourceMultiselect
      :description="property.description"
      :label="property.label"
      :name="`resourceSelect_${_uid}`"
      :custom-query="queryFilter"
      :option-function="optionFunction"
      :query-param-function="queryParamFunction"
      :read-only="property.disabled"
      :resource="resourcePath"
      :resource-function="resourceFunction"
      :validation="property.validation"
      :value="inputValue"
      @input="updateValue" />
  </div>
</template>

<script setup>
/**
 * Form custom component used for selecting a multiple objects using an api call
 */
import { computed, ref } from 'vue';
import {
  optionFunctionWithCustom,
  queryParamFunctionWithCustom,
  getResourceFunction,
  getResourcePath,
} from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';
import FrGovResourceMultiselect from '@forgerock/platform-shared/src/components/governance/GovResourceMultiselect';

const emit = defineEmits(['update:model']);

const props = defineProps({
  property: {
    type: Object,
    default: () => ({}),
  },
});

// data
const inputValue = ref([]);

// computed
const isCustom = computed(() => props.property.options.object === 'custom');
const propertyType = computed(() => (isCustom.value
  ? props.property.options.customObject
  : props.property.options.object
));
const queryParamFunction = computed(() => (queryParamFunctionWithCustom(isCustom.value, props.property.options.queryProperties)));
const optionFunction = computed(() => (optionFunctionWithCustom(isCustom.value, props.property.options.displayProperty)));

const queryFilter = computed(() => props.property.options.queryFilter || '');
const resourceFunction = computed(() => (getResourceFunction(propertyType.value)));
const resourcePath = computed(() => (getResourcePath(propertyType.value)));

/**
 * Emits update:model event with the new value.
 *
 * @param {String[]} value - The new value to be set.
 */
function updateValue(value) {
  const valuePaths = value.map((id) => {
    if (propertyType.value === 'entitlement') return `entitlement/${id}`;
    return `managed/${propertyType.value}/${id}`;
  });
  emit('update:model', { path: props.property.model, value: valuePaths });
}

/**
 * Initializes the given value.
 *
 * @param {String[]} value - The value to be initialized.
 */
function initializeValue(values) {
  inputValue.value = values?.map((value) => value.split('/')?.pop()) || [];
}

initializeValue(props.property.value);
</script>
