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
    id="report-aggregates-modal"
    :static="isTesting"
    :title="$t('reports.template.addAnAggregate')"
    @hidden="resetValues">
    <BFormGroup>
      <FrField
        v-model="aggregateName"
        name="aggregate-name"
        :label="$t('common.name')"
        :placeholder="$t('common.name')" />
    </BFormGroup>
    <BFormGroup>
      <FrField
        v-model="aggregateTypeDisplayName"
        name="aggregate-type"
        type="select"
        :internal-search="true"
        :label="$t('common.type')"
        :options="aggregateTypeNames"
        @input="fetchFieldOptionsForValueField" />
    </BFormGroup>
    <BFormGroup>
      <FrField
        v-model="aggregateValue"
        name="aggregate-value"
        type="select"
        :disabled="!aggregateTypeDisplayName"
        :internal-search="true"
        :label="$t('common.value')"
        :options="aggregateValueList[aggregateTypeName(aggregateTypeDisplayName)] || [$t('common.loadingEtc')]" />
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
          @click="$emit('update-aggregate', 'aggregate', existingDefinitionIndex, formValues)" />
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description
 * Modal for adding an aggregate to a custom analytics report template.
 */
import { computed, ref, watch } from 'vue';
import {
  BButton,
  BFormGroup,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';

// Definitions
const emit = defineEmits([
  'get-field-options',
  'hidden',
  'update-aggregate',
]);
const props = defineProps({
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  existingAggregate: {
    type: Object,
    default: () => ({}),
  },
  aggregateTypes: {
    type: Array,
    default: () => [],
  },
  aggregateValueList: {
    type: Object,
    default: () => ({}),
  },
});

// Globals
const aggregateName = ref('');
const aggregateTypeDisplayName = ref('');
const aggregateValue = ref('');

// Functions
/**
 * Emits a request to fetches options for the right value select field
 * @param {String} selectedAggregateDisplayName aggregate display name
 */
function fetchFieldOptionsForValueField(selectedAggregateDisplayName) {
  const aggregateType = props.aggregateTypes.find((type) => type.displayName === selectedAggregateDisplayName);
  emit('get-field-options', aggregateType.name);
}

/**
 * Gets the aggregate type name
 * @param {String} displayName aggregate display name
 */
function aggregateTypeName(displayName) {
  return props.aggregateTypes.find((type) => type.displayName === displayName)?.name;
}

/**
 * Resets the form values
 */
function resetValues() {
  aggregateName.value = '';
  aggregateTypeDisplayName.value = '';
  aggregateValue.value = '';
  emit('hidden');
}

// Computed
const disableSave = computed(() => !aggregateName.value || !aggregateTypeDisplayName.value || !aggregateValue.value);
const formValues = computed(() => ({
  label: aggregateName.value,
  type: aggregateTypeName(aggregateTypeDisplayName.value),
  value: aggregateValue.value,
}));
const aggregateTypeNames = computed(() => props.aggregateTypes.map(({ displayName }) => displayName));
const existingDefinitionIndex = computed(() => {
  const existingIndex = props.existingAggregate.index;
  return existingIndex !== undefined ? existingIndex : -1;
});

// Watchers
watch(() => props.existingAggregate, (aggregate) => {
  if (Object.keys(aggregate).length) {
    const { definition } = aggregate;
    const { displayName } = props.aggregateTypes.find((type) => type.name === definition.type);
    fetchFieldOptionsForValueField(displayName);
    aggregateName.value = definition.label;
    aggregateTypeDisplayName.value = displayName;
    aggregateValue.value = definition.value;
  }
});
</script>
