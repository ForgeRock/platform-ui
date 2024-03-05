<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BModal
    :static="isTesting"
    :title="$t('reports.template.addADataSource')"
    @show="entityValue = ''"
    id="report-data-sources-modal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2">
    <p class="text-secondary">
      {{ $t('reports.template.chooseAnEntityAsDataSource') }}
    </p>
    <FrField
      v-model="entityValue"
      :disabled="isSaving"
      :internal-search="true"
      :label="entities.length ? $t('reports.template.dataSource') : $t('reports.template.noDataSourcesFound')"
      :options="entities"
      class="mb-5"
      name="data-source-field"
      type="select" />
    <template #modal-footer="{ cancel }">
      <div class="d-flex">
        <BButton
          :disabled="isSaving"
          @click="cancel()"
          variant="link">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :button-text="$t('common.next')"
          :disabled="disableSave"
          :show-spinner="isSaving"
          :spinner-text="$t('common.loading')"
          @click="$emit('add-entity', entityValue);"
          variant="primary" />
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
defineEmits(['add-entity']);
const props = defineProps({
  entities: {
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
const entityValue = ref('');

// Computed
const invalidEntity = computed(() => !entityValue.value.length || entityValue.value === i18n.global.t('common.loadingEtc'));
const disableSave = computed(() => invalidEntity.value || props.isSaving);
</script>
