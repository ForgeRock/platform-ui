<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="import-report-modal"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('reports.importReport.title')"
    @hidden="resetModalState">
    <BButton
      tag="div"
      variant="none"
      class="dropzone-container"
      :aria-label="$t('reports.importReport.dropzoneLabel')"
      :aria-describedby="(validationError || serverError) ? 'dropzone-error' : 'dropzone-description'"
      :class="{
        'is-dragging': isDragging,
        'has-error': validationError || serverError,
        'has-file': selectedFile && !validationError && !serverError
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.self.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      @keydown.enter="triggerFileInput"
      @keydown.space.prevent="triggerFileInput">
      <input
        ref="fileInputRef"
        type="file"
        accept=".json"
        class="d-none"
        :aria-label="$t('reports.importReport.fileInputLabel')"
        @change="handleFileInputChange">

      <div class="dropzone-content">
        <template v-if="validationError || serverError">
          <div class="import-icon-wrap">
            <FrIcon
              icon-class="md-24"
              name="description" />
          </div>
          <p class="import-filename mb-1 mt-3">
            {{ selectedFile ? selectedFile.name : '' }}
          </p>
          <p
            v-if="selectedFile"
            class="import-filesize mb-3">
            {{ formatFileSize(selectedFile.size) }}
          </p>
          <p
            id="dropzone-error"
            role="alert"
            aria-live="assertive"
            class="import-error-message mb-3">
            <FrIcon
              icon-class="text-danger"
              name="error_outline" />
            {{ validationError || serverError }}
          </p>
          <BButton
            variant="link"
            class="btn btn-link alert-link p-0"
            @click.stop="triggerFileInput">
            {{ $t('reports.importReport.chooseDifferentFile') }}
          </BButton>
        </template>
        <template v-else-if="!selectedFile">
          <div class="import-icon-wrap">
            <FrIcon
              icon-class="md-24"
              name="file_upload" />
          </div>
          <h5 class="import-empty-text mb-2 mt-3">
            {{ $t('reports.importReport.dragDrop') }}
            <BButton
              variant="link"
              class="btn p-0 align-baseline font-weight-bold"
              @click.stop="triggerFileInput">
              {{ $t('common.browse').toLowerCase() }}
            </BButton>
          </h5>
          <p
            id="dropzone-description"
            class="import-supported-formats mb-0">
            {{ $t('reports.importReport.supportedFormats') }}
          </p>
        </template>
        <template v-else>
          <div class="import-icon-wrap">
            <FrIcon
              icon-class="md-24"
              name="description" />
          </div>
          <div
            role="status"
            aria-live="polite">
            <p class="import-filename mb-1 mt-3">
              {{ selectedFile.name }}
            </p>
            <p class="import-filesize mb-0">
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
        </template>
      </div>
      <div
        v-if="isDragging"
        class="sr-only"
        role="status"
        aria-live="assertive">
        {{ $t('reports.importReport.dropFileHere') }}
      </div>
    </BButton>

    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.import')"
        :disabled="!fileIsValid || isImporting"
        :show-spinner="isImporting"
        :spinner-text="$t('reports.importReport.importing')"
        @click="handleImport" />
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description Modal for importing an Analytics Report from a JSON file
 */
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import { computed, ref } from 'vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { importAnalyticsReport } from '@forgerock/platform-shared/src/api/AutoApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { formatFileSize, hasAllowedExtension } from '@forgerock/platform-shared/src/utils/file';
import { displayNotification, getApiErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['import-success']);

// Composables
const { bvModal } = useBvModal();

// Data
const fileInputRef = ref(null);
const selectedFile = ref(null);
const validationError = ref('');
const serverError = ref('');
const isImporting = ref(false);
const isDragging = ref(false);

// Computed
const fileIsValid = computed(() => selectedFile.value && !validationError.value && !serverError.value);

// Constants
const ALLOWED_EXTENSIONS = ['.json'];

