<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <FrField
      v-model="form.name"
      class="mb-4"
      name="objectTypeName"
      type="string"
      :label="$t('governance.applications.edit.objectTypesTab.details.name')"
      disabled />
    <FrField
      v-model="form.id"
      class="mb-4"
      name="objectTypeId"
      type="string"
      :label="$t('governance.applications.edit.objectTypesTab.details.id')"
      disabled />

    <FrField
      v-model="form.displayProperty"
      class="mb-4"
      name="displayProperty"
      type="select"
      :label="$t('governance.applications.edit.objectTypesTab.details.displayProperty')"
      :description="$t('governance.applications.edit.objectTypesTab.details.displayPropertyDescription')"
      :options="propertyOptions"
      :placeholder="$t('governance.applications.edit.objectTypesTab.details.noProperties')"
      :disabled="!propertyOptions.length" />
    <p
      v-if="!propertyOptions.length"
      class="text-muted">
      {{ $t('governance.applications.edit.objectTypesTab.details.noProperties') }}
    </p>

    <BButton
      data-testid="details-advanced-toggle"
      class="pl-0 mb-2 text-left"
      variant="link"
      :aria-expanded="showAdvanced ? 'true' : 'false'"
      aria-controls="object-type-details-advanced"
      @click="showAdvanced = !showAdvanced">
      {{ showAdvanced ? $t('common.hideAdvanced') : $t('common.showAdvanced') }}
    </BButton>

    <BCollapse
      id="object-type-details-advanced"
      :visible="showAdvanced">
      <FrField
        v-if="isResource"
        v-model="form.isNHI"
        class="mb-4"
        name="isNHI"
        type="checkbox"
        :label="$t('governance.applications.edit.objectTypesTab.details.nonHumanIdentity')"
        :description="$t('governance.applications.edit.objectTypesTab.details.nonHumanIdentityDescription')" />

      <template v-if="isAccount">
        <FrField
          v-model="form.aiAgents"
          class="mb-4"
          name="aiAgents"
          type="checkbox"
          :label="$t('governance.applications.edit.objectTypesTab.details.aiAgents')"
          :description="$t('governance.applications.edit.objectTypesTab.details.aiAgentsDescription')"
          :disabled="agentControlsDisabled" />
        <FrField
          v-if="form.aiAgents"
          v-model="form.agentSource"
          class="mb-4"
          name="agentSource"
          type="select"
          :label="$t('governance.applications.edit.objectTypesTab.details.agentSource')"
          :description="agentSourceDescription"
          :options="agentSourceOptions"
          :placeholder="$t('governance.applications.edit.objectTypesTab.details.noAgentSources')"
          :disabled="agentControlsDisabled || !form.aiAgents" />
      </template>
    </BCollapse>

    <!-- Agent configuration status stays outside the collapsed section so it is
      announced and visible regardless of the advanced controls' state. -->
    <div
      v-if="isConfigLoading"
      class="text-muted mb-3"
      role="status"
      data-testid="agent-config-loading">
      {{ $t('governance.applications.edit.objectTypesTab.details.agentConfigLoading') }}
    </div>
    <div
      v-else-if="agentConfigError"
      class="text-danger mb-3"
      role="alert"
      data-testid="agent-config-error">
      {{ $t('governance.applications.edit.objectTypesTab.details.agentConfigError') }}
    </div>
    <div
      v-else-if="isAccount && !agentSourceOptions.length"
      class="text-muted mb-3"
      role="status"
      data-testid="agent-config-empty">
      {{ $t('governance.applications.edit.objectTypesTab.details.noAgentSources') }}
    </div>

    <div class="d-flex justify-content-end">
      <FrButtonWithSpinner
        data-testid="details-save"
        variant="primary"
        :button-text="$t('common.save')"
        :spinner-text="$t('common.saving')"
        :show-spinner="isSaving"
        :disabled="isSaving"
        @click="saveHandler" />
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { BButton, BCollapse } from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getAgentConfig } from '@forgerock/platform-shared/src/api/governance/AgentConfigApi';
import i18n from '@/i18n';

// DetailsForm mounts and unmounts with Bootstrap-vue's lazy tabs, so the agent
// configuration lives at module scope: the options are identical for the whole
// session, and concurrent or repeated mounts share a single request instead of
// re-fetching on every tab revisit.
const agentConfigOptions = ref(null);
const isConfigLoading = ref(false);
const agentConfigError = ref(false);
let agentConfigRequest = null;

