<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :aria-label="agentDisplayName ? `${$t('governance.agents.agentDetails')}: ${agentDisplayName}` : $t('governance.agents.agentDetails')"
    body-class="p-0"
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <div class="size-48 fr-app-logo-bg d-flex align-items-center justify-content-center mr-3">
          <img
            height="36"
            width="36"
            :alt="agentDisplayName"
            :onerror="onImageError"
            :src="logo">
        </div>
        <div class="media-body">
          <small class="mb-1">
            {{ $t('governance.agents.agentDetails') }}
          </small>
          <h5 class="mb-0">
            {{ agentDisplayName }}
          </h5>
          <div
            v-if="agentModel || agentStatus"
            class="mt-1">
            <BBadge
              v-if="agentModel"
              class="mr-2 py-1"
              pill
              variant="info">
              {{ $t('governance.agents.mappingKeys.model') }}: {{ agentModel }}
            </BBadge>
            <BBadge
              v-if="agentStatus"
              class="py-1"
              pill
              variant="info">
              {{ $t('governance.agents.mappingKeys.status') }}: {{ agentStatus }}
            </BBadge>
          </div>
        </div>
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
    <FrSpinner
      v-if="isLoadingConfig"
      class="py-5" />
    <div
      v-else
      class="p-4">
      <BCard class="mb-3">
        <button
          type="button"
          class="d-flex justify-content-between section-header btn btn-link p-0 w-100 text-left font-weight-normal"
          :aria-expanded="isVisible.about ? 'true' : 'false'"
          aria-controls="agent-modal-about"
          @click="isVisible.about = !isVisible.about">
          <h5 class="mb-0">
            {{ $t('governance.agents.details.detailsTab.aboutThisAgent') }}
          </h5>
          <FrIcon :name="isVisible.about ? 'keyboard_arrow_down' : 'chevron_right'" />
        </button>
        <BCollapse :visible="isVisible.about">
          <p
            id="agent-modal-about"
            class="mb-0 text-secondary mt-3">
            {{ account.description || $t('governance.agents.details.detailsTab.noDescription') }}
          </p>
        </BCollapse>
      </BCard>
      <BCard
        v-if="linkedIdentity"
        class="mb-3"
        data-testid="linked-agent-identity-card">
        <BRow>
          <BCol
            sm="6"
            class="mb-3 h5">
            {{ $t('governance.agents.details.detailsTab.linkedAgentIdentity') }}
          </BCol>
        </BRow>
        <BRow>
          <BCol
            class="mb-2"
            sm="3">
            <FrUserDetails :user-object="linkedIdentity" />
          </BCol>
        </BRow>
      </BCard>
      <FrObjectProperties
        class="mb-3"
        enable-collapse
        :is-collapsed="!isVisible.attributes"
        :title="$t('governance.agents.details.objectPropertiesTab.title')"
        :object-properties="mappedProperties"
        object="agents"
        preserve-order
        :schema="mappedSchema"
        @toggle-collapse="isVisible.attributes = !isVisible.attributes" />
      <template v-for="resource in resourcesDevEnabled ? agentResourceProps : []">
        <BCard
          v-if="agentAccountId"
          :key="resource.type"
          class="mb-3">
          <button
            type="button"
            class="d-flex justify-content-between section-header btn btn-link p-0 w-100 text-left font-weight-normal"
            :aria-expanded="resourceIsExpanded(resource.type) ? 'true' : 'false'"
            :aria-controls="`agent-modal-resource-${resource.type}`"
            @click="toggleResource(resource.type)">
            <div class="d-flex align-items-center">
              <FrIcon
                v-if="resource.icon"
                :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-2 color-dark${resource.iconColor} bg-light${resource.iconColor}`"
                :name="resource.icon" />
              <h5 class="mb-0 mr-2">
                {{ resource.label }}
              </h5>
              <BBadge
                v-if="resourceTotal(resource.type) > 0"
                pill
                variant="info">
                {{ resourceTotal(resource.type) }}
              </BBadge>
            </div>
            <FrIcon :name="resourceIsExpanded(resource.type) ? 'keyboard_arrow_down' : 'chevron_right'" />
          </button>
          <BCollapse :visible="resourceIsExpanded(resource.type)">
            <FrSpinner
              v-if="!resourceData[resource.type] || resourceData[resource.type].isLoading"
              class="py-4" />
            <template v-else>
              <FrNoData
                v-if="!resourceItems(resource.type).length"
                icon="inventory_2"
                :card="false"
                body-class="mb-5"
                :subtitle="$t('governance.agents.details.noAssociatedEntities', { entities: resource.label })" />
              <BTable
                v-else
                :id="`agent-modal-resource-${resource.type}`"
                class="mb-0 mt-3"
                responsive
                :fields="resourceFields"
                :items="resourceItems(resource.type)">
                <template #cell(name)="{ item }">
                  <div class="d-flex align-items-center">
                    <FrIcon
                      v-if="resource.icon"
                      :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-2 color-dark${resource.iconColor} bg-light${resource.iconColor}`"
                      :name="resource.icon" />
                    {{ item.name }}
                  </div>
                </template>
                <template #cell(description)="{ item }">
                  {{ item.description || blankValueIndicator }}
                </template>
              </BTable>
            </template>
          </BCollapse>
        </BCard>
      </template>
      <BCard class="mb-3">
        <button
          type="button"
          class="d-flex justify-content-between section-header btn btn-link p-0 w-100 text-left font-weight-normal"
          :aria-expanded="isVisible.custodians ? 'true' : 'false'"
          aria-controls="agent-modal-custodians"
          @click="isVisible.custodians = !isVisible.custodians">
          <div class="d-flex align-items-center">
            <h5 class="mb-0">
              {{ $t('governance.accounts.custodians') }}
            </h5>
            <BBadge
              v-if="custodianActors.length"
              class="ml-2"
              pill
              variant="info">
              {{ custodianActors.length }}
            </BBadge>
          </div>
          <FrIcon :name="isVisible.custodians ? 'keyboard_arrow_down' : 'chevron_right'" />
        </button>
        <BCollapse :visible="isVisible.custodians">
          <div id="agent-modal-custodians">
            <FrNoData
              v-if="!custodianActors.length"
              icon="person_off"
              :card="false"
              body-class="mb-5"
              :subtitle="$t('governance.agents.custodiansTab.noCustodians')" />
            <BRow
              v-else
              class="mt-3">
              <BCol
                v-for="actor in custodianActors"
                class="mb-2"
                :key="actor.id"
                :sm="stackCustodiansVertically ? 12 : 3">
                <FrUserDetails :user-object="actor" />
              </BCol>
            </BRow>
          </div>
        </BCollapse>
      </BCard>
      <BCard>
        <button
          type="button"
          class="d-flex justify-content-between section-header btn btn-link p-0 w-100 text-left font-weight-normal"
          :aria-expanded="isVisible.technical ? 'true' : 'false'"
          aria-controls="agent-modal-technical"
          @click="isVisible.technical = !isVisible.technical">
          <h5 class="mb-0">
            {{ $t('governance.agents.details.objectPropertiesTab.technicalDetails') }}
          </h5>
          <FrIcon :name="isVisible.technical ? 'keyboard_arrow_down' : 'chevron_right'" />
        </button>
        <BCollapse :visible="isVisible.technical">
          <pre
            id="agent-modal-technical"
            class="mt-3 mb-0 fr-technical-details">{{ JSON.stringify(account || {}, null, 2) }}</pre>
        </BCollapse>
      </BCard>
    </div>
  </BModal>
