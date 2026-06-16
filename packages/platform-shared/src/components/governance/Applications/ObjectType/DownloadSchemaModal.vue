<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="downloadSchemaModal"
    size="md"
    ok-variant="primary"
    cancel-variant="link"
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
                class="h5"
                :aria-label="option.title">
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

<script>
import {
  BButton,
  BCol,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';

export default {
  name: 'DownloadSchemaModal',
  components: {
    BButton,
    BCol,
    BMedia,
    BMediaBody,
    BModal,
    BRow,
    FrCardRadioInput,
  },
  props: {
    objectTypeId: {
      type: String,
      required: true,
    },
    properties: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectedFormat: 'json',
    };
  },
  computed: {
    formatOptions() {
      return [
        {
          value: 'json',
          title: this.$t('governance.unmanagedApplications.objectTypesTab.downloadSchemaJson'),
          description: this.$t('governance.unmanagedApplications.objectTypesTab.downloadSchemaJsonDescription'),
        },
        {
          value: 'csv',
          title: this.$t('governance.unmanagedApplications.objectTypesTab.downloadSchemaCsv'),
          description: this.$t('governance.unmanagedApplications.objectTypesTab.downloadSchemaCsvDescription'),
        },
      ];
    },
  },
  methods: {
    resetModal() {
      this.selectedFormat = 'json';
    },
    download(ok) {
      const fileName = `${this.objectTypeId}-schema`;
      if (this.selectedFormat === 'json') {
        const json = JSON.stringify(this.properties, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.download = `${fileName}.json`;
        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const keys = Object.keys(this.properties);
        const row = Object.fromEntries(keys.map((key) => [key, '']));
        downloadAsType([row], 'csv', `${fileName}.csv`);
      }
      ok();
    },
  },
};
</script>
