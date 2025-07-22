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
    @ok="$emit('close')"
    @show="initialize">
    <template #modal-title>
      <h2 class="h5 modal-title">
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
            name="importJsonFile"
            :label="$t('importModal.jsonFile')" />
        </template>
      </BFormFile>
      <p
        v-if="importError.length"
        class="text-danger mb-0 error-message mt-2"
        v-html="importError" />
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
        <BButton
          v-if="success"
          variant="link"
          @click="$emit('view-object', importedObject.id);">
          {{ $t('importModal.viewConfig', { itemTypeSingular: singularItemLowerCase }) }}
        </BButton>
        <p
          v-if="!success"
          class="text-danger font-weight-bold text-center">
          {{ $t('importModal.unsuccessfullyImported') }}
        </p>
      </div>
    </template>

    <template #modal-footer="{ ok, cancel }">
      <BButton
        v-if="step !== 2"
        :disabled="step === 1"
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        v-if="step === 0"
        @click="handleImportClicked();"
        variant="primary"
        :disabled="!fileToImport">
        {{ $t('governance.importModal.import') }}
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
   * Singular of the type of item being imported
   */
  itemTypeSingular: {
    type: String,
    required: true,
  },
  /**
   * Function used to validate the item
   */
  validateFunction: {
    type: Function,
    default: null,
  },
  /**
   * REST Api call to import used to import the item
   */
  importFunction: {
    type: Function,
    required: true,
  },
});

const fileToImport = ref(null);
const importError = ref('');
const step = ref(0);
const success = ref(false);
const importedObject = ref(null);
const singularItemLowerCase = computed(() => props.itemTypeSingular.toLowerCase());
const importModalTitle = computed(() => {
  if (step.value === 0) {
    return i18n.global.t('governance.importModal.import', { itemType: props.itemTypeSingular });
  }
  if (step.value === 1) {
    return i18n.global.t('governance.importModal.importingItem', { itemType: props.itemTypeSingular });
  }
  // if step === 2
  return i18n.global.t('importModal.importComplete');
});

defineEmits(['close', 'view-object']);

/**
 * Returns the modal to the first step and displays an error message under the
 * import file field
 * @param {String} errorMessage status of failure
 */
function showErrorMessage(errorMessage) {
  importError.value = errorMessage || '';
  step.value = 0;
  fileToImport.value = null;
}

/**
 * Reads the uploaded file as json and makes the import api call to import the
 * file
 */
function handleImportClicked() {
  step.value = 1;
  const reader = new FileReader();
  // Event that fires after the file is read
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (props.validateFunction) {
        try {
          const validationResp = await props.validateFunction(json);
          if (!validationResp.valid) {
            showErrorMessage(validationResp.message);
            return;
          }
        } catch (validationError) {
          showErrorMessage(i18n.global.t('governance.importModal.genericValidationError'));
          return;
        }
      }
      try {
        const importResp = await props.importFunction(json);
        importedObject.value = importResp.data;
        success.value = true;
        step.value = 2;
      } catch (error) {
        showErrorMessage(error?.response?.data?.message || i18n.global.t('governance.importModal.genericImportError'));
      }
    } catch {
      showErrorMessage(i18n.global.t('governance.importModal.genericImportError'));
    }
  };

  // Thrown if readAsText fails
  reader.onerror = () => {
    showErrorMessage(i18n.global.t('governance.importModal.genericImportError'));
  };

  reader.readAsText(fileToImport.value);
}

/**
 * Initializes the modals default values
 */
function initialize() {
  fileToImport.value = null;
  importError.value = '';
  step.value = 0;
  success.value = false;
  importedObject.value = null;
}

</script>

<style lang="scss" scoped>
.success-icon {
  width: 10rem;
  height: 10rem;
}
</style>
