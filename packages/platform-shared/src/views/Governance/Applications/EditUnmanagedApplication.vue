<!-- Copyright 2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
              :is-saving="isSaving"
              @update:model="updateModel"
              @update:glossary-model="updateGlossaryModel"
              @update:glossary-create-flag="setGlossaryFlag"
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
import {
  saveGlossaryAttributesByAppId,
  updateGlossaryAttributesByAppId,
} from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrApplicationDetailsPanel from '@forgerock/platform-shared/src/components/governance/Applications/ApplicationDetailsPanel';
import FrAccounts from '@forgerock/platform-shared/src/views/Governance/Accounts/Accounts';
import FrUnmanagedApplicationImport from '@forgerock/platform-shared/src/components/governance/Applications/UnmanagedApplicationImport';
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

const tabs = ['details', 'accounts', 'import'];

const router = useRouter();
const { setBreadcrumb } = useBreadcrumb();

const applicationDetails = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isDeleting = ref(false);
const isGlossaryCreate = ref(false);
const glossaryData = ref(null);
const loadError = ref('');
const activeTabIndex = ref(Math.max(0, tabs.indexOf(props.tab)));

const logoSource = computed(() => applicationDetails.value?.icon || resolveImage('custom.svg'));

function updateModel({ value, path }) {
  if (applicationDetails.value) {
    applicationDetails.value = { ...applicationDetails.value, [path]: value };
  }
}

function updateGlossaryModel(data) {
  glossaryData.value = data ?? {};
}

function setGlossaryFlag(flag) {
  isGlossaryCreate.value = flag;
}

async function saveApp() {
  isSaving.value = true;
  try {
    const { metadata, ...appPayload } = applicationDetails.value;
    const savePromises = [updateApplication(props.applicationId, appPayload)];
    if (glossaryData.value !== null) {
      const glossarySave = isGlossaryCreate.value
        ? saveGlossaryAttributesByAppId(props.applicationId, glossaryData.value).then((r) => { isGlossaryCreate.value = false; return r; })
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

async function loadApplication() {
  try {
    const { data } = await getApplication(props.applicationId, { disconnected: true });
    applicationDetails.value = data;
  } catch {
    // Temporary fallback
    if (props.baseApplication) {
      applicationDetails.value = props.baseApplication;
    } else {
      loadError.value = i18n.global.t('governance.application.errorRetrievingApplication');
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  setBreadcrumb('/applications', i18n.global.t('sideMenu.applications'));
  await loadApplication();
});
</script>
