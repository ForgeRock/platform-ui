<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="selectValue"
    :internal-search="props.internalSearch"
    :label="props.label"
    :options="filteredOptions"
    :placeholder="!props.options.length ? $t('reports.tabs.runReport.pressEnterToCreateATag') : props.placeholder"
    :show-no-options="true"
    :show-no-results="true"
    :taggable="taggable"
    @search-change="emitDebounced('search', $event)"
    testid="reports-multiselect-field"
    open-direction="bottom"
    type="multiselect">
    <template #tag="{ option, remove }">
      <span class="multiselect__tag">
        <BMedia
          no-body
          class="d-flex align-items-center">
          <BMediaBody class="pl-1">
            <div class="text-dark">
              {{ option.text }}
            </div>
          </BMediaBody>
        </BMedia>
        <BButton
          class="border-0 p-0 bg-transparent fr-close-icon"
          @click="remove(option)">
          <FrIcon name="close" />
        </BButton>
      </span>
    </template>
    <template #option="{ option }">
      <BMedia no-body>
        <BMediaBody class="pl-1">
          <div class="mb-1 text-dark">
            {{ option.text }}
          </div>
        </BMediaBody>
      </BMedia>
    </template>
    <template
      v-for="(key, slotName) in $slots"
      #[slotName]="slotData">
      <!-- @slot pass-through slot -->
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrField>
</template>

<script setup>
/**
 * @description Displays the default run reports multiselect field, for running reports.
 * Configurable to allow for internal search and the ability to add custom tags through the taggable prop.
 * The emit event for searching is debounced.
 */
import { computed, ref, watch } from 'vue';
import { debounce } from 'lodash';
import {
  BButton,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const emit = defineEmits(['input', 'search']);
const props = defineProps({
  internalSearch: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '',
  },
  taggable: {
    type: Boolean,
    default: false,
  },
});

/**
 * Globals
 */
const selectValue = ref([]);
const emitDebounced = debounce(emit, 500);
const filteredOptions = computed(() => props.options.filter((value) => !selectValue.value.includes(value)));
watch(selectValue, (newValue) => emit('input', newValue));
</script>

<style lang="scss" scoped>
.fr-close-icon {
  position: absolute;
  top: -2px;
  right: 4px;

  span {
    color: $gray-600;
    font-size: 11px;
    font-weight: 700;

    &:hover {
      color: $black;
    }
  }
}
</style>