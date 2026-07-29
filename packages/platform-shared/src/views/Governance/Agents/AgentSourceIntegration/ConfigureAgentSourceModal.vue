<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="ConfigureAgentSourceModal"
    size="lg"
    no-close-on-backdrop
    title-class="h5"
    title-tag="h2"
    header-class="p-3"
    :title="modalTitle"
    @shown="onShown"
    @hidden="reset">
    <FrSpinner
      v-if="isLoadingApplications"
      class="py-4" />
    <div v-else>
      <p class="text-muted mb-3">
        {{ $t('governance.agents.integration.connectionInstructions', { source: sourceLabel }) }}
      </p>
      <BRow>
        <BCol
          v-for="field in CONNECTION_FIELDS"
          :key="field.key"
          lg="6">
          <!--
            Static labels (non-floating) so native placeholders render: the apiSecret
            field shows a masked placeholder when a stored credential exists, indicating
            its presence without holding any value.
          -->
          <FrField
            v-model="connectionValues[field.key]"
            class="w-100 mb-3"
            :floating-label="false"
            :name="`agentSourceConnection-${field.key}`"
            :type="field.type"
            :label="$t(`governance.agents.integration.connection.${field.key}Label`)"
            :description="$t(`governance.agents.integration.connection.${field.key}Description`)"
            :placeholder="field.key === 'apiSecret' && hasStoredSecret ? storedSecretPlaceholder : undefined" />
        </BCol>
      </BRow>

      <div
        v-if="showOwnerInput"
        class="mt-4">
        <FrRelationshipEdit
          :relationship-property="relationshipProperty"
          :index="0"
          :label="$t('governance.agents.integration.ownersLabel')"
          @setValue="applicationOwners = $event" />
      </div>
    </div>

    <template #modal-footer>
      <BButton
        variant="link"
        @click="hide">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        variant="primary"
        :button-text="$t('governance.agents.integration.saveConfiguration')"
        :disabled="!isConfigureEnabled || isConfiguring"
        :show-spinner="isConfiguring"
        :spinner-text="$t('common.saving')"
        @click="configureSource" />
    </template>
  </BModal>
</template>

<script setup>
import {
  ref, computed, reactive,
} from 'vue';
import {
  BButton, BCol, BModal, BRow,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import {
  createUnmanagedApplication, saveApplicationTask, updateApplication, getApplication,
} from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import {
  buildAgentApplicationPayload, buildAgentUpdatePayload, AGENT_CLASSIFICATION_TASK, IS_AGENT_SECRET_REQUIRED,
} from '../utils/agentUtility';
import { useAgentConfig } from '../utils/useAgentConfig';
import {
  useSourceApplications, buildSubtypeRows, getSourceLabel,
} from './useSourceApplications';
import store from '@/store';
import i18n from '@/i18n';

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['configured']);

const { bvModal } = useBvModal();
const { agentSources, agentTemplateSourceArrays, loadConfig } = useAgentConfig();
const { sourceApplications, isLoadingApplications, fetchSourceApplications } = useSourceApplications();

// Optional ingestion.connector.connection override fields; blanks are omitted
// (tenant default applies server-side). apiSecret is write-only — see the design doc.
const CONNECTION_FIELDS = [
  { key: 'controllerUrl', type: 'string' },
  { key: 'envId', type: 'string' },
  { key: 'userId', type: 'string' },
  { key: 'apiKey', type: 'password' },
  { key: 'namespace', type: 'string', defaultValue: 'default' },
  { key: 'apiSecret', type: 'password' },
];

const connectionValues = reactive(
  Object.fromEntries(CONNECTION_FIELDS.map(({ key, defaultValue }) => [key, defaultValue || ''])),
);

// Per-app derived secret: refs, echoed back on update so stored credentials are
// not purged. Plaintext is write-only — the field shows a placeholder when stored.
const storedSecretRefs = ref({});
const storedSecretPlaceholder = '••••••••';

// True when at least one configured application has a stored secret credential.
const hasStoredSecret = computed(() => Object.keys(storedSecretRefs.value).length > 0);

const relationshipProperty = ref(null);
const applicationOwners = ref([]);
const isConfiguring = ref(false);

const sourceLabel = computed(() => getSourceLabel(props.source));

const modalTitle = computed(() => i18n.global.t('governance.agents.integration.configureTitle', { source: sourceLabel.value }));

const subtypeRows = computed(() => buildSubtypeRows(
  agentSources.value,
  props.source,
  sourceApplications.value,
));

// The owner selector is only needed when configuring new subtypes; once every
// subtype of the selected source is already configured, a secret alone suffices.
const areAllSubtypesConfigured = computed(
  () => subtypeRows.value.length > 0 && subtypeRows.value.every((row) => row.configured),
);

const showOwnerInput = computed(() => Boolean(relationshipProperty.value) && !areAllSubtypesConfigured.value);

