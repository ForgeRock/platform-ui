<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard class="mb-4">
      <h5 class="card-title">
        {{ $t('governance.applications.unmanagedImport.importData.title') }}
      </h5>
      <FrField
        v-model="selectedObjectType"
        class="mb-4"
        type="select"
        :label="$t('governance.applications.unmanagedImport.importData.objectTypeLabel')"
        :options="objectTypeOptions" />
      <label
        class="form-label"
        for="csv-file-upload">
        {{ $t('governance.applications.unmanagedImport.importData.fileLabel') }}
      </label>
      <BFormFile
        id="csv-file-upload"
        v-model="csvFile"
        class="mb-4"
        accept=".csv"
        :placeholder="$t('governance.applications.unmanagedImport.importData.filePlaceholder')"
        :browse-text="$t('common.browse')" />
      <FrField
        v-model="isDeletion"
        class="mb-4"
        name="isDeletion"
        type="checkbox"
        :label="$t('governance.applications.unmanagedImport.importData.deletionUploadLabel')"
        :description="$t('governance.applications.unmanagedImport.importData.deletionUploadDescription')" />
      <BCollapse :visible="isDeletion">
        <FrField
          v-model="useIgaId"
          class="mb-4 pl-4"
          name="useIgaId"
          type="checkbox"
          :label="$t('governance.applications.unmanagedImport.importData.useIgaIdLabel')"
          :description="$t('governance.applications.unmanagedImport.importData.useIgaIdDescription')" />
      </BCollapse>
      <div class="d-flex justify-content-end">
        <FrButtonWithSpinner
          variant="primary"
          :button-text="$t('governance.applications.unmanagedImport.importData.uploadButton')"
          :disabled="!canUpload || isUploading"
          :show-spinner="isUploading"
          :spinner-text="$t('common.uploading')"
          @click="showConfirmModal" />
      </div>
    </BCard>

    <BModal
      id="confirm-import-modal"
      :title="$t('governance.applications.unmanagedImport.importData.confirmTitle')"
      :ok-title="$t('governance.applications.unmanagedImport.importData.confirmButton')"
      :cancel-title="$t('common.cancel')"
      ok-variant="primary"
      cancel-variant="outline-primary"
      size="lg"
      title-class="h5"
      title-tag="h2"
      @ok="upload">
      <p>{{ $t('governance.applications.unmanagedImport.importData.confirmMessage') }}</p>
      <dl :class="isDeletion ? 'mb-3' : 'mb-0'">
        <dt>{{ $t('governance.applications.unmanagedImport.importData.objectTypeLabel') }}</dt>
        <dd class="mb-3">
          {{ selectedObjectType }}
        </dd>
        <dt>{{ $t('governance.applications.unmanagedImport.importData.fileLabel') }}</dt>
        <dd class="mb-0">
          {{ csvFile && csvFile.name }}
        </dd>
      </dl>
      <FrAlert
        v-if="isDeletion"
        :dismissible="false"
        show-icon
        variant="danger"
        class="mb-0">
        {{ $t('governance.applications.unmanagedImport.importData.deletionUploadAlert') }}
      </FrAlert>
    </BModal>

    <BModal
      id="confirm-delete-detection-modal"
      no-close-on-backdrop
      size="lg"
      title-class="h5"
      title-tag="h2"
      :title="$t('governance.applications.unmanagedImport.deleteDetection.confirmTitle')"
      @hidden="onDeleteDetectionModalHidden">
      <FrSpinner
        v-if="isLoadingDeleteCounts"
        class="py-3" />
      <template v-else>
        <p>{{ $t('governance.applications.unmanagedImport.deleteDetection.confirmMessage') }}</p>
        <div class="row mb-3">
          <div class="col-6">
            <dt>{{ $t('governance.applications.unmanagedImport.importData.objectTypeLabel') }}</dt>
            <dd class="mb-0">
              {{ deleteDetectionItem && deleteDetectionItem.context && deleteDetectionItem.context.applicationObjectType }}
            </dd>
          </div>
          <div class="col-6">
            <dt>{{ $t('governance.importHistory.columns.filename') }}</dt>
            <dd class="mb-0">
              {{ deleteDetectionItem && deleteDetectionItem.name }}
            </dd>
          </div>
          <div class="col-6 mt-3">
            <dt>{{ $t('governance.importHistory.columns.timestamp') }}</dt>
            <dd class="mb-0">
              {{ deleteDetectionItem && deleteDetectionItem.uploadDate ? dayjs(deleteDetectionItem.uploadDate).format('MMM D, YYYY h:mm A') : '' }}
            </dd>
          </div>
          <div class="col-6 mt-3">
            <dt>{{ $t('governance.applications.unmanagedImport.deleteDetection.countsLabel') }}</dt>
            <dd
              v-if="deleteCounts"
              class="mb-0">
              {{ formatDeleteCounts(deleteCounts) }}
            </dd>
            <dd
              v-else
              class="mb-0">
              &mdash;
            </dd>
          </div>
        </div>
        <FrAlert
          :dismissible="false"
          show-icon
          variant="danger"
          class="mb-0">
          {{ $t('governance.applications.unmanagedImport.deleteDetection.confirmAlert') }}
        </FrAlert>
      </template>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          :disabled="isRunningDeleteDetection"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="primary"
          :button-text="$t('governance.applications.unmanagedImport.deleteDetection.confirmButton')"
          :disabled="isLoadingDeleteCounts || isRunningDeleteDetection"
          :show-spinner="isRunningDeleteDetection"
          :spinner-text="$t('common.saving')"
          @click="runDeleteDetection" />
      </template>
    </BModal>

    <FrImportHistory
      :application-id="application.id"
      :items="historyItems"
      :is-loading="isLoadingHistory"
      :current-page="currentPage"
      :per-page="perPage"
      :total-rows="totalRows"
      @page-change="loadHistory"
      @page-size-change="onPageSizeChange"
      @refresh="loadHistory(currentPage)"
      @run-delete-detection="showDeleteDetectionModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  BCard,
  BCollapse,
  BFormFile,
  BModal,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrImportHistory from '@forgerock/platform-shared/src/components/governance/Import/ImportHistory';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import {
  detectApplicationDeletes,
  getApplicationFiles,
  uploadApplicationData,
} from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
});