/**
 * Translates an agent template id using the same keys as the AI Agents list
 * view (governance.agents.tabs.<id with dots as dashes>). Template ids are
 * server-provided, so a key can be missing from the locale files; the Custom
 * label is used in that case — matching how the Agents list view routes
 * unrecognized templates to its Custom tab.
 *
 * te() cannot be used for the existence check: it only tests the exact
 * active locale and never consults the fallback chain, so with an en-US
 * locale and en-only messages it returns false for every key. Comparing
 * t(key) against the key instead — missing keys render as the key path —
 * uses the exact fallback chain the label itself renders with.
 *
 * @param {String} templateId Raw template id from the agent configuration (e.g. aws.bedrock)
 * @returns {String} Translated template name, or the Custom label when untranslated
 */
function agentTemplateLabel(templateId) {
  const key = `governance.agents.tabs.${String(templateId).replace(/\./g, '-')}`;
  const translated = i18n.global.t(key);
  return translated === key
    ? i18n.global.t('governance.agents.tabs.custom')
    : translated;
}

/**
 * Normalizes the agent configuration response into a unique list of template ids.
 *
 * @param {Object} response Raw getAgentConfig API response
 * @returns {Array} List of unique, non-empty template id strings
 */
function normalizeAgentOptions(response) {
  const templates = response?.data?.templates;
  if (!Array.isArray(templates)) return [];
  return templates
    .map((template) => (typeof template?.id === 'string' ? template.id.trim() : ''))
    .filter((id, index, ids) => id.length > 0 && ids.indexOf(id) === index);
}

/**
 * Fetches the agent configuration options, deduplicating the request so
 * concurrent and repeated mounts share one fetch. Options persist for the
 * session once loaded; a failed fetch is retried by the next call.
 *
 * @returns {Promise} Resolves when the configuration is available; rejects on failure.
 */
function fetchAgentConfig() {
  if (agentConfigOptions.value !== null) {
    return Promise.resolve();
  }
  if (agentConfigRequest !== null) {
    return agentConfigRequest;
  }

  isConfigLoading.value = true;
  agentConfigRequest = getAgentConfig()
    .then((response) => normalizeAgentOptions(response))
    .then((options) => {
      agentConfigOptions.value = options;
      isConfigLoading.value = false;
      agentConfigRequest = null;
    }, (error) => {
      agentConfigError.value = true;
      isConfigLoading.value = false;
      agentConfigRequest = null;
      throw error;
    });
  return agentConfigRequest;
}

/**
 * Clears cached options and in-flight request state. Intended for tests.
 */
export function clearAgentConfig() {
  agentConfigOptions.value = null;
  isConfigLoading.value = false;
  agentConfigError.value = false;
  agentConfigRequest = null;
}
</script>