// Save needs a satisfied secret requirement (IS_AGENT_SECRET_REQUIRED) and owners
// while subtypes remain unconfigured.
const isConfigureEnabled = computed(() => {
  if (IS_AGENT_SECRET_REQUIRED && !connectionValues.apiSecret && !hasStoredSecret.value) return false;
  return areAllSubtypesConfigured.value || applicationOwners.value.length > 0;
});

/** Loads the managed/application schema's 'owners' relationship property for FrRelationshipEdit. */
async function loadOwnerRelationshipProperty() {
  try {
    const { data } = await getConfig('managed');
    const managedObject = (data?.objects || [])
      .find((object) => (!store.state.isFraas || object.name.startsWith(store.state.realm)) && object.name.endsWith('application'));
    const ownersProperty = managedObject?.schema?.properties?.owners;
    if (ownersProperty) {
      relationshipProperty.value = {
        ...ownersProperty,
        description: i18n.global.t('governance.agents.integration.ownersDescription'),
        value: [],
        key: 'owners',
        options: [],
        validation: 'required',
      };
    }
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.agents.integration.errors.loadError'));
  }
}

/**
 * Hydrates the connection form from an already-configured application's stored
 * connection block; captures per-app derived apiSecretRefs for the update echo.
 */
function hydrateFromExistingApplications() {
  const existing = sourceApplications.value[0];
  const connection = existing?.ingestion?.connector?.connection || {};
  CONNECTION_FIELDS.forEach(({ key }) => {
    const value = connection[key];
    if (typeof value === 'string' && value !== '') {
      connectionValues[key] = value;
    }
  });
  const refs = {};
  sourceApplications.value.forEach((app) => {
    const secretRef = app?.ingestion?.connector?.connection?.apiSecretRef;
    if (typeof secretRef === 'string' && secretRef.startsWith('secret:')) {
      refs[app.id] = secretRef;
    }
  });
  storedSecretRefs.value = refs;
}

function hide() {
  bvModal.value.hide('ConfigureAgentSourceModal');
}

function reset() {
  CONNECTION_FIELDS.forEach(({ key, defaultValue }) => {
    connectionValues[key] = defaultValue || '';
  });
  storedSecretRefs.value = {};
  applicationOwners.value = [];
  isConfiguring.value = false;
}

function onShown() {
  reset();
  loadConfig();
  loadOwnerRelationshipProperty();
  fetchSourceApplications(props.source).then(() => {
    hydrateFromExistingApplications();
  });
}

/**
 * Creates apps for unconfigured subtypes, updates configured ones (typed secret
 * rotates the credential; derived refs echo back). Handshakes run server-side.
 */
async function configureSource() {
  if (!isConfigureEnabled.value) return;
  isConfiguring.value = true;
  try {
    const ownerIds = applicationOwners.value.map(({ _ref }) => _ref.split('/').slice(2).join('/'));
    const unconfigured = subtypeRows.value.filter((row) => !row.configured);

    // One create (+ its classification task) per unconfigured subtype while different
    // subtypes run concurrently with each other.
    const createResults = await Promise.allSettled(unconfigured.map(async (row) => {
      const payload = buildAgentApplicationPayload(
        props.source,
        row.key,
        agentSources.value[props.source][row.key],
        ownerIds,
        connectionValues,
        agentTemplateSourceArrays.value,
      );

      let application;
      try {
        ({ data: application } = await createUnmanagedApplication(payload));
      } catch (err) {
        showErrorMessage(err, i18n.global.t('governance.agents.integration.errors.createAppError', { name: row.displayName }));
        throw err;
      }

      try {
        await saveApplicationTask(application.id, AGENT_CLASSIFICATION_TASK, { autoRun: false });
      } catch (err) {
        showErrorMessage(err, i18n.global.t('governance.agents.integration.errors.createTaskError', { name: row.displayName }));
        throw err;
      }
    }));

    // Each app's FULL record is fetched first: the update is a full-record replace
    // whose validation needs fields the list fetch projects out.
    const updateResults = await Promise.allSettled(sourceApplications.value.map(async (existingApp) => {
      try {
        const { data: fullApp } = await getApplication(existingApp.id, { disconnected: true });
        await updateApplication(existingApp.id, buildAgentUpdatePayload(fullApp, connectionValues));
      } catch (err) {
        showErrorMessage(err, i18n.global.t('governance.agents.integration.errors.updateAppError', { name: existingApp.name }));
        throw err;
      }
    }));

    const results = [...createResults, ...updateResults];
    if (results.length && results.every(({ status }) => status === 'fulfilled')) {
      displayNotification('success', i18n.global.t('governance.agents.integration.errors.configureSuccess'));
      emit('configured');
      hide();
    }
    // Re-fetch so the subtype status in the card reflects the newly created applications.
    await fetchSourceApplications(props.source);
  } finally {
    isConfiguring.value = false;
  }
}
</script>
