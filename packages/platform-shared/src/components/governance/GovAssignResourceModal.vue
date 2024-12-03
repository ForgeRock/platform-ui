<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      cancel-variant="outline-secondary"
      id="govCreateResourceModal"
      no-close-on-backdrop
      no-close-on-esc
      size="lg"
      :static="isTesting"
      @hidden="stepIndex = STEPS.ChooseApplication"
      @show="initializeData">
      <template #modal-header="{ close }">
        <h1
          v-if="stepIndex === STEPS.ChooseApplication"
          class="h5 modal-title">
          {{ modalTitle }}
        </h1>
        <BMedia
          v-else
          class="align-items-center"
          no-body>
          <img
            class="mr-4 align-self-center mw-100 h-auto"
            height="36"
            width="36"
            :alt="$t('governance.resource.assignResourceModal.appLogoAltText')"
            :onerror="onImageError"
            :src="appLogoSource">
          <BMediaBody>
            <small class="mb-0">
              {{ modalTitle }}
            </small>
            <h1 class="h5 modal-title mb-0">
              {{ selectedApplicationName }}
            </h1>
          </BMediaBody>
        </BMedia>
        <BButtonClose
          variant="link"
          class="ml-auto"
          @click="close">
          <FrIcon
            name="close"
            icon-class="md-24" />
        </BButtonClose>
      </template>
      <p class="mb-3">
        {{ stepDescription }}
      </p>
      <template v-if="stepIndex === STEPS.ChooseApplication">
        <FrGovResourceSelect
          v-model="selectedApplication"
          resource-path="application"
          @selected:option="setValuesFromApplicationSelect">
          <template
            v-for="(slotName, index) in ['singleLabel', 'option']"
            :key="index"
            #[slotName]="{ option }">
            <BMedia
              no-body
              class="m-0 py-1 align-items-center">
              <img
                :src="getApplicationLogo(option)"
                :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: option.name })"
                class="mr-2"
                :onerror="onImageError"
                width="18">
              <BMediaBody>
                {{ option.text }}
              </BMediaBody>
            </BMedia>
          </template>
        </FrGovResourceSelect>
      </template>
      <template v-else>
        <FrField
          v-model="selectedEntitlements"
          :internal-search="false"
          :label="$t('governance.resource.assignResourceModal.resourceToGrant', { resource: capitalizedResourceType })"
          name="entitlementSelect"
          :options="entitlementOptions"
          type="multiselect"
          validation="required"
          @search-change="debouncedSearch" />
      </template>
      <template #modal-footer="{ cancel }">
        <div class="flex-grow-1">
          <BButton
            v-if="stepIndex !== STEPS.ChooseApplication"
            @click="changeStep(-1)"
            variant="link">
            {{ $t('common.previous') }}
          </BButton>
        </div>
        <BButton
          variant="link"
          @click="cancel">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          v-if="stepIndex !== STEPS.ChooseEntitlement"
          @click="changeStep(1)"
          variant="primary"
          :disabled="!valid">
          {{ $t('common.next') }}
        </BButton>
        <FrButtonWithSpinner
          v-else
          :button-text="$t('governance.resource.assignResourceModal.grantResource', { resource: capitalizedResourceType })"
          :disabled="!valid"
          :show-spinner="isSaving"
          :spinner-text="$t('common.saving')"
          @click="emit('assign-resources', selectedEntitlements)" />
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>
/**
 * @description Dialog used for managing the assigning of governance resources.
 *
 * @param {Array} entitlementOptions - available entitlements for select field
 * @param {string} resourceType - Required resource type being assigned
 */
import {
  computed,
  defineProps,
  onMounted,
  ref,
} from 'vue';
import { capitalize, debounce } from 'lodash';
import {
  BButton,
  BButtonClose,
  BMedia,
  BMediaBody,
  BModal,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import i18n from '@/i18n';

const props = defineProps({
  entitlementOptions: {
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
  parentResourceName: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['get-entitlements']);

// Data
const appLogoSource = ref('');
let debouncedSearch;
const selectedApplication = ref('');
const selectedApplicationName = ref('');
const selectedEntitlements = ref([]);
const stepIndex = ref(0);
const STEPS = Object.freeze({
  ChooseApplication: 0,
  ChooseEntitlement: 1,
});

const capitalizedResourceType = computed(() => capitalize(props.resourceType));
const modalTitle = computed(() => {
  if (stepIndex.value === STEPS.ChooseApplication) {
    return i18n.global.t('governance.resource.assignResourceModal.title', { resourceType: i18n.global.t('common.entitlements') });
  }
  return i18n.global.t('governance.resource.assignResourceModal.titleSecondStep', { resourceType: i18n.global.t('common.entitlements') });
});
const stepDescription = computed(() => {
  if (stepIndex.value === STEPS.ChooseApplication) {
    return i18n.global.t('governance.resource.assignResourceModal.stepOneDescription', { resource: props.resourceType, managedResource: props.parentResourceName });
  }
  return i18n.global.t('governance.resource.assignResourceModal.stepTwoDescription', { appName: selectedApplicationName.value, resource: props.resourceType, managedResource: props.parentResourceName });
});

function getEntitlements(searchValue) {
  const applicationPath = selectedApplication.value.split('/');
  emit('get-entitlements', { searchValue, selectedApplicationId: applicationPath[applicationPath.length - 1] });
}

function initializeData() {
  selectedEntitlements.value = [];
  selectedApplication.value = '';
}

function setValuesFromApplicationSelect(option) {
  selectedApplicationName.value = option.name;
  appLogoSource.value = getApplicationLogo(option);
}

function changeStep(changeValue) {
  stepIndex.value += changeValue;
  if (stepIndex.value === STEPS.ChooseApplication) {
    selectedEntitlements.value = [];
  } else {
    getEntitlements('');
  }
}

onMounted(() => {
  debouncedSearch = debounce(getEntitlements, 500);
});
</script>
