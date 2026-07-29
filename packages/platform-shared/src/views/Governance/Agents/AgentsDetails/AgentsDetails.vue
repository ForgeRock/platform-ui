<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid>
    <FrSpinner
      v-if="isLoading && Object.keys(agent).length === 0"
      class="py-5" />
    <div v-else>
      <div class="mt-5 mb-3 d-flex">
        <BMedia
          no-body
          class="border">
          <img
            class="d-flex justify-content-center align-items-center m-4"
            width="48"
            height="48"
            :src="agent?.application?.icon"
            :onerror="onImageError">
        </BMedia>
        <FrHeader
          class="ml-3"
          :title="agent?.displayName"
          :subtitle="agent?.application?.name">
          <template #additionalContent>
            <BBadge
              v-if="agentModel"
              class="mr-2 py-2"
              pill
              variant="info">
              {{ $t('governance.agents.mappingKeys.model') }}: {{ agentModel }}
            </BBadge>
            <BBadge
              v-if="agentStatus"
              class="mr-2 py-2"
              pill
              variant="info">
              {{ $t('governance.agents.mappingKeys.status') }}: {{ agentStatus }}
            </BBadge>
          </template>
        </FrHeader>
      </div>
      <BTabs
        v-if="tabsReady"
        content-class="mt-3"
        nav-class="fr-tabs"
        v-model="tabIndex"
        @activate-tab="tabActivated">
        <BTab
          :title="$t('governance.agents.details.tabs.details')"
          key="details"
          :active="tabIndex === 0"
          lazy>
          <FrDetailsTab
            :agent="agent"
            :governance-dev-enabled="governanceDevEnabled"
            :is-end-user="props.isEndUser"
            :read-only="readOnly" />
        </BTab>
        <BTab
          key="access"
          lazy>
          <template #title>
            {{ $t('common.access') }}
            <BBadge
              v-if="accessGrantCount"
              class="ml-1"
              pill
              variant="info">
              {{ accessGrantCount }}
            </BBadge>
          </template>
          <FrAccessTab
            :agent="agent"
            :agent-id="id"
            :is-admin="!props.isEndUser && !props.isLcm"
            :is-end-user="props.isEndUser"
            :require-request-justification="requireRequestJustification" />
        </BTab>
        <BTab
          v-for="group in resourceGroups"
          :key="group.key"
          lazy>
          <template #title>
            {{ group.label }}
            <BBadge
              v-if="group.count"
              class="ml-1"
              pill
              variant="info">
              {{ group.count }}
            </BBadge>
          </template>
          <div class="row">
            <div
              v-for="resource in group.resources"
              :key="resource.type"
              class="col-12 mb-4">
              <FrResourceTab
                :agent-id="id"
                :resource-type="resource.type"
                :resource-label="resource.label"
                :name-property="resource.nameProperty"
                :description-property="resource.descriptionProperty"
                :icon="resource.icon"
                :icon-color="resource.iconColor" />
            </div>
          </div>
        </BTab>
        <BTab
          v-if="!props.isEndUser"
          :title="$t('governance.agents.details.tabs.activity')"
          key="activity"
          lazy>
          <FrActivity
            :activity-url="`governance/agent/${encodeURIComponent(id)}/activity`"
            :parent-resource-name="$t('common.agent')" />
        </BTab>
      </BTabs>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BBadge,
  BContainer,
  BMedia,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getAgentById, getAgentGrants } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { getIgaAccessRequest } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrActivity from '@forgerock/platform-shared/src/views/Governance/Activity/Activity';
import FrDetailsTab from './DetailsTab';
import FrResourceTab from './ResourceTab';
import FrAccessTab from './AccessTab';
import agentConstants from '../utils/agentConstants';
import { useAgentConfig, resolveAgentIcon, resolveTemplateId } from '../utils/useAgentConfig';
import { getAgentDisplayName, getMappingSystemKey } from '../utils/agentUtility';
import i18n from '@/i18n';

const props = defineProps({
  readOnly: {
    type: Boolean,
    default: true,
  },
  isEndUser: {
    type: Boolean,
    default: true,
  },
  isLcm: {
    type: Boolean,
    default: false,
  },
});
const store = useStore();
const governanceDevEnabled = computed(() => props.isLcm && (store?.state?.SharedStore?.governanceDevEnabled ?? false));
const { setBreadcrumb } = useBreadcrumb();
const route = useRoute();
const {
  agentApplicationProps, agentMappings, agentTemplateSources, agentTemplateIcons, loadConfig,
} = useAgentConfig();
const tabIndex = ref(0);
const agent = ref({});
const isLoading = ref(true);
const tabsReady = ref(false);
const agentResourceProps = ref([]);
const resourceGroups = ref([]);
const accessGrantCount = ref(null);
const requireRequestJustification = ref(false);
// Badge values join to the account record through the template's mapping ("icf" key
// for agents with an application.templateName, "privilege" otherwise)
const agentTemplateName = computed(() => resolveTemplateId(agent.value.application, agentTemplateSources.value));
function getAgentMappedValue(igaKey) {
  const mapping = agentMappings.value[agentTemplateName.value] || agentMappings.value.default || [];
  const entry = mapping.find((m) => m.iga === igaKey);
  const attribute = entry ? getMappingSystemKey(entry, agent.value.application) : igaKey;
  return attribute ? agent.value.account?.[attribute] : null;
}
const agentModel = computed(() => getAgentMappedValue('model.id'));
const agentStatus = computed(() => getAgentMappedValue('status'));
const id = route.params.agentId;
const resourceTypeLabels = {
  guardrails: i18n.global.t('governance.agents.guardrails'),
  identity: i18n.global.t('governance.agents.identity'),
  knowledge: i18n.global.t('governance.agents.knowledge'),
  tools: i18n.global.t('governance.agents.tools'),
  toolCredentials: i18n.global.t('governance.agents.toolCredentials'),
  serviceAccount: i18n.global.t('governance.agents.serviceAccount'),
  connection: i18n.global.t('governance.agents.connection'),
};

