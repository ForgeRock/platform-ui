<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pb-1 mb-4">
    <FrGovResourceSelect
      :description="property.description"
      :label="property.label"
      :name="`resourceSelect_${_uid}`"
      :custom-query="queryFilter"
      :option-function="optionFunction"
      :query-param-function="queryParamFunction"
      :query-properties="queryProperties"
      :read-only="property.disabled"
      :resource-function="resourceFunction"
      :resource-path="resourcePath"
      :set-initial-value="false"
      :validation="property.validation"
      :value="inputValue"
      @input="updateValue" />
  </div>
</template>

<script setup>
/**
 * Form custom component used for selecting a single object using an api call
 */
import { computed, ref } from 'vue';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import {
  optionFunctionWithCustom,
  queryParamFunctionWithCustom,
  getResourceFunction,
  getResourcePath,
  getValuePath,
} from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';

const emit = defineEmits(['update:model']);

const props = defineProps({
  property: {
    type: Object,
    default: () => ({}),
  },
});

// data
const inputValue = ref('');

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
 * @param {String} value - The new value to be set.
 */
function updateValue(value) {
  const propValue = getValuePath(propertyType.value, value.split('/').pop());
  emit('update:model', { path: props.property.model, value: propValue });
}

/**
 * Initializes the given value.
 *
 * @param {String} value - The value to be initialized.
 */
function initializeValue(value) {
  inputValue.value = value.split('/')?.pop() || '';
}

initializeValue(props.property.value);

</script>
