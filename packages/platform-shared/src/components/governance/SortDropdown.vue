<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    id="sortBy"
    toggle-class="text-dark px-0 d-flex"
    variant="link">
    <template #button-content>
      <FrIcon
        icon-class="mr-2"
        name="sort" />
      <div :class="{ 'd-none d-lg-block': hideLabelsOnMobile }">
        <span class="font-weight-bold mr-1">
          {{ $t('governance.sortBy') }}:
        </span>
        {{ selectedSortFieldText }}
      </div>
    </template>
    <BDropdownText style="width: 250px;">
      <h2 class="h5 mt-3">
        {{ $t('governance.sortBy') }}
      </h2>
    </BDropdownText>
    <BDropdownForm>
      <FrField
        v-model="sortField"
        class="mb-2"
        name="sortField"
        type="select"
        :options="sortByOptions"
        @input="$emit('sort-field-change', $event)" />
      <FrField
        v-model="sortDirection"
        class="mb-3"
        name="sortDirection"
        type="select"
        :options="sortDirectionOptions"
        @input="$emit('sort-direction-change', $event)">
        <template
          v-for="slotName in ['singleLabel', 'option']"
          :key="slotName"
          #[slotName]="{ option }">
          <div :class="{ 'mb-1': slotName === 'singleLabel' }">
            <FrIcon
              icon-class="mr-2"
              :name="option.value === 'asc' ? 'arrow_upward' : 'arrow_downward'">
              {{ option.text }}
            </FrIcon>
          </div>
        </template>
      </FrField>
    </BDropdownForm>
  </BDropdown>
</template>

<script setup>
/**
 * Reusable dropdown containing two sort fields for the field to sort by
 * and the direction to sort by
 */
import {
  BDropdown,
  BDropdownForm,
  BDropdownText,
} from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

defineEmits(['sort-field-change', 'sort-direction-change']);

const props = defineProps({
  hideLabelsOnMobile: {
    type: Boolean,
    default: false,
  },
  selectedItem: {
    type: String,
    default: '',
  },
  sortByOptions: {
    type: Array,
    default: () => [],
  },
});

const sortDirection = ref('desc');
const sortDirectionOptions = ref([
  {
    text: i18n.global.t('common.ascending'),
    value: 'asc',
  },
  {
    text: i18n.global.t('common.descending'),
    value: 'desc',
  },
]);
const sortField = ref(props.selectedItem);

const selectedSortFieldText = computed(() => props.sortByOptions.find((option) => option.value === sortField.value)?.text || '');

watch(() => props.selectedItem, (newValue) => {
  if (newValue && sortField.value !== newValue) {
    sortField.value = newValue;
  }
});
</script>

<style lang="scss" scoped>
.h5 {
  font-weight: 600;
}

:deep(.multiselect .multiselect__option--selected:after) {
  content: 'check';
  font-family: 'Material Icons Outlined', Serif;
  font-size: 15px;
  color: $green !important;
  padding-top: 0.25rem;
  background: initial;
  padding-left: 10px;
}

:deep(.btn-link:hover) {
  text-decoration: none;

  div {
    text-decoration: underline;
  }
}
</style>
