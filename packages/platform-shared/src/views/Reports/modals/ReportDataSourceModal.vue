<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BModal
    id="report-data-sources-modal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('reports.template.addADataSource')"
    @show="dataSourceValue = ''">
    <p class="text-secondary">
      {{ $t('reports.template.chooseAnEntityAsDataSource') }}
    </p>
    <FrField
      v-model="dataSourceValue"
      class="mb-5"
      name="data-source-field"
      type="select"
      :disabled="isSaving"
      :internal-search="true"
      :label="dataSources.length ? $t('reports.template.dataSource') : $t('reports.template.noDataSourcesFound')"
      :options="dataSources" />
    <template #modal-footer="{ cancel }">
      <div class="d-flex flex-row-reverse">
        <FrButtonWithSpinner
          :disabled="disableSave"
          :show-spinner="isSaving"
          variant="primary"
          @click="$emit('add-data-source', dataSourceValue);" />
        <BButton
          variant="link"
          :disabled="isSaving"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description
 * Modal for adding a data source to a custom analytics report template.
 */
import { computed, ref } from 'vue';
import { BModal, BButton } from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import i18n from '@/i18n';

// Definitions
defineEmits(['add-data-source']);
const props = defineProps({
  dataSources: {
    type: Array,
    default: () => [],
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

// Globals
const dataSourceValue = ref('');

// Computed
const invalidDataSource = computed(() => !dataSourceValue.value.length || dataSourceValue.value === i18n.global.t('common.loadingEtc'));
const disableSave = computed(() => invalidDataSource.value || props.isSaving);
</script>