<script setup>
const props = defineProps({
  objectType: {
    type: Object,
    default: () => ({}),
  },
  application: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save']);

const form = ref({
  name: '',
  id: '',
  displayProperty: '',
  isNHI: false,
  aiAgents: false,
  agentSource: '',
});
const currentAccountObjectTypeId = ref('');
const showAdvanced = ref(false);

const isResource = computed(() => props.objectType?.type === 'resource');
const isAccount = computed(() => props.objectType?.type === 'account');
const properties = computed(() => {
  const value = props.objectType?.properties;
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
});
const propertyOptions = computed(() => Object.entries(properties.value).map(([value, property]) => ({
  value,
  text: property?.displayName || value,
})));
const agentSourceOptions = computed(() => (agentConfigOptions.value || []).map((value) => ({
  value,
  // Reuse the same translated template names the AI Agents list view uses
  // (governance.agents.tabs.<id with dots as dashes>). Unlike Agents.vue,
  // template ids here come from the server, so a key may not exist in
  // en.json — check with te() and fall back to the Custom label, because
  // t() with a missing key renders the whole key path, not the id.
  text: agentTemplateLabel(value),
})));
const hasAgentSources = computed(() => agentSourceOptions.value.length > 0);
const agentControlsDisabled = computed(() => isConfigLoading.value || agentConfigError.value || !hasAgentSources.value);
const agentSourceDescription = computed(() => {
  if (!hasAgentSources.value) return i18n.global.t('governance.applications.edit.objectTypesTab.details.noAgentSources');
  return i18n.global.t('governance.applications.edit.objectTypesTab.details.agentSourceDescription');
});

function resetForm() {
  const objectType = props.objectType || {};
  const objectProperties = objectType.properties && typeof objectType.properties === 'object'
    ? objectType.properties
    : {};
  const displayProperty = Object.entries(objectProperties).find(([, property]) => property?.isDisplay === true)?.[0] || '';
  const applicationSource = props.application?.aiAgentSource;
  form.value = {
    name: objectType.name || '',
    id: objectType.id || '',
    displayProperty,
    isNHI: objectType.isNHI === true,
    aiAgents: objectType.type === 'account' && typeof applicationSource === 'string' && applicationSource.length > 0,
    agentSource: typeof applicationSource === 'string' && applicationSource.length > 0 ? applicationSource : '',
  };
  currentAccountObjectTypeId.value = objectType.type === 'account' ? objectType.id || '' : '';
  agentConfigError.value = false;
}

function synchronizeApplicationSource() {
  if (!isAccount.value) return;
  const source = props.application?.aiAgentSource;
  const hasSource = typeof source === 'string' && source.length > 0;

  // Until configuration is available, do not stage a source from the parent.
  // loadAgentConfig() will synchronize it again after a successful response.
  if (agentConfigOptions.value === null) {
    form.value.aiAgents = false;
    form.value.agentSource = '';
    return;
  }

  if (hasSource && agentConfigOptions.value.includes(source)) {
    form.value.aiAgents = true;
    form.value.agentSource = source;
  } else {
    form.value.aiAgents = false;
    form.value.agentSource = '';
  }
}

async function loadAgentConfig() {
  if (!isAccount.value) return;
  agentConfigError.value = false;
  try {
    await fetchAgentConfig();
  } catch {
    // Failure state is surfaced through the shared agentConfigError ref; the
    // persisted source is deliberately left intact and not re-synchronized.
    return;
  }
  synchronizeApplicationSource();
}

function saveHandler() {
  const objectType = props.objectType || {};
  const objectTypePayload = { ...objectType };
  const objectProperties = objectType.properties;
  if (objectProperties && typeof objectProperties === 'object' && !Array.isArray(objectProperties)) {
    objectTypePayload.properties = Object.fromEntries(Object.entries(objectProperties).map(([key, property]) => ([
      key,
      { ...property, isDisplay: form.value.displayProperty === key },
    ])));
  }
  if (isResource.value) objectTypePayload.isNHI = form.value.isNHI === true;

  const { metadata, ...applicationPayload } = props.application || {};
  if (isAccount.value) {
    const selectedSource = form.value.agentSource;
    const hasExistingSource = typeof applicationPayload.aiAgentSource === 'string'
      && applicationPayload.aiAgentSource.length > 0;
    const hasLoadedOptions = agentConfigOptions.value !== null;
    const hasValidSelectedSource = form.value.aiAgents
      && typeof selectedSource === 'string'
      && selectedSource.length > 0
      && agentSourceOptions.value.some(({ value }) => value === selectedSource);

    if (hasValidSelectedSource) {
      applicationPayload.aiAgentSource = selectedSource;
    } else if (hasExistingSource && (!hasLoadedOptions || !agentSourceOptions.value.length)) {
      // A failed or empty configuration response is not proof that a persisted
      // source should be cleared. Keep it intact because the source control is
      // unavailable and cannot express an intentional clear in this state.
    } else {
      delete applicationPayload.aiAgentSource;
    }
  }
  emit('save', { objectType: objectTypePayload, application: applicationPayload });
}

// Bootstrap-vue's lazy tabs keep Details mounted (v-show) once visited, so a
// sibling tab (e.g. Properties) can reassign the shared object-type reference
// without the administrator ever switching object types. Keying on identity
// rather than deep-watching the whole object ensures Details only resets on
// an actual object-type switch and never discards an in-progress, unsaved
// selection just because the loaded object mutated for an unrelated reason.
watch(() => props.objectType?.id, (newId, oldId) => {
  if (newId === oldId) return;
  resetForm();
  loadAgentConfig();
}, { immediate: true });

watch(() => props.application, () => {
  if (props.objectType?.type === 'account' && currentAccountObjectTypeId.value === props.objectType.id) {
    synchronizeApplicationSource();
  }
}, { deep: true });
</script>
