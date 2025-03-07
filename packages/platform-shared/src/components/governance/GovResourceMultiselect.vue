<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="initialValuesLoad && optionsLoad">
    <FrField
      @input="handleInput"
      @search-change="debouncedSearch"
      open-direction="bottom"
      type="multiselect"
      :description="description"
      :disabled="readOnly"
      :internal-search="false"
      :label="label"
      :name="name"
      :options="selectOptions"
      :validation="validation"
      :value="selectValue">
      <template #noResult>
        <slot name="noResult">
          {{ $t('common.noResultsFound') }}
        </slot>
      </template>
    </FrField>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
} from 'vue';
import {
  debounce,
} from 'lodash';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getOption, getQueryParams } from '@forgerock/platform-shared/src/utils/governance/select';

const emit = defineEmits(['input']);

const props = defineProps({
  customQuery: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  resource: {
    type: String,
    default: 'application',
  },
  validation: {
    type: [Object, String],
    default: '',
  },
  value: {
    type: Array,
    default: () => [],
  },
  /**
   * Function to containing api call to retrieve resource data
   */
  resourceFunction: {
    type: Function,
    default: getResource,
  },
  /**
   * Function to format resource data into options
   */
  optionFunction: {
    type: Function,
    default: getOption,
  },
  /**
   * Function to format query params used for resourceFunction
   */
  queryParamFunction: {
    type: Function,
    default: getQueryParams,
  },
});

// data
const initialValues = ref([]);
const initialValuesLoad = ref(false);
const options = ref([]);
const optionsLoad = ref(false);
const selectValue = ref([...props.value]);

// computed
const selectOptions = computed(() => [...initialValues.value, ...options.value]);

/**
 * Retrieves the initial values for the application picker based on the provided resourceIds.
 * @param {Array} resourceIds - An array of application IDs.
 */
async function getInitialValues(resourceIds) {
  try {
    const initialPromises = resourceIds
      .map((value) => props.resourceFunction(
        props.resource,
        props.queryParamFunction(value, props.resource, true, props.customQuery),
      ));
    const initialData = await Promise.all(initialPromises);
    initialValues.value = initialData.map((resourcePromise) => {
      const resource = resourcePromise.data.result[0];
      return props.optionFunction(resource, props.resource);
    }) || [];
  } catch {
    initialValues.value = resourceIds.map((value) => props.optionFunction({ id: value, name: value }, null));
  } finally {
    initialValuesLoad.value = true;
  }
}

/**
 * Retrieves a list of resources based on the provided query string.
 * If the initial load has not occurred and there are existing values, it attempts to get the initial values.
 * Then, it retrieves the resource data for applications and maps it to options with text and value properties.
 *
 * @param {String} queryString - The query string to filter the resource list.
 */
async function getResourceList(queryString) {
  if (!optionsLoad.value && props.value.length) {
    getInitialValues(props.value);
  } else {
    initialValuesLoad.value = true;
  }
  try {
    const { data } = await props.resourceFunction(
      props.resource,
      props.queryParamFunction(queryString, props.resource, false, props.customQuery),
    );
    options.value = data.result
      ?.map((resource) => props.optionFunction(resource, props.resource))
      ?.filter((option) => !selectValue.value.includes(option.value))
      || [];
  } catch {
    options.value = [];
  } finally {
    optionsLoad.value = true;
  }
}

/**
 * Handles the input event.
 * @param {Array} event - The input event object.
 */
function handleInput(event) {
  selectValue.value = event;
  emit('input', event);
}

/**
 * Performs a search for a resource list based on the provided query.
 * @param {String} query - The search query.
 */
function search(query) {
  getResourceList(query);
}
const debouncedSearch = debounce(search, 500);

getResourceList();
</script>
