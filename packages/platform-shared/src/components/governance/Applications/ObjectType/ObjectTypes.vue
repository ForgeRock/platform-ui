<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      v-model="showAddModal"
      no-close-on-backdrop
      size="lg"
      title-class="h5"
      title-tag="h2"
      :title="$t('governance.applications.edit.objectTypesTab.addObjectType')"
      @hidden="resetAddForm"
      @shown="initAddForm">
      <FrField
        v-model="addForm.id"
        class="mb-4"
        name="objectTypeId"
        :label="$t('governance.applications.edit.objectTypesTab.objectTypeNameLabel')"
        validation="required" />
      <BFormGroup :label="$t('common.type')">
        <BFormRadioGroup
          v-model="addForm.type"
          class="mb-1">
          <BFormRadio
            :disabled="hasAccountType"
            value="account">
            {{ $t('common.account') }}
          </BFormRadio>
          <BFormRadio value="resource">
            {{ $t('common.resource') }}
          </BFormRadio>
        </BFormRadioGroup>
        <small class="text-muted">
          {{ hasAccountType ? $t('governance.applications.edit.objectTypesTab.objectTypeDescriptionAccountTaken') : $t('governance.applications.edit.objectTypesTab.objectTypeDescription') }}
        </small>
      </BFormGroup>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="primary"
          :button-text="$t('common.save')"
          :disabled="!valid || isAdding"
          :show-spinner="isAdding"
          :spinner-text="$t('common.saving')"
          @click="addObjectType" />
      </template>
    </BModal>
  </VeeForm>
  <FrNoData
    v-if="!isLoading && !objectTypes.length"
    icon="inbox"
    body-class="mb-5"
    :title="$t('governance.applications.edit.objectTypesTab.title')"
    :subtitle="$t('governance.applications.edit.objectTypesTab.noObjectTypes')">
    <BButton
      variant="primary"
      @click="showAddModal = true">
      <FrIcon
        icon-class="mr-2"
        name="add">
        {{ $t('governance.applications.edit.objectTypesTab.addObjectType') }}
      </FrIcon>
    </BButton>
  </FrNoData>
  <BCard
    v-else
    no-body>
    <BButtonToolbar class="px-4 py-0">
      <BDropdown
        variant="link"
        toggle-class="text-decoration-none pl-0 py-3 d-flex align-items-center">
        <template #button-content>
          <BMedia class="align-items-center">
            <template #aside>
              <img
                alt=""
                height="24"
                class="mt-2"
                :src="logoSource"
                :onerror="onImageError"
                width="54">
            </template>
            <div class="text-left pr-2">
              <small class="text-muted">
                {{ $t('governance.applications.edit.objectTypesTab.title') }}
              </small>
              <h5 class="mb-0">
                {{ selectedObjectType ? selectedObjectType.name : $t('governance.applications.edit.objectTypesTab.selectObjectType') }}
              </h5>
            </div>
          </BMedia>
        </template>
        <BDropdownItem
          v-for="(objectType, index) in objectTypes"
          :key="objectType.id"
          :active="selectedObjectTypeTab === index"
          @click="selectedObjectTypeTab = index">
          {{ objectType.name }}
        </BDropdownItem>
        <template v-if="objectTypes.length">
          <BDropdownDivider />
          <BDropdownItem @click="showAddModal = true">
            <FrIcon
              icon-class="mr-2"
              name="add" />{{ $t('governance.applications.edit.objectTypesTab.addObjectType') }}
          </BDropdownItem>
        </template>
      </BDropdown>
    </BButtonToolbar>

    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <div
      v-else-if="loadedObjectType"
      class="d-flex card-tabs-vertical">
      <BNav
        class="border-right fr-simple-nav fr-object-type-nav"
        vertical
        pills>
        <FrMenuItem
          v-for="(item, navIndex) in navItems"
          :key="`nav_${navIndex}`"
          :display-name="item.displayName"
          :active="selectedInnerTab === navIndex"
          :event="String(navIndex)"
          is-nav
          @item-click="selectedInnerTab = Number($event)" />
      </BNav>
      <BTabs
        :value="selectedInnerTab"
        class="flex-grow-1 fr-object-type-tabs"
        nav-class="d-none"
        lazy>
        <BTab>
          <FrObjectTypePropertyList
            :application-id="applicationId"
            :object-type-id="loadedObjectType.id"
            :object-type="loadedObjectType"
            :available-object-types="objectTypes"
            @update:objectType="loadedObjectType = $event" />
        </BTab>
        <BTab>
          <FrObjectTypeDataList
            :application-id="applicationId"
            :object-type-id="loadedObjectType.id"
            :object-type-name="loadedObjectType.name"
            :object-type-category="loadedObjectType.type"
            :properties="loadedObjectType.properties || {}" />
        </BTab>
        <BTab v-if="loadedObjectType.type === 'account'">
          <FrObjectTypeCorrelation
            :application-id="applicationId"
            :object-type="loadedObjectType" />
        </BTab>
      </BTabs>
    </div>
  </BCard>
  <FrDeletePanel
    v-if="loadedObjectType && objectTypes.length"
    class="mt-4"
    modal-id="delete-object-type-modal"
    :is-deleting="isDeleting"
    :translated-item-type="$t('common.objectType')"
    @delete-item="removeObjectType" />
