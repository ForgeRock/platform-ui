<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="DiscoverAgentsModal"
    size="lg"
    no-close-on-backdrop
    title-class="h5"
    title-tag="h2"
    header-class="p-3"
    :title="$t('governance.agents.discovery.title')"
    @shown="initializeDiscoveryState"
    @hidden="reset">
    <!--
      Initial load: the config and per-source application fetches decide whether the
      source-selection step is shown at all, so the modal body spins until that settles.
    -->
    <FrSpinner
      v-if="isInitializing"
      class="py-4" />
    <!--
      Step 1: source selection as a radio list. The first configured dynamic source
      (e.g. PingOne Agent Privilege) is default-selected; Next advances to the selected
      source's configuration view. Skipped entirely when no dynamic source is configured
      (Ping AIC goes straight to step 2).
    -->
    <template v-else-if="!activeStep && showSourceSelect">
      <div class="mb-4">
        <p class="text-muted">
          {{ $t('governance.agents.discovery.selectSourceDescription') }}
        </p>
        <FrCardRadioInput
          v-for="option in sourceOptions"
          :key="option.value"
          class="mb-3"
          name="discoverySource"
          :radio-value="option.value"
          :disabled="option.disabled"
          v-model="selectedSource">
          <h3
            class="h5 mb-0"
            :aria-label="option.text">
            {{ option.text }}
            <span
              v-if="option.recommended"
              class="font-weight-normal text-muted">
              ({{ $t('common.recommended') }})
            </span>
          </h3>
        </FrCardRadioInput>
      </div>
    </template>

    <!--
      Step 2: the selected source's configuration view. For Ping AIC this is the
      application selector + discovery status; for dynamic sources it is the subtype
      status grid + API secret + owners.
    -->
    <template v-else-if="isPingAicSource">
      <div class="mb-4">
        <p class="text-muted">
          {{ $t('governance.agents.discovery.selectApplicationDescription') }}
        </p>
        <FrField
          v-model="selectedApplication"
          class="w-100"
          name="discoveryApplication"
          type="select"
          :label="$t('governance.agents.discovery.selectApplication')"
          :options="applicationOptions"
          :internal-search="false"
          @search-change="debouncedSearch"
          @open="!applicationOptions.length ? searchApplications('') : null" />
      </div>

      <template v-if="selectedApplication">
        <FrSpinner
          v-if="isLoadingMappings"
          class="py-4" />
        <template v-else>
          <template v-if="mappings.length">
            <p class="font-weight-bold mb-3">
              {{ $t('governance.agents.discovery.lastRunTitle') }}
            </p>
            <BTable
              :fields="tableFields"
              :items="mappings"
              responsive
              class="mb-0">
              <template #cell(objectType)="{ item }">
                {{ extractObjectType(item.id) }}
              </template>
              <template #cell(state)="{ item }">
                <BBadge :variant="statusVariant(item.state)">
                  {{ $t(`governance.agents.discovery.status.${item.state}`, item.state) }}
                </BBadge>
              </template>
              <template #cell(lastRun)="{ item }">
                {{ formatDate(item.results?.started) }}
              </template>
              <template #cell(created)="{ item }">
                {{ item.results?.progress?.target?.created ?? blankValueIndicator }}
              </template>
              <template #cell(updated)="{ item }">
                {{ item.results?.progress?.target?.updated ?? blankValueIndicator }}
              </template>
              <template #cell(total)="{ item }">
                {{ item.results?.progress?.target?.existing?.processed ?? blankValueIndicator }}
              </template>
            </BTable>
          </template>
          <FrAlert
            v-else
            variant="warning"
            :dismissible="false"
            :show-icon="true">
            {{ isTaskMissing
              ? $t('governance.agents.discovery.notConfigured')
              : $t('governance.agents.discovery.noResultsYet') }}
          </FrAlert>
        </template>
      </template>
    </template>

    <!--
      Step 2: the selected source's read-only configuration view. Configuration itself
      (API secret, owners, creating the applications) lives in the AgentSourceIntegration
      card/modal; this modal only shows subtype status and runs discovery.
    -->
    <template v-else-if="selectedSource">
      <FrSpinner
        v-if="isLoadingApplications"
        class="py-4" />
      <div v-else>
        <p class="text-muted mb-3">
          {{ $t('governance.agents.discovery.sourceSectionDescription', { source: selectedSourceLabel }) }}
        </p>
        <div class="row no-gutters mx-n1">
          <div
            v-for="row in sourceSubtypeRows"
            :key="row.key"
            class="col-6 p-1">
            <div class="fr-subtype-row d-flex align-items-center justify-content-between h-100 px-3 py-2 border rounded">
              <span class="text-truncate mr-2">{{ row.displayName }}</span>
              <span class="fr-subtype-status d-flex align-items-center justify-content-center flex-shrink-0">
                <FrIcon
                  v-if="row.configured"
                  icon-class="text-success"
                  name="check_circle" />
                <span
                  v-else
                  class="text-muted">
                  {{ blankValueIndicator }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #modal-footer>
      <div class="d-flex justify-content-between w-100">
        <div class="d-flex align-items-center">
          <BButton
            v-if="activeStep === 1 && showSourceSelect"
            variant="link"
            class="pl-0"
            @click="goToPreviousStep">
            <FrIcon
              icon-class="mr-2"
              name="arrow_back">
              {{ $t('common.previous') }}
            </FrIcon>
          </BButton>
          <BButton
            v-if="isPingAicSource && mappings.length"
            variant="outline-primary"
            :disabled="isLoadingMappings"
            @click="fetchDiscoveryStatus(selectedApplication)">
            <FrIcon
              icon-class="mr-2"
              name="refresh">
              {{ $t('common.refresh') }}
            </FrIcon>
          </BButton>
          <BButton
            variant="link"
            @click="hide">
            {{ $t('common.cancel') }}
          </BButton>
        </div>
        <div class="d-flex">
          <BButton
            v-if="!activeStep && showSourceSelect"
            variant="primary"
            :disabled="!selectedSource"
            @click="goToNextStep">
            {{ $t('common.next') }}
          </BButton>
          <FrButtonWithSpinner
            v-if="activeStep === 1 && !isPingAicSource"
            variant="outline-primary"
            :button-text="$t('governance.agents.discovery.runDiscovery')"
            :disabled="!hasConfiguredSubtypes || isSyncing"
            :show-spinner="isSyncing"
            :spinner-text="$t('common.running')"
            @click="syncSource" />
          <FrButtonWithSpinner
            v-if="activeStep === 1 && isPingAicSource"
            variant="primary"
            :button-text="$t('governance.agents.discovery.runDiscovery')"
            :disabled="!selectedApplication || isRunning || isAnyMappingActive"
            :show-spinner="isRunning"
            :spinner-text="$t('common.running')"
            @click="runDiscovery" />
        </div>
      </div>
    </template>
  </BModal>
</template>

<script setup>
import {
  ref, computed, watch, onMounted,
} from 'vue';
import { debounce } from 'lodash';
import dayjs from 'dayjs';
import {
  BBadge,
  BButton,
  BModal,
  BTable,
} from 'bootstrap-vue';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { syncApplication } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import {
  getAgentDiscovery,
  createAgentDiscovery,
  triggerAgentDiscovery,
} from '@forgerock/platform-shared/src/api/governance/AgentApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { useAgentConfig } from './utils/useAgentConfig';
import { useSourceApplications, buildSubtypeRows, getSourceLabel } from './AgentSourceIntegration/useSourceApplications';
import i18n from '@/i18n';

const { bvModal } = useBvModal();
const { agentApplicationProps, agentSources, loadConfig } = useAgentConfig();
const { sourceApplications, isLoadingApplications, fetchSourceApplications } = useSourceApplications();

const resourceTypeLabels = {
  guardrails: i18n.global.t('governance.agents.guardrails'),
  identity: i18n.global.t('governance.agents.identity'),
  knowledge: i18n.global.t('governance.agents.knowledge'),
  tools: i18n.global.t('governance.agents.tools'),
  toolCredentials: i18n.global.t('governance.agents.toolCredentials'),
  serviceAccount: i18n.global.t('governance.agents.serviceAccount'),
  connection: i18n.global.t('governance.agents.connection'),
};

const PING_AIC_SOURCE = 'pingAic';

const selectedSource = ref(null);
const selectedApplication = ref(null);
const selectedTemplateName = ref(null);
const applicationOptions = ref([]);
const mappings = ref([]);
const discoveryStatus = ref(null);
const isLoadingMappings = ref(false);
const isTaskMissing = ref(false);
const isRunning = ref(false);
const isSyncing = ref(false);
// True until open-time init (config load + prefetch + initial selection) settles.
const isInitializing = ref(false);
// 0 = source selection, 1 = source configuration. Step 0 is skipped when the
// backend defines no dynamic sources or none are configured (Ping AIC auto-selected).
const activeStep = ref(0);
// Configured applications per dynamic source key, fetched on open.
const applicationsBySource = ref({});

/**
 * Fetches configured applications for every dynamic source so the radio list
 * can disable not-yet-configured sources without a per-selection fetch.
 */
function prefetchSourceApplications() {
  const sourceKeys = agentSources.value ? Object.keys(agentSources.value) : [];
  return Promise.all(sourceKeys.map((source) => fetchSourceApplications(source).then((apps) => {
    applicationsBySource.value = { ...applicationsBySource.value, [source]: apps };
  })));
}

/** Picks the step-0 default: the first configured dynamic source; Ping AIC skips to step 1. */
function selectInitialSource() {
  const firstConfigured = Object.keys(agentSources.value || {}).find((source) => buildSubtypeRows(
    agentSources.value,
    source,
    applicationsBySource.value[source] || [],
  ).some((row) => row.configured));
  if (firstConfigured) {
    // Default-select the first configured source (marked recommended); the user
    // advances explicitly with Next.
    selectedSource.value = firstConfigured;
    return;
  }
  selectedSource.value = PING_AIC_SOURCE;
  activeStep.value = 1;
}

/**
 * Loads config, prefetches source applications, picks the initial source. Runs on
 * mount and every open so a reopen re-evaluates against newer configuration.
 */
function initializeDiscoveryState() {
  isInitializing.value = true;
  return loadConfig()
    .then(() => prefetchSourceApplications())
    .then(() => {
      selectInitialSource();
    })
    .finally(() => {
      isInitializing.value = false;
    });
}

onMounted(() => {
  initializeDiscoveryState();
});

// Unconfigured dynamic sources are disabled; a configured one is recommended.
// No configured sources means Ping AIC is implicit.
const sourceOptions = computed(() => {
  const dynamicSources = agentSources.value ? Object.keys(agentSources.value) : [];
  return [...dynamicSources, PING_AIC_SOURCE].map((source) => {
    if (PING_AIC_SOURCE === source) {
      return { value: source, text: i18n.global.t('governance.agents.discovery.pingAicSource') };
    }
    const rows = buildSubtypeRows(agentSources.value, source, applicationsBySource.value[source] || []);
    const isConfigured = rows.some((row) => row.configured);
    return {
      value: source,
      text: isConfigured
        ? getSourceLabel(source)
        : `${getSourceLabel(source)} — ${i18n.global.t('governance.agents.discovery.sourceDisabledHint')}`,
      disabled: !isConfigured,
      recommended: isConfigured,
    };
  });
});

const showSourceSelect = computed(() => Boolean(agentSources.value));

const isPingAicSource = computed(() => !agentSources.value || selectedSource.value === PING_AIC_SOURCE);

const tableFields = [
  { key: 'objectType', label: i18n.global.t('governance.agents.discovery.columns.objectType'), class: 'w-175px' },
  { key: 'lastRun', label: i18n.global.t('governance.agents.discovery.columns.lastRun'), class: 'w-200px' },
  { key: 'created', label: i18n.global.t('governance.agents.discovery.columns.created'), class: 'w-80px' },
  { key: 'updated', label: i18n.global.t('governance.agents.discovery.columns.updated'), class: 'w-80px' },
  { key: 'total', label: i18n.global.t('governance.agents.discovery.columns.total'), class: 'w-80px' },
  { key: 'state', label: i18n.global.t('governance.agents.discovery.columns.status') },
];

const statusVariantMap = {
  pending: 'secondary',
  active: 'warning',
  complete: 'success',
  failed: 'danger',
};

const isAnyMappingActive = computed(() => discoveryStatus.value === 'active');

// The display label for the selected source, as shown in the source radio list
// (e.g. 'privilege' -> 'PingOne Agent Privilege'), used in the subtypes description text.
const selectedSourceLabel = computed(
  () => sourceOptions.value.find((option) => option.value === selectedSource.value)?.text || selectedSource.value,
);

/** One row per subtype of the selected source, with its configured state. */
const sourceSubtypeRows = computed(() => buildSubtypeRows(
  agentSources.value,
  selectedSource.value,
  sourceApplications.value,
));

// Sync is only meaningful once at least one subtype has an application to sync from.
const hasConfiguredSubtypes = computed(() => sourceSubtypeRows.value.some((row) => row.configured));

function statusVariant(state) {
  return statusVariantMap[state] || 'secondary';
}

/** Lowercase objectType → label map for the selected template ('default' fallback). */
function buildObjectTypeLabelMap() {
  const templateProps = agentApplicationProps.value[selectedTemplateName.value]
    || agentApplicationProps.value.default
    || {};
  const map = {};
  Object.entries(templateProps).forEach(([resourceKey, { objectType }]) => {
    if (objectType) map[objectType.toLowerCase()] = resourceTypeLabels[resourceKey] || objectType;
  });
  return map;
}

/**
 * Extracts an objectType label from a mapping ID's connector segment by
 * longest-match; user-targeting mappings are always the agent itself.
 */
function extractObjectType(mappingId) {
  if (!mappingId) return blankValueIndicator;
  const segments = mappingId.split('_');
  if (segments[segments.length - 1] === 'user') {
    return i18n.global.t('governance.agents.agentLabel');
  }
  // The connector segment is everything before the first underscore
  const connectorSegment = segments[0].toLowerCase();
  const labelMap = buildObjectTypeLabelMap();
  // Longest-match wins to distinguish e.g. "agenttool" vs "agenttoolcredentials"
  const match = Object.keys(labelMap)
    .filter((key) => connectorSegment.includes(key))
    .sort((a, b) => b.length - a.length)[0];
  return match ? labelMap[match] : mappingId;
}

function formatDate(isoString) {
  if (!isoString) return blankValueIndicator;
  return dayjs(isoString).format('MMM D, YYYY h:mm A');
}

async function searchApplications(query) {
  try {
    const { data } = await getResource('application', { queryString: query, authoritative: false });
    applicationOptions.value = (data?.result || []).map((app) => ({
      value: app.id,
      text: app.name,
      subtitle: getApplicationDisplayName(app),
      icon: getApplicationLogo(app),
      templateName: app.templateName,
    }));
  } catch {
    applicationOptions.value = [];
  }
}

const debouncedSearch = debounce(searchApplications, 300);

async function fetchDiscoveryStatus(applicationId) {
  isLoadingMappings.value = true;
  isTaskMissing.value = false;
  mappings.value = [];
  try {
    const { data } = await getAgentDiscovery(applicationId);
    mappings.value = data?.mappings || [];
    discoveryStatus.value = data?.status || null;
  } catch (err) {
    if (err?.response?.status === 404) {
      isTaskMissing.value = true;
    } else {
      showErrorMessage(err, i18n.global.t('governance.agents.discovery.errors.loadError'));
    }
  } finally {
    isLoadingMappings.value = false;
  }
}

watch(selectedSource, () => {
  // Switching sources starts a fresh selection; app-level state is only
  // meaningful for Ping AIC.
  selectedApplication.value = null;
  selectedTemplateName.value = null;
  mappings.value = [];
  discoveryStatus.value = null;
  isTaskMissing.value = false;
});

/** Advances to step 1; non-Ping-AIC sources fetch their applications here. */
function goToNextStep() {
  if (!selectedSource.value) return;
  activeStep.value = 1;
  if (selectedSource.value !== PING_AIC_SOURCE) {
    fetchSourceApplications(selectedSource.value);
  }
}

/** Back to step 0, keeping the radio selection. */
function goToPreviousStep() {
  activeStep.value = 0;
}

watch(selectedApplication, (appId) => {
  if (!appId) return;
  const option = applicationOptions.value.find((o) => o.value === appId);
  selectedTemplateName.value = option?.templateName || null;
  fetchDiscoveryStatus(appId);
});

async function runDiscovery() {
  if (!selectedApplication.value) return;
  isRunning.value = true;
  try {
    if (isTaskMissing.value) {
      await createAgentDiscovery(selectedApplication.value);
    } else {
      await triggerAgentDiscovery(selectedApplication.value, { preserveDate: false });
    }
    displayNotification('success', i18n.global.t('governance.agents.discovery.errors.runSuccess'));
    await fetchDiscoveryStatus(selectedApplication.value);
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.agents.discovery.errors.runError'));
  } finally {
    isRunning.value = false;
  }
}

/**
 * POSTs _action=sync to each configured subtype's application (one per subtype,
 * extras ignored), concurrently.
 */
async function syncSource() {
  if (!hasConfiguredSubtypes.value) return;
  isSyncing.value = true;
  try {
    const configuredRows = sourceSubtypeRows.value.filter((row) => row.configured);

    // One application per subtype (the first match wins); ignore any extras.
    const applicationIds = configuredRows.map((row) => sourceApplications.value
      .find((app) => app?.ingestion?.connector?.subtype === row.key)?.id)
      .filter(Boolean);

    const results = await Promise.allSettled(
      applicationIds.map((id) => syncApplication(id).catch((err) => {
        showErrorMessage(err, i18n.global.t('governance.agents.discovery.errors.syncError'));
        throw err;
      })),
    );

    if (applicationIds.length && results.every(({ status }) => status === 'fulfilled')) {
      displayNotification('success', i18n.global.t('governance.agents.discovery.errors.syncSuccess'));
    }
  } finally {
    isSyncing.value = false;
  }
}

function hide() {
  bvModal.value.hide('DiscoverAgentsModal');
}

function reset() {
  selectedSource.value = null;
  selectedApplication.value = null;
  selectedTemplateName.value = null;
  applicationOptions.value = [];
  mappings.value = [];
  discoveryStatus.value = null;
  isLoadingMappings.value = false;
  isTaskMissing.value = false;
  isRunning.value = false;
  isSyncing.value = false;
  isInitializing.value = false;
  activeStep.value = 0;
  applicationsBySource.value = {};
}
</script>

<style lang="scss" scoped>
.fr-subtype-row {
  background-color: $card-bg;
}

// Fixed width so icon glyphs and '--' placeholders align.
.fr-subtype-status {
  width: 24px;
}
</style>
