<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm as="span">
    <BContainer
      fluid
      class="my-5">
      <FrSpinner
        v-if="isLoading"
        class="py-5" />
      <FrNoData
        v-else-if="loadError"
        icon="list"
        body-class="mb-5"
        :title="loadError" />
      <template v-else>
        <BMedia
          no-body
          class="mb-4 align-items-center">
          <div class="d-flex align-items-center justify-content-center p-3 mr-4 rounded border border-darkened header-image">
            <img
              alt=""
              height="54"
              width="54"
              :onerror="onImageError"
              :src="logoSource">
          </div>
          <BMediaBody class="align-self-center text-truncate">
            <h1 class="pb-1 text-truncate">
              {{ applicationDetails?.name }}
            </h1>
          </BMediaBody>
        </BMedia>

        <BTabs
          v-model="activeTabIndex"
          nav-class="fr-tabs"
          lazy>
          <BTab
            class="mt-4"
            :title="$t('applications.edit.applicationDetailsTab.title')">
            <FrApplicationDetailsPanel
              v-if="applicationDetails"
              :logo-source="logoSource"
              :schema="schema"
              :model="applicationDetails"
              :app-id="applicationDetails.id"
              :parent-resource="parentResource"
              :relationship-property="relationshipProperty"
              :is-saving="isSaving"
              :user-resource-name="userResourceName"
              :role-resource-name="roleResourceName"
              :org-resource-name="orgResourceName"
              @update:model="updateModel"
              @update:glossary-model="updateGlossaryModel"
              @update:glossary-create-flag="setGlossaryCreateFlag"
              @save-app="saveApp" />
            <FrDeletePanel
              v-if="applicationDetails"
              class="mt-4"
              :is-deleting="isDeleting"
              :translated-item-type="$t('applications.application')"
              @delete-item="deleteApp" />
          </BTab>
          <BTab
            class="mt-4"
            :title="$t('governance.applications.edit.objectTypesTab.title')">
            <FrObjectTypes
              v-if="applicationDetails"
              :application-id="applicationDetails.id"
              :logo-source="logoSource"
              :object-types="applicationDetails.objectTypes || []"
              @object-type-added="loadApplication"
              @object-type-deleted="loadApplication" />
          </BTab>
          <BTab
            class="mt-4"
            :title="$t('common.accounts')">
            <FrAccounts
              v-if="applicationDetails"
              is-embedded
              :application-ids="[applicationDetails.id]" />
          </BTab>
          <BTab
            class="mt-4"
            :title="$t('governance.applications.unmanagedImport.tabTitle')">
            <FrUnmanagedApplicationImport
              v-if="applicationDetails"
              :application="applicationDetails" />
          </BTab>
        </BTabs>
      </template>
    </BContainer>
  </VeeForm>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue';
import {
  BContainer,
  BMedia,
  BMediaBody,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { has } from 'lodash';
import { Form as VeeForm } from 'vee-validate';
import FrDeletePanel from '@forgerock/platform-shared/src/components/DeletePanel';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { onImageError, resolveImage } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { useRouter } from 'vue-router';
import {
  deleteUnmanagedApplication,
  getApplication,
  updateApplication,
} from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import {
  saveGlossaryAttributesByAppId,
  updateGlossaryAttributesByAppId,
} from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { compareRealmSpecificResourceName } from '@forgerock/platform-shared/src/utils/realm';
import FrApplicationDetailsPanel from '@forgerock/platform-shared/src/components/governance/Applications/ApplicationDetailsPanel';
import FrAccounts from '@forgerock/platform-shared/src/views/Governance/Accounts/Accounts';
import FrObjectTypes from '@forgerock/platform-shared/src/components/governance/Applications/ObjectType/ObjectTypes';
import FrUnmanagedApplicationImport from '@forgerock/platform-shared/src/components/governance/Applications/UnmanagedApplicationImport';
import store from '@/store';
import i18n from '@/i18n';

const schema = [
  [
    {
      model: 'name',
      label: i18n.global.t('governance.applications.addUnmanagedAppModal.nameLabel'),
      type: 'string',
    },
  ],
  [
    {
      model: 'description',
      label: i18n.global.t('governance.applications.addUnmanagedAppModal.descriptionLabel'),
      type: 'string',
    },
  ],
  [
    {
      model: 'ownerIds',
      label: i18n.global.t('governance.unmanagedApplications.addUnmanagedAppModal.ownersLabel'),
      customSlot: 'application-owners',
      type: 'multiselect',
    },
  ],
  [
    {
      columns: 2,
      columnClass: 'mb-3 pr-0 border-left border-top border-bottom',
      customSlot: 'logo',
      model: 'custom',
    },
    {
      columns: 10,
      columnClass: 'mb-3 pt-3 pr-lg-3 border-right border-top border-bottom',
      label: i18n.global.t('governance.applications.addUnmanagedAppModal.logoUriLabel'),
      description: i18n.global.t('governance.applications.addUnmanagedAppModal.logoUriDescription'),
      model: 'icon',
      type: 'string',
    },
  ],
];

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  baseApplication: {
    type: Object,
    default: null,
  },
  tab: {
    type: String,
    default: 'details',
  },
});

const tabs = ['details', 'object-types', 'accounts', 'import'];

const router = useRouter();
const { setBreadcrumb } = useBreadcrumb();

