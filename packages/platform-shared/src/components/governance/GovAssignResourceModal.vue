<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      cancel-variant="outline-secondary"
      :id="modalId"
      no-close-on-backdrop
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
          <div class="size-48 fr-app-logo-bg d-flex align-items-center justify-content-center mr-4 align-self-center flex-shrink-0">
            <img
              class="size-36"
              :alt="$t('governance.resource.assignResourceModal.appLogoAltText')"
              :onerror="onImageError"
              :src="appLogoSource">
          </div>
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
          name="applicationSelect"
          resource-path="application"
          :option-function="applicationOptionFunction"
          :query-param-function="buildApplicationQueryParamFunction"
          :resource-function="getApplicationList"
          @selected:option="setValuesFromApplicationSelect">
          <template
            v-for="(slotName, index) in ['singleLabel', 'option']"
            :key="index"
            #[slotName]="{ option }">
            <BMedia
              no-body
              class="m-0 py-1 align-items-center">
              <div class="size-24 fr-app-logo-bg d-flex align-items-center justify-content-center mr-2">
                <img
                  :src="getApplicationLogo(option)"
                  :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: option.name })"
                  :onerror="onImageError"
                  class="size-18">
              </div>
              <BMediaBody>
                {{ option.text }}
              </BMediaBody>
            </BMedia>
          </template>
        </FrGovResourceSelect>
      </template>
      <template v-else>
        <div
          v-if="accountGrantsLoading"
          class="mb-3 text-center">
          <FrSpinner size="sm" />
        </div>
        <FrField
          v-else-if="accountGrants.length > 1"
          class="mb-3"
          type="select"
          :label="$t('common.account')"
          name="accountSelect"
          :options="accountGrants"
          :value="selectedAccountId"
          @input="selectedAccountId = $event" />
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
          :disabled="!valid || (accountGrants.length > 1 && !selectedAccountId)"
          :show-spinner="isSaving"
          :spinner-text="$t('common.saving')"
          @click="submitAssignment" />
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
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import { getApplicationList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getUserGrants } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';

const props = defineProps({
  entitlementOptions: {
    type: Array,
    default: () => [],
  },
  initialApplicationId: {
    type: String,
    default: '',
  },
  initialApplicationLogo: {
    type: String,
    default: '',
  },
  initialApplicationName: {
    type: String,
    default: '',
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
  modalId: {
    type: String,
    default: 'userEntitlementModal',
  },
  userId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['assign-resources', 'get-entitlements']);

// Data
const accountGrants = ref([]);
const accountGrantsLoading = ref(false);
const appLogoSource = ref('');
let debouncedSearch;
const selectedAccountId = ref(null);
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

function buildApplicationQueryParamFunction(query) {
  let baseFilter = 'application.objectTypes.accountAttribute co ""';
  if (props.resourceType === 'roles') {
    baseFilter += ' and !(application.isDisconnected eq "true")';
  }
  return {
    pageSize: 10,
    queryFilter: query ? `application.name co "${query}" and ${baseFilter}` : baseFilter,
  };
}

function applicationOptionFunction(resource) {
  return {
    ...resource.application,
    id: resource.id,
    text: resource.application?.name,
    value: `managed/application/${resource.id}`,
  };
}

function getEntitlements(searchValue) {
  const applicationPath = selectedApplication.value.split('/');
  emit('get-entitlements', { searchValue, selectedApplicationId: applicationPath[applicationPath.length - 1] });
}

async function fetchAccountGrants() {
  if (!props.userId) return;
  const applicationPath = selectedApplication.value.split('/');
  const applicationId = applicationPath[applicationPath.length - 1];
  accountGrantsLoading.value = true;
  accountGrants.value = [];
  selectedAccountId.value = null;
  try {
    const { data } = await getUserGrants(props.userId, {
      grantType: 'account',
      _pageSize: 10,
      _pagedResultsOffset: 0,
      _fields: 'keys,descriptor',
      _queryFilter: `application.id eq '${applicationId}'`,
    });
    accountGrants.value = (data?.result || []).flatMap((grant) => {
      const displayName = grant.descriptor?.idx?.['/account']?.displayName;
      const accountId = grant.keys?.accountId;
      return displayName && accountId ? [{ text: displayName, value: accountId }] : [];
    });
    if (accountGrants.value.length === 1) {
      selectedAccountId.value = accountGrants.value[0].value;
    }
  } finally {
    accountGrantsLoading.value = false;
  }
}

function initializeData() {
  selectedEntitlements.value = [];
  accountGrants.value = [];
  selectedAccountId.value = null;
  if (props.initialApplicationId) {
    selectedApplication.value = `managed/application/${props.initialApplicationId}`;
    selectedApplicationName.value = props.initialApplicationName;
    appLogoSource.value = props.initialApplicationLogo;
    stepIndex.value = STEPS.ChooseEntitlement;
    getEntitlements('');
    fetchAccountGrants();
  } else {
    selectedApplication.value = '';
    selectedApplicationName.value = '';
    appLogoSource.value = '';
    stepIndex.value = STEPS.ChooseApplication;
  }
}

function setValuesFromApplicationSelect(option) {
  selectedApplicationName.value = option.name;
  appLogoSource.value = getApplicationLogo(option);
}

function submitAssignment() {
  const entitlements = selectedEntitlements.value.map((id) => ({
    entitlementId: id,
    assignmentId: props.entitlementOptions.find((o) => o.value === id)?.assignmentId,
  }));
  emit('assign-resources', { entitlements, accountId: selectedAccountId.value });
}

function changeStep(changeValue) {
  stepIndex.value += changeValue;
  if (stepIndex.value === STEPS.ChooseApplication) {
    selectedEntitlements.value = [];
    accountGrants.value = [];
    selectedAccountId.value = null;
  } else {
    getEntitlements('');
    fetchAccountGrants();
  }
}

onMounted(() => {
  debouncedSearch = debounce(getEntitlements, 500);
});
</script>
