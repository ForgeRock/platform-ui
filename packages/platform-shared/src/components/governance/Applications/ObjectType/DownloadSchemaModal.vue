<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="downloadSchemaModal"
    size="md"
    title-class="h5"
    title-tag="h2"
    no-close-on-backdrop
    no-close-on-esc
    :title="$t('governance.unmanagedApplications.objectTypesTab.downloadSchema')"
    @hidden="resetModal">
    <div class="modal-container mt-2">
      <BRow>
        <BCol class="mx-1 mb-2">
          <span>{{ $t('governance.unmanagedApplications.objectTypesTab.downloadSchemaDescription') }}</span>
        </BCol>
      </BRow>
      <BRow>
        <FrCardRadioInput
          v-for="option in formatOptions"
          :key="option.value"
          class="my-2 mx-4"
          name="schemaFormatRadio"
          :radio-value="option.value"
          v-model="selectedFormat">
          <BMedia no-body>
            <BMediaBody>
              <h3
                class="h5">
                {{ option.title }}
              </h3>
              <div class="d-block">
                {{ option.description }}
              </div>
            </BMediaBody>
          </BMedia>
        </FrCardRadioInput>
      </BRow>
    </div>
    <template #modal-footer="{ cancel, ok }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="primary"
        @click="download(ok)">
        {{ $t('common.download') }}
      </BButton>
    </template>
  </BModal>
</template>

<script setup>
import {
  BButton,
  BCol,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { computed, ref } from 'vue';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import { downloadAsType, downloadFile } from '@forgerock/platform-shared/src/utils/downloadFile';
import i18n from '@/i18n';

const props = defineProps({
  objectTypeId: {
    type: String,
    required: true,
  },
  properties: {
    type: Object,
    required: true,
  },
});

const selectedFormat = ref('json');

const formatOptions = computed(() => [
  {
    value: 'json',
    title: i18n.global.t('common.JSON'),
    description: i18n.global.t('governance.unmanagedApplications.objectTypesTab.downloadSchemaJsonDescription'),
  },
  {
    value: 'csv',
    title: i18n.global.t('common.CSV'),
    description: i18n.global.t('governance.unmanagedApplications.objectTypesTab.downloadSchemaCsvDescription'),
  },
]);

function resetModal() {
  selectedFormat.value = 'json';
}

async function download(ok) {
  const fileName = `${props.objectTypeId}-schema`;
  if (selectedFormat.value === 'json') {
    downloadFile(JSON.stringify(props.properties, null, 2), 'application/json', `${fileName}.json`);
  } else {
    const keys = Object.keys(props.properties);
    const row = Object.fromEntries(keys.map((key) => [key, '']));
    await downloadAsType([row], 'csv', `${fileName}.csv`);
  }
  ok();
}

defineExpose({
  download,
  formatOptions,
  resetModal,
  selectedFormat,
});
</script>