const applicationDetails = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isDeleting = ref(false);
const glossaryData = ref(null);
const isGlossaryCreate = ref(false);
const loadError = ref('');
const activeTabIndex = ref(Math.max(0, tabs.indexOf(props.tab)));
const userResourceName = ref('user');
const roleResourceName = ref('role');
const orgResourceName = ref('organization');
const relationshipProperty = ref(null);
const parentResource = ref('managed/application');

const logoSource = computed(() => applicationDetails.value?.icon || resolveImage('custom.svg'));

function updateModel({ value, path }) {
  if (!applicationDetails.value) return;
  if (path === 'ownerIds' && Array.isArray(value)) {
    // RelationshipEdit emits full relationship objects; keep them in sync on the property
    // and store the plain IDs on applicationDetails for the save payload
    relationshipProperty.value = { ...relationshipProperty.value, value };
    applicationDetails.value = {
      ...applicationDetails.value,
      ownerIds: value.map(({ _ref }) => _ref.split('/').slice(2).join('/')),
    };
  } else {
    applicationDetails.value = { ...applicationDetails.value, [path]: value };
  }
}

function updateGlossaryModel(data) {
  glossaryData.value = data ?? {};
}

function setGlossaryCreateFlag(flag) {
  isGlossaryCreate.value = flag;
}

async function saveApp() {
  isSaving.value = true;
  try {
    const { metadata, ...appPayload } = applicationDetails.value;
    const savePromises = [updateApplication(props.applicationId, appPayload)];
    if (glossaryData.value !== null) {
      // Reset inside .then() so the flag only clears on success; a failed POST
      // leaves it true so the next save retries with POST rather than PUT.
      const glossarySave = isGlossaryCreate.value
        ? saveGlossaryAttributesByAppId(props.applicationId, glossaryData.value).then(() => { isGlossaryCreate.value = false; })
        : updateGlossaryAttributesByAppId(props.applicationId, glossaryData.value);
      savePromises.push(glossarySave);
    }
    await Promise.all(savePromises);
    displayNotification('success', i18n.global.t('applications.edit.messages.updateSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('applications.edit.messages.updateFail'));
  } finally {
    isSaving.value = false;
  }
}

async function deleteApp() {
  isDeleting.value = true;
  try {
    await deleteUnmanagedApplication(props.applicationId);
    router.push('/applications');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('applications.edit.listApps.deleteAppFail'));
    isDeleting.value = false;
  }
}

async function loadOwnerRelationshipProperty(currentOwnerIds) {
  try {
    const { data } = await getConfig('managed');
    if (!data?.objects) return;
    const { isFraas, realm } = store.state;
    const appManagedObject = data.objects.find((obj) => (!isFraas || obj.name.startsWith(realm)) && obj.name.endsWith('application'));
    if (!appManagedObject || !has(appManagedObject, 'schema.properties.owners')) return;

    const userManagedObject = data.objects.find((obj) => (!isFraas || obj.name.startsWith(realm)) && obj.name.endsWith('user'));
    const userObjectName = userManagedObject?.name || `${realm}_user`;
    parentResource.value = `managed/${appManagedObject.name}`;

    const ownersProperty = appManagedObject.schema.properties.owners;
    const resourceCollection = ownersProperty.items?.resourceCollection?.[0];
    const displayFields = resourceCollection?.query?.fields || ['userName', 'givenName', 'sn'];

    const ids = (currentOwnerIds || []);
    let userMap = {};
    if (ids.length) {
      const queryFilter = ids.map((id) => `_id eq "${id}"`).join(' or ');
      const { data: usersData } = await getManagedResourceList(userObjectName, {
        queryFilter,
        fields: ['_id', ...displayFields].join(','),
      });
      userMap = Object.fromEntries((usersData.result || []).map((u) => [u._id, u]));
    }

    const owners = ids.map((id) => ({
      _ref: `managed/${userObjectName}/${id}`,
      _refResourceCollection: `managed/${userObjectName}`,
      _refResourceId: id,
      _refProperties: {},
      ...userMap[id],
    }));

    relationshipProperty.value = {
      ...ownersProperty,
      value: owners,
      key: 'owners',
      options: [],
    };
  } catch {
    // Non-fatal: owners field will simply not render
  }
}

async function loadApplication() {
  try {
    const { data } = await getApplication(props.applicationId, { disconnected: true });
    applicationDetails.value = data;
    await loadOwnerRelationshipProperty(data.ownerIds);
  } catch {
    // Temporary fallback
    if (props.baseApplication) {
      applicationDetails.value = props.baseApplication;
      await loadOwnerRelationshipProperty(props.baseApplication.ownerIds);
    } else {
      loadError.value = i18n.global.t('governance.application.errorRetrievingApplication');
    }
  } finally {
    isLoading.value = false;
  }
}

async function fetchManagedNames() {
  try {
    const { data } = await getConfig('managed');
    const objects = data.objects || [];
    const find = (type) => objects.find((o) => compareRealmSpecificResourceName(o.name, type))?.name;
    userResourceName.value = find('user') || 'user';
    roleResourceName.value = find('role') || 'role';
    orgResourceName.value = find('organization') || 'organization';
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.application.errorLoadingConfig'));
  }
}

onMounted(async () => {
  setBreadcrumb('/applications', i18n.global.t('sideMenu.applications'));
  await Promise.all([loadApplication(), fetchManagedNames()]);
});
</script>
