<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    data-testid="export-modal"
    id="export-modal"
    ok-only
    ok-variant="outline-primary"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-title="$t('common.close')"
    :static="isTesting"
    :title="heading"
    @show="emit('show')">
    <template #modal-title>
      <small class="d-block modal-heading">
        {{ heading }}
      </small>
      <div>
        {{ dayjs(data.date).format('MM/DD/YYYY h:mm A') }}
      </div>
    </template>
    <BContainer
      fluid>
      <BRow>
        <BCol
          md="10"
          offset-md="1"
          class="text-center">
          <div class="d-flex justify-content-center align-items-center flex-column fr-report-export-modal-content">
            <FrSpinner
              v-if="props.status === 'exporting'"
              class="m-4"
              testid="spinner-large" />
            <BImg
              v-else-if="props.status === 'error'"
              class="m-4"
              data-testid="fr-export-error-image"
              height="160"
              width="160"
              :src="require('@forgerock/platform-shared/src/assets/images/alert-circle-outline.svg')"
              :alt="$t('common.alertIconAltText')" />
            <BImg
              v-else
              class="m-4"
              height="160"
              width="160"
              :src="require('@forgerock/platform-shared/src/assets/images/check.svg')"
              :alt="$t('common.checkIconAltText')" />
            <h2 class="h4 mb-4">
              {{ modalTitle }}
            </h2>
            <p class="mb-4 text-break">
              {{ modalMessage }}
            </p>
            <FrButtonWithSpinner
              v-if="props.status === 'download' || props.status === 'downloading'"
              class="mb-4"
              data-testid="fr-history-export-download-button"
              icon="file_download"
              variant="primary"
              :button-text="downloadButtonText"
              :disabled="props.status === 'downloading'"
              :show-spinner="props.status === 'downloading'"
              :spinner-text="downloadButtonText"
              @click="emit('download-report', {
                fileType: props.fileType,
                item: props.data,
                exportStatus: props.status
              });" />
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </BModal>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import {
  BCol,
  BContainer,
  BImg,
  BModal,
  BRow,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import i18n from '@/i18n';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  fileType: {
    type: String,
    default: '',
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'exporting',
    validator(value) {
      return ['exporting', 'download', 'downloading', 'error'].includes(value);
    },
  },
});

const emit = defineEmits(['download-report', 'show']);
const heading = computed(() => i18n.global.t('reports.modal.heading', { fileType: props.fileType }));
const modalTitle = computed(() => {
  switch (props.status) {
    case 'error':
      return i18n.global.t('reports.modal.errorTitle', { fileType: props.fileType });
    case 'exporting':
      return i18n.global.t('reports.modal.title', { fileType: props.fileType });
    default:
      return i18n.global.t('reports.modal.success.title');
  }
});

const modalMessage = computed(() => {
  switch (props.status) {
    case 'error':
      return i18n.global.t('reports.modal.errorMessage');
    case 'exporting':
      return i18n.global.t('reports.modal.exportReportMessage');
    case 'download':
    case 'downloading':
      return i18n.global.t('reports.modal.success.subtitle');
    default:
      return i18n.global.t('reports.modal.errorMessage');
  }
});

const downloadButtonText = computed(() => {
  switch (props.status) {
    case 'downloading':
      return i18n.global.t(i18n.global.t('reports.downloading'));
    default:
      return i18n.global.t('reports.modal.downloadReport', { fileType: props.fileType });
  }
});
</script>

<style scoped>
  .fr-report-export-modal-content {
    height: 400px;
  }

  .modal-heading {
    height: 30px;
  }
</style>
