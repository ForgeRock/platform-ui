<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButtonToolbar class="py-3 px-4">
      <BButton
        variant="primary"
        data-testid="btn-add-property"
        @click="showModal">
        <FrIcon
          icon-class="mr-2"
          name="add">
          {{ $t('governance.applications.edit.objectTypesTab.addProperty') }}
        </FrIcon>
      </BButton>
      <BButton
        class="ml-2"
        variant="outline-primary"
        @click="bvModal.show('importModal')">
        <FrIcon
          icon-class="mr-2"
          name="file_upload">
          {{ $t('governance.applications.edit.objectTypesTab.importSchema') }}
        </FrIcon>
      </BButton>
    </BButtonToolbar>
    <FrImportModal
      :modal-desc="$t('governance.applications.edit.objectTypesTab.importSchemaDescription')"
      :warning-message="$t('governance.applications.edit.objectTypesTab.importSchemaWarning')"
      :import-function="importSchema"
      :item-type-singular="$t('governance.applications.edit.objectTypesTab.schema')"
      @close="hideImportModal"
      @view-object="hideImportModal" />
    <FrSpinner
      v-if="isSaving"
      class="py-5" />
    <BTableSimple
      v-else-if="rows.length"
      hover
      responsive>
      <BThead>
        <BTr>
          <BTh class="w-100px fr-no-resize pr-0">
            {{ $t('common.order') }}
          </BTh>
          <BTh class="w-30">
            {{ $t('common.name') }}
          </BTh>
          <BTh>
            {{ $t('common.type') }}
          </BTh>
          <BTh>
            {{ $t('common.required') }}
          </BTh>
          <BTh class="w-120px fr-no-resize sticky-right">
            {{ $t('common.actions') }}
          </BTh>
        </BTr>
      </BThead>
      <Draggable
        id="property-list-table"
        tag="tbody"
        v-model="rows"
        chosen-class="chosen-item"
        drag-class="drag-item"
        ghost-class="ghost-item"
        item-key="name"
        @end="onRowChange($event)">
        <template #item="{ element, index }">
          <BTr
            :key="element.name"
            class="cursor-pointer"
            tabindex="0"
            @click="showEditModal(element)"
            @keydown.enter.prevent="showEditModal(element)"
            @keydown.space.prevent="showEditModal(element)">
            <BTd>
              <FrIcon
                icon-class="text-dark p-1 cursor-drag mr-2"
                name="drag_indicator">
                {{ index + 1 }}
              </FrIcon>
            </BTd>
            <BTd>
              <p class="h5 m-0">
                {{ element.displayName }}
              </p>
              <span class="text-muted">{{ element.name }}</span>
              <template v-if="element.isEntitlement">
                <FrIcon
                  icon-class="color-yellow"
                  name="star" />
              </template>
            </BTd>
            <BTd>
              {{ element.type }}
            </BTd>
            <BTd>
              <BBadge
                v-if="element.required"
                variant="success">
                {{ $t('common.required') }}
              </BBadge>
            </BTd>
            <BTd class="w-120px fr-no-resize sticky-right">
              <FrActionsCell
                v-if="!isSystemProperty(element.name)"
                class="py-2"
                @edit-clicked="showEditModal(element)"
                @delete-clicked="onDeleteProperty($event, element)" />
            </BTd>
          </BTr>
        </template>
      </Draggable>
    </BTableSimple>
    <FrNoData
      v-else-if="!isSaving"
      :card="false"
      class="mb-4"
      icon="inbox"
      :subtitle="$t('governance.applications.edit.objectTypesTab.noPropertiesDefined')" />
    <FrObjectTypePropertyModal
      :modal-id="modalId"
      :is-saving="isSaving"
      :initial-values="selectedProperty"
      :read-only="isReadOnly"
      :is-account-object-type="isAccountObjectType"
      :available-object-types="otherObjectTypes"
      @save="selectedProperty ? onEditProperty($event) : onAddProperty($event)" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  BBadge,
  BButton,
  BButtonToolbar,
  BTableSimple,
  BTd,
  BThead,
  BTh,
  BTr,
} from 'bootstrap-vue';
import Draggable from 'vuedraggable';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrImportModal from '@forgerock/platform-shared/src/components/governance/ImportModal/ImportModal';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { updateObjectType } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import FrObjectTypePropertyModal from './ObjectTypePropertyModal';
import i18n from '@/i18n';

Draggable.compatConfig = { MODE: 3 };

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  objectTypeId: {
    type: String,
    required: true,
  },
  objectType: {
    type: Object,
    required: true,
  },
  availableObjectTypes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:objectType']);

const { bvModal } = useBvModal();

const isSaving = ref(false);
const isReadOnly = ref(false);
const rows = ref([]);
const selectedProperty = ref(null);

const properties = computed(() => props.objectType.properties || {});
const modalId = computed(() => `add-property-${props.objectTypeId}`);
const isAccountObjectType = computed(() => props.objectType.type === 'account');
const otherObjectTypes = computed(() => props.availableObjectTypes.filter((ot) => ot.id !== props.objectTypeId));