defineEmits(['import']);

const { bvModal } = useBvModal();

const selectedObjectType = ref('');
const csvFile = ref(null);
const isDeletion = ref(false);
const useIgaId = ref(false);
const isUploading = ref(false);
const historyItems = ref([]);
const isLoadingHistory = ref(false);
const currentPage = ref(1);
const perPage = ref(10);
const totalRows = ref(0);
const deleteDetectionItem = ref(null);
const isLoadingDeleteCounts = ref(false);
const deleteCounts = ref(null);
const isRunningDeleteDetection = ref(false);

const objectTypeOptions = computed(() => (props.application.objectTypes || []).map((objectType) => ({
  value: objectType.name,
  text: objectType.name,
})));

const canUpload = computed(() => !!selectedObjectType.value && !!csvFile.value);

async function loadHistory(page = 1) {
  currentPage.value = page;
  isLoadingHistory.value = true;
  try {
    const { data } = await getApplicationFiles(props.application.id, {
      pagedResultsOffset: (page - 1) * perPage.value,
      pageSize: perPage.value,
      _sortKeys: '-metadata.modifiedDate',
      _sortType: 'date',
    });
    historyItems.value = data?.result || [];
    totalRows.value = data?.totalCount || 0;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.importHistory.errorLoading'));
  } finally {
    isLoadingHistory.value = false;
  }
}

function onPageSizeChange(size) {
  perPage.value = size;
  loadHistory(1);
}

function showConfirmModal() {
  bvModal.value.show('confirm-import-modal');
}

async function showDeleteDetectionModal(item) {
  deleteDetectionItem.value = item;
  deleteCounts.value = null;
  bvModal.value.show('confirm-delete-detection-modal');

  const objectTypeId = item?.context?.applicationObjectType;
  const uploadId = item?.context?.extractions?.[0]?.extractionId;
  isLoadingDeleteCounts.value = true;
  try {
    const { data } = await detectApplicationDeletes(props.application.id, objectTypeId, { ...(uploadId ? { uploadId } : {}), countOnly: true });
    deleteCounts.value = data?.counts || null;
  } catch {
    deleteCounts.value = null;
  } finally {
    isLoadingDeleteCounts.value = false;
  }
}

function onDeleteDetectionModalHidden() {
  deleteDetectionItem.value = null;
  deleteCounts.value = null;
  isLoadingDeleteCounts.value = false;
  isRunningDeleteDetection.value = false;
}

async function upload() {
  isUploading.value = true;
  try {
    await uploadApplicationData(props.application.id, csvFile.value, selectedObjectType.value, isDeletion.value, useIgaId.value);
    displayNotification('success', i18n.global.t('governance.applications.unmanagedImport.importData.uploadSuccess'));
    csvFile.value = null;
    selectedObjectType.value = '';
    isDeletion.value = false;
    useIgaId.value = false;
    loadHistory(1);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.applications.unmanagedImport.importData.uploadError'));
  } finally {
    isUploading.value = false;
  }
}

function formatDeleteCounts(counts) {
  return Object.entries(counts).map(([key, value]) => {
    const label = key.split('/').pop();
    return `${value} ${value === 1 ? label : `${label}s`}`;
  }).join(', ');
}

async function runDeleteDetection() {
  const item = deleteDetectionItem.value;
  const objectTypeId = item?.context?.applicationObjectType;
  const uploadId = item?.context?.extractions?.[0]?.extractionId;
  isRunningDeleteDetection.value = true;
  try {
    await detectApplicationDeletes(props.application.id, objectTypeId, uploadId ? { uploadId } : {});
    displayNotification('success', i18n.global.t('governance.applications.unmanagedImport.deleteDetection.success'));
    bvModal.value.hide('confirm-delete-detection-modal');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.applications.unmanagedImport.deleteDetection.error'));
  } finally {
    isRunningDeleteDetection.value = false;
  }
}

onMounted(() => loadHistory());
</script>