</template>

<script setup>
import {
  computed, ref, watch,
} from 'vue';
import {
  BButton,
  BButtonToolbar,
  BCard,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
  BFormGroup,
  BFormRadio,
  BFormRadioGroup,
  BMedia,
  BModal,
  BNav,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrDeletePanel from '@forgerock/platform-shared/src/components/DeletePanel';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrMenuItem from '@forgerock/platform-shared/src/components/MenuItem';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { createObjectType, deleteObjectType, getObjectType } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrObjectTypeCorrelation from './ObjectTypeCorrelation';
import FrObjectTypeDataList from './ObjectTypeDataList';
import FrObjectTypePropertyList from './ObjectTypePropertyList';
import i18n from '@/i18n';

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  logoSource: {
    type: String,
    default: '',
  },
  objectTypes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['object-type-added', 'object-type-deleted']);

const { bvModal } = useBvModal();

const selectedObjectTypeTab = ref(0);
const selectedInnerTab = ref(0);
const isLoading = ref(false);
const loadedObjectType = ref(null);
const isAdding = ref(false);
const isDeleting = ref(false);
const showAddModal = ref(false);

const emptyAddForm = () => ({ id: '', type: 'account' });
const addForm = ref(emptyAddForm());

const selectedObjectType = computed(() => props.objectTypes[selectedObjectTypeTab.value] || null);

const hasAccountType = computed(() => props.objectTypes.some((ot) => ot.type === 'account'));

const navItems = computed(() => {
  const items = [
    { displayName: i18n.global.t('governance.applications.edit.objectTypesTab.propertiesTab') },
    { displayName: i18n.global.t('governance.applications.edit.objectTypesTab.dataTab') },
  ];
  if (loadedObjectType.value?.type === 'account') {
    items.push({ displayName: i18n.global.t('governance.unmanagedApplications.correlationTab.navLabel') });
  }
  return items;
});

function initAddForm() {
  addForm.value = emptyAddForm();
  if (hasAccountType.value) {
    addForm.value.type = 'resource';
  }
}

function resetAddForm() {
  addForm.value = emptyAddForm();
}

async function addObjectType() {
  isAdding.value = true;
  try {
    const { data } = await createObjectType(props.applicationId, {
      id: addForm.value.id,
      type: addForm.value.type,
      properties: {
        id: {
          type: 'string',
          userSpecific: true,
          displayName: 'ID',
          required: true,
          flags: ['NOT_UPDATEABLE'],
          order: 0,
        },
        displayName: {
          type: 'string',
          order: 1,
          displayName: 'Display Name',
          required: true,
        },
      },
    });
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.addObjectTypeSuccess'));
    emit('object-type-added', data);
    showAddModal.value = false;
  } catch {
    showErrorMessage(null, i18n.global.t('governance.applications.edit.objectTypesTab.addObjectTypeError'));
  } finally {
    isAdding.value = false;
  }
}

async function removeObjectType() {
  isDeleting.value = true;
  try {
    await deleteObjectType(props.applicationId, selectedObjectType.value.id);
    bvModal.value.hide('delete-object-type-modal');
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.deleteObjectTypeSuccess'));
    selectedObjectTypeTab.value = 0;
    emit('object-type-deleted', selectedObjectType.value.id);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.applications.edit.objectTypesTab.deleteObjectTypeError'));
  } finally {
    isDeleting.value = false;
  }
}

async function fetchObjectType(objectType) {
  if (!objectType) return;
  isLoading.value = true;
  selectedInnerTab.value = 0;
  try {
    const { data } = await getObjectType(props.applicationId, objectType.id);
    loadedObjectType.value = data;
  } catch {
    showErrorMessage(null, i18n.global.t('governance.applications.edit.objectTypesTab.errorLoadingObjectType'));
    loadedObjectType.value = null;
  } finally {
    isLoading.value = false;
  }
}

watch(selectedObjectType, fetchObjectType, { immediate: true });

watch(() => props.objectTypes, (newTypes, oldTypes) => {
  if (newTypes.length > oldTypes.length) {
    const addedIndex = newTypes.findIndex((ot) => !oldTypes.some((old) => old.id === ot.id));
    selectedObjectTypeTab.value = addedIndex !== -1 ? addedIndex : newTypes.length - 1;
  }
});
</script>

<style lang="scss" scoped>
.fr-object-type-nav {
  min-width: 180px;
}

.fr-object-type-tabs {
  min-width: 0;
}
</style>