/**
 * Validates the report template JSON structure
 * @param {Object} data - Parsed JSON data
 * @returns {String|null} Error message or null if valid
 */
function validateReportTemplate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return i18n.global.t('reports.importReport.invalidJson');
  }

  return null;
}

/**
 * Reads and validates the file
 * @param {File} file - The file to validate
 */
async function validateFile(file) {
  if (!file) {
    validationError.value = '';
    return;
  }

  validationError.value = '';
  serverError.value = '';

  if (!hasAllowedExtension(file.name, ALLOWED_EXTENSIONS) || (file.type && file.type !== 'application/json')) {
    validationError.value = i18n.global.t('reports.importReport.invalidFileType');
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const error = validateReportTemplate(data);

    if (error) {
      validationError.value = error;
    }
  } catch (error) {
    validationError.value = i18n.global.t('reports.importReport.invalidJson');
  }
}

/**
 * Handles file selection from the file input
 * @param {File} file - The selected file
 */
async function handleFileSelect(file) {
  if (!file) return;

  selectedFile.value = file;
  await validateFile(file);
}

/**
 * Handles file input change event
 * @param {Event} event - The change event
 */
async function handleFileInputChange(event) {
  const input = event.target;
  const file = input.files?.[0];
  if (file) {
    await handleFileSelect(file);
  }
  input.value = '';
}

/**
 * Triggers the hidden file input
 */
function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

/**
 * Handles drag over event
 * @param {DragEvent} event
 */
function handleDragOver(event) {
  if (event.dataTransfer?.types?.includes('Files')) {
    isDragging.value = true;
  }
}

/**
 * Handles drag leave event
 */
function handleDragLeave() {
  isDragging.value = false;
}

/**
 * Handles drop event
 * @param {DragEvent} event - The drop event
 */
async function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    await handleFileSelect(file);
  }
}

/**
 * Resets modal state
 */
function resetModalState() {
  selectedFile.value = null;
  validationError.value = '';
  serverError.value = '';
  isImporting.value = false;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

/**
 * Handles the import action
 */
async function handleImport() {
  if (!selectedFile.value || validationError.value) return;

  isImporting.value = true;
  serverError.value = '';

  try {
    const response = await importAnalyticsReport(selectedFile.value);
    const reportName = response.data?.name || response.data?.reportTemplate?.name;

    bvModal.value.hide('import-report-modal');
    displayNotification('success', i18n.global.t('reports.importReport.success'));
    emit('import-success', reportName);
  } catch (error) {
    serverError.value = getApiErrorMessage(error, i18n.global.t('reports.importReport.error'));
  } finally {
    isImporting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.dropzone-container {
  display: block;
  width: 100%;
  border: 2px dashed $gray-300;
  border-radius: $border-radius * 2;
  padding: 1.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;

  &.is-dragging {
    background-color: $gray-100;
  }

  &.has-error {
    border-color: $danger;
    background-color: $fr-alert-danger-bg-color;
  }

  &.has-file:not(.has-error) {
    border-color: $gray-400;
    background-color: $white;
  }
}

.dropzone-content {
  pointer-events: none;

  button,
  a {
    pointer-events: auto;
  }
}

.import-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: $black-4;
  margin: 8px 0 16px;
}

.import-empty-text {
  color: $gray-900;
  margin-bottom: 8px;
}

.import-supported-formats {
  color: $gray-500;
  font-size: 13px;
  margin-top: 4px;
}

.import-filename {
  color: $gray-600;
  font-size: 20px;
  font-weight: 600;
  word-break: break-word;
  max-width: 100%;
  overflow-wrap: break-word;
}

.import-filesize {
  color: $gray-500;
  font-size: 13px;
}

.import-error-message {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  color: $gray-600;
  font-size: 15px;

  :deep(.material-icons-outlined) {
    margin-right: 8px;
  }
}

.alert-link {
  color: $gray-700;
  font-size: 15px;
  font-weight: 600;
  text-decoration: underline;

  &:hover {
    color: $gray-700;
  }
}
</style>