</template>

<script>
/**
 * Modal displaying agent details for a certification line item. Mirrors the
 * AccountModal shell and single stacked-card layout, with every section
 * collapsible: about (with model/status badges in the header), the linked agent
 * identity when the record has a user, schema-driven agent properties, resource
 * tables, custodians (glossary actors), and a technical attributes JSON block.
 * @component AgentModal
 * @prop {Object} grant - Certification line item (account, application, glossary, descriptor, item)
 * @prop {String} modalId - BModal id used to programmatically show/hide the modal
 */
import {
  BBadge,
  BButtonClose,
  BCard,
  BCollapse,
  BCol,
  BModal,
  BMedia,
  BRow,
  BTable,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrUserDetails from '@forgerock/platform-shared/src/components/governance/UserDetails';
import FrObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { useAgentConfig, resolveTemplateId } from '@forgerock/platform-shared/src/views/Governance/Agents/utils/useAgentConfig';
import {
  buildAgentPropertiesDisplay, buildAgentPropertiesSchema, getMappingSystemKey, resolveAgentSchema,
} from '@forgerock/platform-shared/src/views/Governance/Agents/utils/agentUtility';
import { getAgentCustodians, getAgentResources } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import agentConstants from '@forgerock/platform-shared/src/views/Governance/Agents/utils/agentConstants';
import i18n from '@/i18n';

// Labels for the resource types a template can carry — same keys as the
// Agents details page tab groups
const resourceTypeLabels = {
  guardrails: i18n.global.t('governance.agents.guardrails'),
  identity: i18n.global.t('governance.agents.identity'),
  knowledge: i18n.global.t('governance.agents.knowledge'),
  tools: i18n.global.t('governance.agents.tools'),
  toolCredentials: i18n.global.t('governance.agents.toolCredentials'),
  serviceAccount: i18n.global.t('governance.agents.serviceAccount'),
  connection: i18n.global.t('governance.agents.connection'),
};

const agentIcons = agentConstants.AGENT_ICONS;

export default {
  name: 'AgentModal',
  components: {
    BBadge,
    BButtonClose,
    BCard,
    BCollapse,
    BCol,
    BMedia,
    BModal,
    BRow,
    BTable,
    FrIcon,
    FrNoData,
    FrObjectProperties,
    FrSpinner,
    FrUserDetails,
  },
  props: {
    grant: {
      type: Object,
      required: true,
    },
    // Stacked one-per-row layout for contexts with narrow columns (request
    // details cards); the default keeps the 4-across grid
    stackCustodiansVertically: {
      type: Boolean,
      default: false,
    },
    modalId: {
      type: String,
      default: 'CertificationTaskAgentModal',
    },
  },
  data() {
    return {
      blankValueIndicator,
      custodianActors: [],
      isLoadingConfig: true,
      isVisible: {
        about: true,
        custodians: true,
        attributes: true,
        technical: false,
        // resource cards start collapsed — the header badge (fetched total) tells
        // the user whether the section is worth expanding
        resources: null,
      },
      resourceData: {},
      resourceFields: [
        {
          key: 'name',
          label: i18n.global.t('common.name'),
          class: 'w-50',
        },
        {
          key: 'description',
          label: i18n.global.t('common.description'),
          class: 'w-40',
        },
      ],
    };
  },
  setup() {
    const {
      agentMappings, agentSchema, agentTemplateSources, agentApplicationProps, loadConfig,
    } = useAgentConfig();
    return {
      agentMappings, agentSchema, agentTemplateSources, agentApplicationProps, loadConfig,
    };
  },
  computed: {
    account() {
      return this.grant?.account || {};
    },
    // Resource tables (guardrails, tools, knowledge...) are dev-only until the
    // resources ship — hidden from full releases, and not fetched when hidden
    resourcesDevEnabled() {
      return this.$store?.state?.SharedStore?.governanceDevEnabled ?? false;
    },
    agentDisplayName() {
      return this.grant?.descriptor?.idx?.['/account']?.displayName || '';
    },
    agentMapping() {
      const templateName = resolveTemplateId(this.grant?.application, this.agentTemplateSources);
      return this.agentMappings[templateName]
        || this.agentMappings.default || [];
    },
    // The properties card renders from a schema — the /agent/config response's
    // top-level "schema" property when present, else the static backup — same
    // resolution as the agent details page's Agent Properties card
    agentPropertiesSchema() {
      return resolveAgentSchema(this.agentSchema);
    },
    mappedSchema() {
      return buildAgentPropertiesSchema(this.agentPropertiesSchema);
    },
    mappedProperties() {
      return buildAgentPropertiesDisplay(
        this.account,
        this.agentPropertiesSchema,
        this.agentMapping,
        this.grant?.application,
      );
    },
    // Header badge values, joined through the template mapping like the details page
    mappedBadgeValues() {
      const values = {};
      this.agentMapping.forEach((entry) => {
        const system = getMappingSystemKey(entry, this.grant?.application);
        values[entry.iga] = this.account[system];
      });
      return values;
    },
    agentModel() {
      return this.mappedBadgeValues['model.id'] || '';
    },
    agentStatus() {
      return this.mappedBadgeValues.status || '';
    },
    // The linked agent identity — the line item's user object, same field the
    // details page's identity card renders. The cert snapshot stamps the agent's
    // fields on the item, so no separate agent fetch is needed
    linkedIdentity() {
      return this.grant?.user || null;
    },
    // The line item's account id doubles as the agent id for the agent APIs
    agentAccountId() {
      return this.grant?.keys?.accountId || '';
    },
    // Per-template resource config (type, label, icon) for the agent's
    // application — the same config driving the Agents details page tabs
    agentResourceProps() {
      const templateId = resolveTemplateId(this.grant?.application, this.agentTemplateSources);
      // An identity that doesn't match any configured template (config drift, or an
      // aiAgentSource the loaded config doesn't know) yields no resource cards —
      // guessing the default set would query types the agent's template doesn't
      // support, which the server 404s
      const templateProps = templateId ? this.agentApplicationProps[templateId] : undefined;
      if (!templateProps) return [];
      return Object.entries(templateProps).map(([type, config]) => ({
        type,
        label: resourceTypeLabels[type] || type,
        icon: agentIcons[type]?.icon || '',
        iconColor: agentIcons[type]?.color || '',
        nameProperty: config.nameProperty || '__NAME__',
        descriptionProperty: config.descriptionProperty || 'description',
      }));
    },
    glossaryValues() {
      return this.grant?.glossary?.idx?.['/account'] || {};
    },
    logo() {
      return getApplicationLogo(this.grant?.application || {});
    },
  },
  watch: {
    grant: {
      immediate: true,
      async handler(grant) {
        this.isLoadingConfig = true;
        this.custodianActors = [];
        if (!grant) {
          this.isLoadingConfig = false;
          return;
        }

        await this.loadConfig();
        this.isLoadingConfig = false;

        this.resolveCustodians();
        this.loadResources();
      },
    },
  },
  methods: {
    getApplicationLogo,
    onImageError,
    /**
     * Resolve the account's custodians. When the grant carries the stamped
     * actor refs AND their resolved display data (request records via
     * expandPaths=glossary.idx, cert items fetched by id), custodians render
     * from content — no agent-API call, which the viewer may not be authorized
     * for. A stamped glossary without actors means no custodians. Unresolved
     * refs (empty or partial _displayData) fall back to the custodians
     * endpoint, which resolves bare managed/user refs into users.
     */
    async resolveCustodians() {
      if (!this.agentAccountId) return;
      const actors = this.grant?.glossary?.idx?.['/account']?.actors
        || this.grant?.glossary?.actors
        || [];
      const displayData = this.grant?._displayData;
      const hasResolvedDisplayData = displayData
        && Object.keys(displayData).length > 0
        && actors.every((actorRef) => displayData[actorRef]);
      if (this.grant?.glossary && (actors.length === 0 || hasResolvedDisplayData)) {
        this.custodianActors = actors.map((actorRef) => {
          const resolved = displayData?.[actorRef] || {};
          const fullName = i18n.global.t('common.userFullName', {
            givenName: resolved.givenName || '',
            sn: resolved.sn || '',
          }).trim();
          return {
            id: actorRef.split('/').pop(),
            ...resolved,
            fullName: fullName || resolved.name || actorRef,
          };
        });
        return;
      }
      try {
        const { data } = await getAgentCustodians(this.agentAccountId, { pageSize: 100, pageNumber: 0 });
        this.custodianActors = (data?.result || []).map((custodian) => ({
          ...custodian,
          fullName: i18n.global.t('common.userFullName', {
            givenName: custodian.givenName || '',
            sn: custodian.sn || '',
          }).trim() || custodian.name,
        }));
      } catch {
        // a failed fetch degrades to the empty state
      }
    },
    /**
     * Fetch each of the agent's configured resource types (guardrails, tools,
     * knowledge...) via the agent resources endpoint. The line item's account id
     * doubles as the agent id server-side. Types the template doesn't configure
     * produce no card.
     */
    async loadResources() {
      this.resourceData = {};
      if (!this.agentAccountId || !this.resourcesDevEnabled) return;
      await Promise.all(this.agentResourceProps.map(async (resource) => {
        try {
          this.resourceData[resource.type] = { isLoading: true };
          const { data } = await getAgentResources(this.agentAccountId, resource.type, { pageSize: 10, pageNumber: 0 });
          const items = (data?.result || []).map((item) => {
            const source = item.sourceObject || item;
            return {
              ...item,
              name: source[resource.nameProperty] || item.displayName || item.id || '',
              description: source[resource.descriptionProperty] || '',
            };
          });
          // totalCount drives the header badge; it counts items the collapsed card
          // never rendered, so totals stay right even past the single fetched page
          this.resourceData[resource.type] = { isLoading: false, items, totalCount: data?.totalCount || items.length };
        } catch {
          // resource data is optional — the card shows the empty state
          this.resourceData[resource.type] = { isLoading: false, items: [], totalCount: 0 };
        }
      }));
    },
    resourceItems(type) {
      const data = this.resourceData[type];
      if (!data || data.isLoading) return [];
      return data.items || [];
    },
    resourceTotal(type) {
      return this.resourceData[type]?.totalCount || 0;
    },
    resourceIsExpanded(type) {
      return this.isVisible.resources?.[type] === true;
    },
    toggleResource(type) {
      this.isVisible.resources = {
        ...this.isVisible.resources,
        [type]: !this.resourceIsExpanded(type),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-technical-details {
  font-size: 0.8rem;
  background-color: $gray-100;
  border-radius: 4px;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.section-header {
  background: none;
  border: 0;
  box-shadow: none;
  color: inherit;
  cursor: pointer;
}
</style>
