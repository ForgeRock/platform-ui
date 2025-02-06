<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="importModal"
    ref="importModal"
    size="lg"
    :static="isTesting"
    title-tag="div"
    :hide-header-close="step === 1"
    no-close-on-esc
    no-close-on-backdrop
    @ok="$emit('success')"
    @show="initialize">
    <template #modal-title>
      <h2
        v-if="step === 0"
        class="h5 modal-title">
        {{ importModalTitle }}
      </h2>
    </template>

    <template v-if="step === 0">
      <p>{{ modalDesc }}</p>

      <BFormFile
        class="mt-3 mb-4"
        :class="{'fr-error': importError.length }"
        v-model="fileToImport"
        accept=".json"
        :placeholder="$t('importModal.jsonFile')"
        :browse-text="$t('common.browse')"
        @input="importError = '';">
        <template #file-name="{ names }">
          <FrField
            v-model="names[0]"
            class="top-left"
            name="nodeImportJsonFile"
            :label="$t('importModal.jsonFile')" />
        </template>
      </BFormFile>
      <p
        v-if="importError.length"
        class="text-danger mb-0 error-message">
        {{ importError }}
      </p>
    </template>

    <template v-else-if="step === 1">
      <FrSpinner
        class="pt-5 pb-4"
        testid="import-spinner" />
      <p class="text-center pb-5">
        {{ $t('importModal.importing') }}
      </p>
    </template>

    <template v-else>
      <div class="d-flex flex-column align-items-center">
        <img
          :src="require('@forgerock/platform-shared/src/assets/images/check.svg')"
          :alt="$t('common.checkIconAltText')"
          class="m-4 success-icon">
        <h3 class="mb-3 h5">
          {{ $t('importModal.importComplete') }}
        </h3>
        <p>
          {{ $t('importModal.successfullyImported', { itemType: itemLowerCase }) }}
        </p>
        <BButton
          variant="link"
          @click="$emit('viewConfiguration', importedId);">
          {{ $t('importModal.viewConfig', { itemType: itemLowerCase }) }}
        </BButton>
      </div>
    </template>

    <template #modal-footer="{ ok, hide }">
      <BButton
        v-if="step !== 2"
        :disabled="step === 1"
        variant="link"
        @click="hide()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        v-if="step === 0"
        @click="handleImportClicked();"
        variant="primary"
        :disabled="!fileToImport">
        {{ $t('importModal.import', { itemType }) }}
      </BButton>
      <BButton
        v-else-if="step === 2"
        @click="ok();"
        variant="outline-primary">
        {{ $t('common.done') }}
      </BButton>
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description Modal for importing an item. The modal has 3 steps, an initial
 * file upload step, a loading/spinner step while the file is uploaded to the
 * backend, and a final success step
 */
import {
  BButton,
  BModal,
  BFormFile,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import {
  ref,
  computed,
} from 'vue';
import i18n from '@/i18n';

const props = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  /**
   * Description to appear above the file import field
   */
  modalDesc: {
    type: String,
    required: true,
  },
  /**
   * Type of item being imported
   */
  itemType: {
    type: String,
    required: true,
  },
  /**
   * REST Api call to import used to import the item
   */
  importFunction: {
    type: Function,
    required: true,
  },
  /**
   * Error message shown if api call errors with a 409 conflict
   */
  conflictErrorMessage: {
    type: String,
    default: i18n.global.t('importModal.conflictError'),
  },
  /**
   * Error message shown if api call errors with anything but a 409
   */
  genericErrorMessage: {
    type: String,
    default: i18n.global.t('importModal.genericError'),
  },
});

const fileToImport = ref(null);
const importError = ref('');
const step = ref(0);
const itemLowerCase = computed(() => props.itemType.toLowerCase());
const importedId = ref('');
const importModalTitle = computed(() => {
  if (step.value === 0) {
    return i18n.global.t('importModal.import', { itemType: props.itemType });
  }
  if (step.value === 1) {
    return i18n.global.t('importModal.importingItem', { itemType: props.itemType });
  }
  // if step === 2
  return i18n.global.t('importModal.importComplete');
});

defineEmits(['success']);

/**
 * Returns the modal to the first step and displays an error message under the
 * import file field
 * @param {String} http status of failure if failed on api call
 */
const showErrorMessage = (status) => {
  if (status && status === 409) {
    importError.value = props.conflictErrorMessage;
  } else {
    importError.value = props.genericErrorMessage;
  }

  step.value = 0;
  fileToImport.value = null;
};

/**
 * Reads the uploaded file as json and makes the import api call to import the
 * file
 */
const handleImportClicked = () => {
  step.value = 1;

  const reader = new FileReader();
  // Event that fires after the file is read
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);

      props.importFunction(json)
        .then((res) => {
          [importedId.value] = Object.keys(res.data.created);
          step.value = 2;
        }).catch((error) => {
          const { status } = error.response || '';
          showErrorMessage(status);
        });
    } catch {
      showErrorMessage();
    }
  };

  // Thrown if readAsText fails
  reader.onerror = () => {
    showErrorMessage();
  };

  reader.readAsText(fileToImport.value);
};

/**
 * Initializes the modals default values
 */
const initialize = () => {
  fileToImport.value = null;
  importError.value = '';
  step.value = 0;
  importedId.value = '';
};

</script>

<style lang="scss" scoped>
.success-icon {
  width: 10rem;
  height: 10rem;
}
</style>