function toRows(props_) {
  return Object.entries(props_)
    .map(([name, prop]) => ({
      name,
      displayName: prop.displayName || name,
      type: prop.type === 'array' ? (prop.items?.type || 'string') : (prop.type || ''),
      multiValued: prop.type === 'array',
      required: prop.required || false,
      creatable: !prop.flags?.includes('NOT_CREATABLE'),
      updatable: !prop.flags?.includes('NOT_UPDATEABLE'),
      order: prop.order ?? Number.MAX_SAFE_INTEGER,
      enumeratedValues: prop.enumeratedValues || [],
      applicationObjectType: prop.reference?.objectType || '',
      isEntitlement: prop.isEntitlement || false,
    }))
    .sort((a, b) => a.order - b.order);
}

watch(properties, (val) => {
  rows.value = toRows(val);
}, { immediate: true, deep: true });

function isSystemProperty(name) {
  return name === 'id' || name === 'displayName';
}

function showModal() {
  selectedProperty.value = null;
  isReadOnly.value = false;
  bvModal.value.show(modalId.value);
}

function showEditModal(property) {
  selectedProperty.value = property;
  isReadOnly.value = isSystemProperty(property.name);
  bvModal.value.show(modalId.value);
}

function buildPropertyPayload({
  type, multiValued, required, creatable, updatable, enumeratedValues, applicationObjectType, isEntitlement,
}) {
  const payload = {
    type: multiValued ? 'array' : type,
    required: required || false,
  };
  if (multiValued) {
    payload.items = { type };
  }
  const flags = [];
  if (!creatable) flags.push('NOT_CREATABLE');
  if (!updatable) flags.push('NOT_UPDATEABLE');
  if (flags.length) payload.flags = flags;
  if (enumeratedValues?.length) {
    payload.enumeratedValues = enumeratedValues;
  }
  if (applicationObjectType) {
    payload.reference = { objectType: applicationObjectType };
  }
  if (isEntitlement) {
    payload.isEntitlement = true;
  }
  return payload;
}

async function onAddProperty({
  name, displayName, type, multiValued, required, creatable, updatable, enumeratedValues, applicationObjectType, isEntitlement,
}) {
  const updatedProperties = {
    ...properties.value,
    [name]: {
      ...buildPropertyPayload({
        type, multiValued, required, creatable, updatable, enumeratedValues, applicationObjectType, isEntitlement,
      }),
      displayName,
      order: Object.keys(properties.value).length,
    },
  };
  const payload = { ...props.objectType, properties: updatedProperties };

  isSaving.value = true;
  try {
    await updateObjectType(props.applicationId, props.objectTypeId, payload);
    emit('update:objectType', payload);
    bvModal.value.hide(modalId.value);
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.addPropertySuccess'));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.applications.edit.objectTypesTab.addPropertyError'));
  } finally {
    isSaving.value = false;
  }
}

async function onEditProperty({
  name, displayName, type, multiValued, required, creatable, updatable, enumeratedValues, applicationObjectType, isEntitlement,
}) {
  const updatedProperties = {
    ...properties.value,
    [name]: {
      ...properties.value[name],
      ...buildPropertyPayload({
        type, multiValued, required, creatable, updatable, enumeratedValues, applicationObjectType, isEntitlement,
      }),
      displayName,
    },
  };
  const payload = { ...props.objectType, properties: updatedProperties };

  isSaving.value = true;
  try {
    await updateObjectType(props.applicationId, props.objectTypeId, payload);
    emit('update:objectType', payload);
    bvModal.value.hide(modalId.value);
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.editPropertySuccess'));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.applications.edit.objectTypesTab.editPropertyError'));
  } finally {
    isSaving.value = false;
  }
}

function hideImportModal() {
  bvModal.value.hide('importModal');
}

async function importSchema(schema) {
  const payload = { ...props.objectType, properties: schema };
  isSaving.value = true;
  try {
    const response = await updateObjectType(props.applicationId, props.objectTypeId, payload);
    emit('update:objectType', payload);
    return response;
  } finally {
    isSaving.value = false;
  }
}

async function onDeleteProperty(event, property) {
  event.stopPropagation();
  const updatedProperties = { ...properties.value };
  delete updatedProperties[property.name];
  const payload = { ...props.objectType, properties: updatedProperties };

  isSaving.value = true;
  try {
    await updateObjectType(props.applicationId, props.objectTypeId, payload);
    emit('update:objectType', payload);
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.deletePropertySuccess'));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.applications.edit.objectTypesTab.deletePropertyError'));
  } finally {
    isSaving.value = false;
  }
}

async function onRowChange({ oldIndex, newIndex }) {
  if (oldIndex === newIndex) return;
  const updatedProperties = {};
  rows.value.forEach((row, index) => {
    updatedProperties[row.name] = { ...properties.value[row.name], order: index };
  });
  const payload = { ...props.objectType, properties: updatedProperties };

  isSaving.value = true;
  try {
    await updateObjectType(props.applicationId, props.objectTypeId, payload);
    emit('update:objectType', payload);
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.updateObjectTypeSuccess'));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.applications.edit.objectTypesTab.reorderPropertyError'));
  } finally {
    isSaving.value = false;
  }
}
</script>

<style lang="scss" scoped>
:deep(#property-list-table) {
  .chosen-item {
    background-color: $white;
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
  }

  .ghost-item {
    opacity: 0.5;
    background-color: $light-blue;
  }

  .cursor-drag {
    cursor: move;
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
  }
}
</style>
