<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BModal
    id="reports-data-source-modal"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-disabled="!dataSourceValue"
    :ok-title="$t('common.save')"
    :static="isTesting"
    :title="$t('reports.template.addADataSource')"
    @hidden="hiddenHandler"
    @ok="okButtonClicked = true"
    @show="dataSourceValue = ''">
    <p class="text-secondary">
      {{ $t('reports.template.chooseAnEntityAsDataSource') }}
    </p>
    <FrField
      v-model="dataSourceValue"
      class="mb-5"
      name="data-source-field"
      type="select"
      :internal-search="true"
      :options="['Data Source Option']"
      :label="$t('reports.template.dataSource')" />
  </BModal>
</template>

<script setup>
/**
 * @description
 * Modal for adding a data source to a custom report analytics template.
 */
import { ref } from 'vue';
import { BModal } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['add-data-source']);

const dataSourceValue = ref('');
let okButtonClicked = false;

function hiddenHandler() {
  if (okButtonClicked) {
    emit('add-data-source', dataSourceValue);
  }
  okButtonClicked = false;
}
</script>
