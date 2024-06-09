<!-- Copyright 2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BModal
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    id="report-sorting-modal"
    :static="isTesting"
    :title="$t('reports.template.sortDataBy')"
    @hidden="resetValues"
    @show="emit('get-field-options')">
    <BFormGroup>
      <FrField
        v-model="sortBySelection"
        name="sort-by"
        type="select"
        :internal-search="true"
        :label="$t('reports.template.sortBy')"
        :options="sortByOptionNames" />
    </BFormGroup>
    <BFormGroup>
      <FrField
        v-model="directionSelection"
        name="direction"
        type="select"
        :internal-search="true"
        :label="$t('common.sortOrder')"
        :options="directionOptions">
        <template
          v-for="(slotName, index) in ['singleLabel', 'option']"
          :key="index"
          #[slotName]="{ option }">
          <FrIcon
            class="pr-2"
            :name="option.value === 'asc' ? 'arrow_upward' : 'arrow_downward'" /> {{ option.label }}
        </template>
      </FrField>
    </BFormGroup>
    <template #modal-footer="{ cancel }">
      <div class="d-flex">
        <BButton
          variant="link"
          :disabled="isSaving"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :disabled="disableSave || isSaving"
          :show-spinner="isSaving"
          variant="primary"
          @click="emit('update-sort', 'sort', existingDefinitionIndex, formValues)" />
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description
 * Modal for adding a sorting rule to a custom analytics report template.
 */
import { computed, ref, watch } from 'vue';
import {
  BButton,
  BFormGroup,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

// Definitions
const emit = defineEmits([
  'get-field-options',
  'hidden',
  'update-sort',
]);
const props = defineProps({
  existingSort: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  sortByOptions: {
    type: Array,
    default: () => [],
  },
});

// Globals
const sortBySelection = ref('');
const directionOptions = [
  { label: i18n.global.t('common.ascending'), value: 'asc' },
  { label: i18n.global.t('common.descending'), value: 'desc' },
];
const directionSelection = ref('asc');

// Functions

function resetValues() {
  sortBySelection.value = '';
  directionSelection.value = 'asc';
  emit('hidden');
}

// Computed
const disableSave = computed(() => !sortBySelection.value || !directionSelection.value);
const formValues = computed(() => ({
  sortBy: sortBySelection.value,
  direction: directionSelection.value,
}));
const existingDefinitionIndex = computed(() => {
  const existingIndex = props.existingSort.index;
  return existingIndex !== undefined ? existingIndex : -1;
});
const sortByOptionNames = computed(() => props.sortByOptions.map(({ value }) => value).sort());

// Watchers
watch(() => props.existingSort, (sort) => {
  if (Object.keys(sort).length) {
    const { definition } = sort;
    sortBySelection.value = definition.sortBy;
    directionSelection.value = definition.direction;
  }
});
</script>
