<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BRow>
      <BCol>
        <template
          v-for="select in selectInputs"
          :key="select.key">
          <FrField
            :value="selectedFields[select.key]"
            class="mb-3"
            type="multiselect"
            :label="select.label"
            :options="getSelectOptions(select.options)"
            @remove="handleRemove($event)"
            @select="handleSelect($event)" />
        </template>
      </BCol>
      <BCol>
        <Draggable
          class="d-flex flex-column w-100 border-bottom card"
          ghost-class="ghost-tag"
          @update="handleListUpdate"
          :list="selectedColumnsList">
          <template #item="{ element }">
            <BListGroupItem class="py-1 p-2 justify-content-between cursor-pointer border-bottom-0 d-flex">
              <div
                class="d-flex align-items-center p-2">
                <FrIcon
                  icon-class="mr-4"
                  name="drag_indicator">
                  <span class="fr-tag-text">
                    {{ element.listLabel }}
                  </span>
                </FrIcon>
              </div>
              <BButton
                variant="link"
                class="text-dark py-0 px-4"
                @click="handleRemoveFromList(element)">
                <FrIcon name="delete" />
              </BButton>
            </BListGroupItem>
          </template>
        </Draggable>
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
/**
 * This component is used to configure a list of items that are related to select inputs.
 * You can add items to the list by selecting them from the select inputs.
 * You can also remove items from the list by clicking the delete icon.
 * The items in the list can be reordered and removed.
 */
import {
  BListGroupItem,
  BButton,
  BRow,
  BCol,
} from 'bootstrap-vue';
import { ref, watch } from 'vue';
import Draggable from 'vuedraggable';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  selectInputs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
});

/**
 * Transforms the provided options into a format suitable for use in a select input.
 *
 * @param {Array} options - The list of options to be transformed.
 * @returns {Array} The formatted select options.
 */
function getSelectOptions(options) {
  return options.map((option) => ({
    text: option.selectLabel,
    selectLabel: option.selectLabel,
    listLabel: option.listLabel,
    value: option.value,
  }));
}

const selectedColumnsList = ref([]);
const selectedFields = ref({});

/**
 * Triggered when removing an item from the list of columns.
 * Removes the items from the select input values to keep them in sync
 *
 * @param {Object} element - The element to be removed from the list and select fields.
 */
function handleRemoveFromList(element) {
  selectedColumnsList.value = selectedColumnsList.value.filter((field) => (field.value !== element.value));
  const [category] = element.value.split('.');
  selectedFields.value[category] = selectedFields.value[category].filter((field) => (field !== element.value));
  emit('update:modelValue', selectedColumnsList.value);
}

/**
 * Triggered when an item is removed from the select input.
 * Removes the items from the list to keep them in sync
 *
 * @param {Object} element - The event object associated with the remove action.
 */
function handleRemove(element) {
  selectedColumnsList.value = selectedColumnsList.value.filter((field) => (field.value !== element.value));
  emit('update:modelValue', selectedColumnsList.value);
}

/**
 * Triggered when an item is selected from the select inputs.
 * Adds the item to the list to keep them in sync
 *
 * @param {Object} element - The event object associated with the remove action.
 */
function handleSelect(element) {
  selectedColumnsList.value.push(element);
  emit('update:modelValue', selectedColumnsList.value);
}

/**
 * Triggered when an item changes position in the list.
 */
function handleListUpdate() {
  emit('update:modelValue', selectedColumnsList.value);
}

/**
 * Sets the list and select input values based on the provided values.
 *
 * @param {Array} columns - An array of column objects representing the selected columns.
 */
function setFieldValues(columns) {
  // set the columns list
  selectedColumnsList.value = columns;

  columns.forEach((column) => {
    const [category] = column.value.split('.');
    selectedFields.value[category] = [];
  });

  // set the select values
  columns.forEach((column) => {
    const [category] = column.value.split('.');
    selectedFields.value[category].push(column.value);
  });
}

/**
 * Sets the initial values for the select inputs.
 */
function setInitialSelectValues() {
  props.selectInputs.forEach((select) => {
    selectedFields.value[select.key] = [];
  });
}

// Watchers
watch(
  [() => props.modelValue, () => props.selectInputs],
  ([newModelValue]) => {
    setInitialSelectValues();
    setFieldValues(newModelValue);
  },
  { deep: true, immediate: true },
);
</script>
