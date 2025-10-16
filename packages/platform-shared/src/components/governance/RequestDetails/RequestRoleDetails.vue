<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTabs
    v-if="roleRequestData"
    v-model="tabIndex">
    <BTab :title="$t('governance.certificationTask.roleDetails')">
      <BRow
        v-if="roleRequestData"
        class="mt-4">
        <BCol xs="12">
          <FrField
            v-model="roleRequestData.role.object.name"
            :disabled="props.readOnly"
            class="mb-3"
            :label="$t('common.name')"
          />
        </BCol>
      </BRow>
      <BRow v-if="roleRequestData">
        <BCol xs="12">
          <FrField
            v-model="roleRequestData.role.object.description"
            :disabled="props.readOnly"
            class="mb-3"
            :label="$t('common.description')"
          />
        </BCol>
      </BRow>
      <h3 class="h5 mb-4">
        {{ $t('governance.entitlements.glossaryAttributes') }}
      </h3>
      <FrGlossaryEditForm
        v-if="isInitialized"
        class="mb-2"
        :glossary-schema="glossarySchema"
        :read-only="props.readOnly"
        :model-value="roleRequestData.glossary"
        @update:modelValue="updateGlossaryAndEmit" />
    </BTab>
    <BTab :title="$t('governance.administer.roles.entitlements')">
      <FrEntitlementsTab
        :items="roleRequestData.entitlements?.result"
        :count="roleRequestData.entitlements?.totalCount"
        is-active
        :is-loading="savingRequest"
        :request="request"
        :read-only="props.readOnly"
        :role-id="roleRequestData.role.roleId"
        :role-schema="glossarySchema"
        :role-status="roleRequestData.role.status"
        @update-tab-data="updateTabData" />
    </BTab>
    <BTab
      :title="$t('governance.administer.roles.members')">
      <FrMembersTab
        :items="roleRequestData.members?.result || []"
        :count="roleRequestData.members?.totalCount || 0"
        is-active
        :is-loading="savingRequest"
        :read-only="props.readOnly"
        :request="request"
        :role-id="roleRequestData.role.roleId"
        :role-schema="roleSchema"
        :role-status="roleRequestData.role.status"
        @update-tab-data="updateTabData" />
    </BTab>
  </BTabs>
</template>

<script setup>
/**
 * Displays the role details of the request
 * @component RequestRoleDetails
 * @prop {Object} item - Request details info
 * @prop {String} type - The details type for this item
 * @prop {Boolean} readOnly - Flag to determine if this item is read-only
 */
import {
  onMounted,
  ref,
  watch,
} from 'vue';
import {
  BCol,
  BRow,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { filter, forEach, map } from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrEntitlementsTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/EntitlementsTab';
import FrMembersTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/MembersTab';
import i18n from '@/i18n';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
  request: {
    type: Object,
    default: () => ({}),
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const { bvModal } = useBvModal();

const tabIndex = ref(0);
const savingRequest = ref(false);
const roleRequestData = ref(null);
const glossarySchema = ref(null);
const roleSchema = ref(null);
const isInitialized = ref(false);
const glossaryValues = ref(null);

const emit = defineEmits(['update-role']);

/**
 * Extracts role request details from the request object.
 * @param {Object} request - The request object containing role details.
 * @returns {Object} - The extracted role request details.
 */
function getRoleRequestDetails(request) {
  return {
    role: request.role,
    glossary: request.role.glossary,
    entitlements: request.role.object.entitlements,
    members: request.role.object.members,
  };
}

/**
 * Get the role glossary schema.
 */
async function getSchemaData() {
  try {
    // get glossary schema and values
    const glossaryData = await getGlossarySchema('role');
    glossarySchema.value = glossaryData;
    const roleData = await getSchema('managed/alpha_role');
    roleSchema.value = map(roleData?.data.properties, (prop, key) => ({
      ...prop,
      propName: key,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.certificationTask.errors.glossaryError'));
  }
}

/**
 * Updates the tab data based on the provided parameters.
 * @param {String} tabUpdated - The tab that was updated.
 * @param {String} operation - The operation performed on the tab data.
 * @param {Object} data - The data associated with the operation.
 */
async function updateTabData(tabUpdated, operation, data) {
  if (tabUpdated === 'entitlements') {
    if (operation === 'load') {
      roleRequestData.value.entitlements = data;
    } else if (operation === 'add') {
      forEach(data, (entitlement) => {
        roleRequestData.value.entitlements.result.push(entitlement);
      });
      bvModal.value.hide('govCreateResourceModal');
    } else if (operation === 'remove') {
      const idsToRemove = map(data, 'id');
      const newEntitlements = filter(roleRequestData.value.entitlements.result, (entitlement) => idsToRemove.indexOf(entitlement.id) < 0);
      roleRequestData.value.entitlements.result = newEntitlements;
      bvModal.value.hide('revoke-from-role-modal');
    }
  } else if (tabUpdated === 'members') {
    if (operation === 'load') {
      roleRequestData.value.members = data;
    } else if (operation === 'add') {
      const existingIds = map(roleRequestData.value.members.result, 'id');
      forEach(data, (member) => {
        if (existingIds.indexOf(member._id) < 0) {
          roleRequestData.value.members.result.push(member);
        }
      });
    } else if (operation === 'remove') {
      const idsToRemove = map(data, 'id');
      const newMembers = filter(roleRequestData.value.members.result, (member) => idsToRemove.indexOf(member.id) < 0);
      roleRequestData.value.members.result = newMembers;
    }
  }
}

/**
 * Updates the glossary with the provided value and emits an event.
 * @param {Object} value - new glossary value.
 */
function updateGlossaryAndEmit(value) {
  glossaryValues.value = value;
  const bundledFormData = {
    role: {
      ...roleRequestData.value.role,
    },
    glossary: value,
  };
  updateTabData('details', 'update', bundledFormData);
}

watch(roleRequestData, (newVal) => {
  emit('update-role', newVal);
}, { deep: true, immediate: true });

onMounted(async () => {
  roleRequestData.value = await getRoleRequestDetails(props.item.rawData.request);
  await getSchemaData();
  isInitialized.value = true;
});
</script>