// Resource types grouped into two tabs. Order also drives card order within each tab.
const RESOURCE_GROUP_KEYS = {
  'data-tools': ['tools', 'knowledge', 'guardrails'],
  security: ['toolCredentials', 'identity', 'serviceAccount', 'connection'],
};

// Legacy per-resource tab deep links (/:agentId/:tab) map to their group.
const RESOURCE_TYPE_TO_GROUP = {};
Object.entries(RESOURCE_GROUP_KEYS).forEach(([groupKey, types]) => {
  types.forEach((type) => { RESOURCE_TYPE_TO_GROUP[type] = groupKey; });
});

function tabActivated(index) {
  tabIndex.value = index;
}

function buildResourceProps(agentData) {
  const templateId = resolveTemplateId(agentData.application, agentTemplateSources.value);
  const templateProps = agentApplicationProps.value[templateId]
    || agentApplicationProps.value.default || {};
  return Object.entries(templateProps).map(([type, config]) => ({
    type,
    label: resourceTypeLabels[type] || type,
    nameProperty: config.nameProperty || '__NAME__',
    descriptionProperty: config.descriptionProperty || 'description',
    accountAttribute: config.accountAttribute || type,
    icon: agentConstants.AGENT_ICONS[type]?.icon || '',
    iconColor: agentConstants.AGENT_ICONS[type]?.color || '',
  }));
}

/**
 * Groups the resources of the agent's matched template config into the fixed tab groups.
 * Tabs are derived from the application definition alone (the template matched by
 * templateName or aiAgentSource in buildResourceProps) — the account's resource
 * attributes only feed the count badge. A group with no configured resources produces
 * no tab.
 * @param {Array} resourceProps - Per-resource props from buildResourceProps
 * @returns {Array<{key: string, label: string, count: number, resources: Array}>}
 */
function buildResourceGroups(resourceProps) {
  return Object.entries(RESOURCE_GROUP_KEYS)
    .map(([key, types]) => {
      const resources = types
        .map((type) => resourceProps.find((resource) => resource.type === type))
        .filter(Boolean);
      return {
        key,
        label: i18n.global.t(`governance.agents.resourceGroups.${key}`),
        count: resources.reduce(
          (sum, resource) => {
            const value = agent.value.account?.[resource.accountAttribute];
            if (Array.isArray(value)) return sum + value.length;
            return value != null ? sum + 1 : sum;
          },
          0,
        ),
        resources,
      };
    })
    .filter((group) => group.resources.length > 0);
}

onMounted(async () => {
  try {
    if (props.isLcm) {
      setBreadcrumb('/administer/agents', i18n.global.t('governance.administer.agents.title'));
    } else if (props.isEndUser) {
      setBreadcrumb('/my-agents', i18n.global.t('sideMenu.endUser.agents'));
    } else if (route.query.originAppId) {
      // Entered from an application's Objects tab — return the breadcrumb to that side tab
      setBreadcrumb(`/applications/unmanaged/edit/${route.query.originAppId}/objects${route.query.originObjectTab ? `/${route.query.originObjectTab}` : ''}`,
        route.query.originAppName || i18n.global.t('common.application'));
    } else {
      setBreadcrumb('/agents', i18n.global.t('governance.agents.title'));
    }

    const [, agentResult] = await Promise.allSettled([
      Promise.all([loadAppTemplates(), loadConfig()]),
      getAgentById(id),
    ]);

    // Count only the three access tabs shown below (accounts, entitlements, roles)
    getAgentGrants(id, {
      _queryFilter: "item.type eq 'accountGrant' or item.type eq 'entitlementGrant' or item.type eq 'roleMembership'",
      _pageSize: 0,
    })
      .then(({ data }) => { accessGrantCount.value = data?.totalCount ?? null; })
      .catch(() => {});
    try {
      const { data } = await getIgaAccessRequest();
      requireRequestJustification.value = data.requireRequestJustification;
    } catch {
      // non-fatal; default false
    }
    if (agentResult.status === 'fulfilled') {
      const { data } = agentResult.value;
      agent.value = { ...data };
      if (agent.value.application) {
        // application.icon -> template config icon -> app-template image lookup
        const applicationIcon = resolveAgentIcon(
          agent.value.application,
          agentTemplateIcons.value,
          agentTemplateSources.value,
        ) || getApplicationLogo(agent.value.application);
        agent.value.application.icon = applicationIcon;
      }
      agent.value.displayName = getAgentDisplayName(agent.value);
      agentResourceProps.value = buildResourceProps(agent.value);
      resourceGroups.value = buildResourceGroups(agentResourceProps.value);
    } else {
      showErrorMessage(agentResult.reason, i18n.global.t('governance.agents.failedToLoad'));
    }

    const tabKeys = ['details', 'access', ...resourceGroups.value.map((g) => g.key), 'activity'];
    // Accept legacy per-resource-type tab params by mapping them to their group.
    const requestedTab = RESOURCE_TYPE_TO_GROUP[route.params.tab] || route.params.tab;
    const matchedTab = tabKeys.findIndex((key) => key === requestedTab);
    tabIndex.value = matchedTab > -1 ? matchedTab : 0;
  } finally {
    isLoading.value = false;
    tabsReady.value = true;
  }
});
</script>
