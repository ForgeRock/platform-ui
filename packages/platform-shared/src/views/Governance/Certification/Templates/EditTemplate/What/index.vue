<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4 flex-grow-1 overflow-auto h-100">
    <BContainer
      fluid
      class="mt-4">
      <div>
        <h1 class="h4 mb-4">
          {{ $t('governance.editTemplate.whatToCertify') }}
        </h1>
        <p>
          {{ $t('governance.editTemplate.whatToCertifyDescription') }}
        </p>
      </div>

      <!-- Agent Platform: AGENTPROFILE shows it at top (nothing else on the step); AGENTACCESS shows it below grants inside "Which agents". -->
      <FrField
        v-if="isAgentProfile"
        :value="formFields.platform"
        @input="formFields.platform = $event; updateFilter();"
        class="mb-4"
        name="platform"
        testid="agent-platform"
        type="select"
        :label="$t('governance.editTemplate.platform.label')"
        :options="platformOptions" />

      <!-- Agent type: agent subject filter (backend support pending for agentAccess) -->
      <FrField
        v-if="isAgentProfile"
        :value="formFields.agentType"
        @input="formFields.agentType = $event; updateFilter();"
        class="mb-4"
        name="agentType"
        testid="agent-type"
        type="select"
        :label="$t('governance.editTemplate.agentType.label')"
        :options="agentTypeOptions" />

      <!-- Grant checkboxes (AGENTACCESS): first, per mock -->
      <div v-if="type === types.AGENTACCESS">
        <div class="d-flex flex-column">
          <FrField
            :value="formFields.enableAccountGrant"
            @input="formFields.enableAccountGrant = $event; updateFilter();"
            class="mb-2"
            name="enableAccountGrant"
            testid="enable-account-cert"
            type="checkbox"
            :label="$t('governance.certification.certifyAgentAccounts')" />
          <FrField
            :value="formFields.enableEntitlementGrant"
            @input="formFields.enableEntitlementGrant = $event; updateFilter()"
            class="mb-2"
            name="enableEntitlementGrant"
            testid="enable-entitlement-cert"
            type="checkbox"
            :label="$t('governance.certification.certifyAgentEntitlements')" />
          <FrField
            :value="formFields.enableRoleGrant || formFields.enableRoleCompositionGrant"
            @input="isRoleComposition ? (formFields.enableRoleCompositionGrant = $event) : (formFields.enableRoleGrant = $event); updateFilter()"
            class="mb-3"
            name="enableRoleGrant"
            testid="enable-role-cert"
            type="checkbox"
            :label="$t('governance.certification.certifyAgentRoles')" />
        </div>
        <FrValidationError :validator-errors="errors" />
      </div>

      <!-- Which agents (AGENTACCESS): platform/type/owner after grant checkboxes -->
      <div
        v-if="type === types.AGENTACCESS"
        class="mt-4">
        <h2 class="h5">
          {{ $t('governance.editTemplate.whichAgents') }}
        </h2>
        <p class="mb-3">
          {{ $t('governance.editTemplate.whichAgentsDescription') }}
        </p>
        <FrField
          :value="formFields.platform"
          @input="formFields.platform = $event; updateFilter();"
          class="mb-4"
          name="platform"
          testid="agentaccess-platform"
          type="select"
          :label="$t('governance.editTemplate.platform.label')"
          :options="platformOptions" />
        <FrField
          :value="formFields.agentType"
          @input="formFields.agentType = $event; updateFilter();"
          class="mb-4"
          name="agentType"
          testid="agentaccess-agent-type"
          type="select"
          :label="$t('governance.editTemplate.agentType.label')"
          :options="agentTypeOptions" />
      </div>

      <!-- Access to certify heading (AGENTACCESS): sits above the Applications/Accounts/Entitlements/Roles filter sections -->
      <div
        v-if="type === types.AGENTACCESS"
        class="mt-4">
        <h2 class="h5">
          {{ $t('governance.editTemplate.accessToCertify') }}
        </h2>
        <p class="mb-3">
          {{ $t('governance.editTemplate.accessToCertifyDescription') }}
        </p>
      </div>

      <!-- Grant Type Selection (non-agent identity cert) -->
      <div v-if="type === types.IDENTITY">
        <div class="d-flex flex-column">
          <FrField
            :value="formFields.enableAccountGrant"
            @input="formFields.enableAccountGrant = $event; updateFilter();"
            class="mb-2"
            name="enableAccountGrant"
            testid="enable-account-cert"
            type="checkbox"
            :label="$t('governance.certification.certifyUserType', { type: $t('common.accounts') })" />
          <FrField
            :value="formFields.enableEntitlementGrant"
            @input="formFields.enableEntitlementGrant = $event; updateFilter()"
            class="mb-2"
            name="enableEntitlementGrant"
            testid="enable-entitlement-cert"
            type="checkbox"
            :label="$t('governance.certification.certifyUserType', { type: $t('common.entitlements') })" />
          <FrField
            :value="formFields.enableRoleGrant || formFields.enableRoleCompositionGrant"
            @input="isRoleComposition ? (formFields.enableRoleCompositionGrant = $event) : (formFields.enableRoleGrant = $event); updateFilter()"
            class="mb-3"
            name="enableRoleGrant"
            testid="enable-role-cert"
            type="checkbox"
            :label="$t('governance.certification.certifyUserType', { type: $t('common.roles') })" />
        </div>
        <FrValidationError :validator-errors="errors" />
      </div>

      <!-- Filters -->
      <BCollapse
        class="border-bottom mt-3"
        v-for="(filter) in filterComponents"
        :key="filter"
        :visible="displayFilter(filter)"
        :data-testid="filter">
        <h2
          v-if="filter === 'FrUserFilter'"
          class="h5">
          {{ $t('common.users') }}
        </h2>
        <Component
          :is="filter"
          @update-filter="updateFilter"
          class="pt-3"
          :organization-options="organizationOptions"
          :filter-data="value"
          :properties="grantFilterProperties" />
      </BCollapse>

      <div
        v-if="anyGrantEnabled && !isAgentProfile"
        class="mt-3">
        <FrField
          v-if="(formFields.enableEntitlementGrant || formFields.enableAccountGrant) && !isEntitlementComposition && !isIdentityProfile && !isRoleComposition"
          :value="formFields.excludeRoleBasedAccess"
          @input="formFields.excludeRoleBasedAccess = $event; updateFilter()"
          class="mb-3"
          name="excludeRoleBasedAccess"
          type="checkbox"
          :label="$t('governance.editTemplate.excludeRoleBased')" />
        <FrField
          v-if="formFields.enableRoleGrant && !isEntitlementComposition && !isIdentityProfile && !isRoleComposition"
          :value="formFields.excludeConditionalAccess"
          @input="formFields.excludeConditionalAccess = $event; updateFilter()"
          class="mb-3"
          name="excludeConditionalAccess"
          type="checkbox"
          :label="$t('governance.editTemplate.excludeConditional')" />
      </div>

      <!-- Advanced filters toggle (all cert types) -->
      <template>
        <BButton
          @click="showAdvanced = !showAdvanced"
          class="my-4 p-0"
          variant="link">
          {{ showAdvanced ? $t('governance.editTemplate.hideAdvancedFilters') : $t('governance.editTemplate.showAdvancedFilters') }}
        </BButton>
        <BCollapse :visible="showAdvanced">
          <FrDecisionFilter
            @update-filter="updateFilter"
            :properties="grantFilterProperties"
            :filter-data="value" />
        </BCollapse>
      </template>

      <!-- Counts -->
      <div class="mt-4 mb-4">
        <h4>
          {{ $t('governance.editTemplate.countTitle') }}
        </h4>
        <p class="mb-3 text-muted">
          {{ $t('governance.editTemplate.countSubtitle') }}
        </p>
        <BRow align-h="between">
          <BCol
            v-for="count in filteredCounts"
            :data-testid="count.testId"
            :key="count.label"
            :md="Math.floor(12 / filteredCounts.length)">
            <h5 class="mb-0 text-capitalize text-muted">
              {{ count.label }}
            </h5>
            <p class="h2 mb-0">
              {{ count.value }}
            </p>
          </BCol>
        </BRow>
      </div>
    </BContainer>
  </div>
</template>

<script>
import {
  BButton,
  BCol,
  BCollapse,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import {
  cloneDeep,
  debounce,
  startCase,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrValidationError from '@forgerock/platform-shared/src/components/ValidationErrorList';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { useFormValues, useSetFormErrors } from 'vee-validate';
import { findFieldNamesMatchingName } from '@forgerock/platform-shared/src/utils/veeValidateUtils';
import FrAccountFilter from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/What/filters/AccountFilter';
import FrApplicationFilter from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/What/filters/ApplicationFilter';
import FrDecisionFilter from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/What/filters/DecisionFilter';
import FrEntitlementFilter from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/What/filters/EntitlementFilter';
import FrOrganizationFilter from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/What/filters/OrganizationFilter';
import FrRoleFilter from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/What/filters/RoleFilter';
import FrUserFilter from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/What/filters/UserFilter';
import { getDecisionCount } from '@forgerock/platform-shared/src/api/governance/TemplateApi';
import { getAgentConfig } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import {
  composeAgentPlatformFilter,
  composeAgentTypeFilter,
  getAgentPlatformFilter,
  getAgentTypeFilter,
  getFilterGrantByType,
  getAllNonAuthoritativeApplications,
  getAllFilter,
} from '@forgerock/platform-shared/src/views/Governance/utils/certification';
import i18n from '@/i18n';
import {
  filterTypes,
  filterTypeMap,
  isAgentType,
  types,
  typeSpecificFields,
  uiTypeMap,
} from '../../templateTypes';

// display-name overrides for agent platform ids returned by /governance/agent/config;
// unknown ids fall back to a prettified version of the raw id
const platformLabelKeys = {
  'azure.openai': 'governance.editTemplate.platform.azureOpenAI',
  'm365.copilot': 'governance.editTemplate.platform.m365Copilot',
  'aws.bedrock': 'governance.editTemplate.platform.awsBedrock',
  'google.vertexai': 'governance.editTemplate.platform.googleVertexAI',
  'servicenow.nowassist': 'governance.editTemplate.platform.servicenowNowAssist',
};

// maps filter types to vue components
const componentFilterMap = {
  [filterTypes.ACCOUNTS]: 'FrAccountFilter',
  [filterTypes.APPLICATIONS]: 'FrApplicationFilter',
  [filterTypes.ENTITLEMENTS]: 'FrEntitlementFilter',
  [filterTypes.ORGANIZATION]: 'FrOrganizationFilter',
  [filterTypes.ROLES]: 'FrRoleFilter',
  [filterTypes.USERS]: 'FrUserFilter',
};

const uiTypeMapping = {
  [types.IDENTITY]: uiTypeMap.IDENTITY,
  [types.ENTITLEMENT]: uiTypeMap.ENTITLEMENT,
  [types.ROLEMEMBERSHIP]: uiTypeMap.ROLEMEMBERSHIP,
  [types.ENTITLEMENTCOMPOSITION]: uiTypeMap.ENTITLEMENTCOMPOSITION,
  [types.IDENTITYPROFILE]: uiTypeMap.IDENTITYPROFILE,
  [types.ROLECOMPOSITION]: uiTypeMap.ROLECOMPOSITION,
  [types.AGENTPROFILE]: uiTypeMap.AGENTPROFILE,
  [types.AGENTACCESS]: uiTypeMap.AGENTACCESS,
};

export default {
  name: 'What',
  components: {
    BButton,
    BCol,
    BCollapse,
    BContainer,
    BRow,
    FrAccountFilter,
    FrApplicationFilter,
    FrDecisionFilter,
    FrEntitlementFilter,
    FrField,
    FrOrganizationFilter,
    FrRoleFilter,
    FrUserFilter,
    FrValidationError,
  },
  mixins: [NotificationMixin],
  props: {
    eventBased: {
      type: Boolean,
      default: false,
    },
    grantFilterProperties: {
      type: Object,
      default: () => ({}),
    },
    organizationOptions: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: types.IDENTITY,
    },
    value: {
      type: Object,
      default: () => {},
    },
  },
  setup() {
    const formValues = useFormValues();
    const setFormErrors = useSetFormErrors();
    return { formValues, setFormErrors };
  },
  data() {
    return {
      debounceSetDecisionCount: debounce(this.setDecisionCount, 200),
      filterInputs: {},
      formFields: {
        enableAccountGrant: true,
        enableEntitlementGrant: false,
        enableEntitlementCompositionGrant: false,
        enableRoleGrant: false,
        enableIdentityProfileGrant: false,
        enableRoleCompositionGrant: false,
        excludeConditionalAccess: true,
        excludeRoleBasedAccess: true,
        platform: 'all',
        agentType: 'all',
        decisionFilter: {},
      },
      showAdvanced: false,
      agentPlatformOptions: [],
      counts: {
        user: 0,
        application: 0,
        account: 0,
        decision: 0,
        entitlement: 0,
        role: 0,
      },
      filters: {
        user: null,
        application: null,
        account: null,
        decision: null,
        entitlement: null,
      },
      types,
      validatedCheckboxName: '',
    };
  },
  computed: {
    anyGrantEnabled() {
      return this.formFields.enableEntitlementGrant
        || this.formFields.enableAccountGrant
        || this.formFields.enableRoleGrant
        || this.formFields.enableIdentityProfileGrant
        || this.formFields.enableEntitlementCompositionGrant
        || this.formFields.enableRoleCompositionGrant;
    },
    errors() {
      // ponytail: AGENTPROFILE has no grant checkboxes to require; AGENTACCESS reuses IDENTITY validation.
      const errors = (this.anyGrantEnabled || this.isAgentProfile) ? [] : [i18n.global.t('common.policyValidationMessages.AT_LEAST_ONE_CHECKBOX')];
      this.setFormErrors({ [this.validatedCheckboxName]: errors[0] });
      return errors;
    },
    filteredCounts() {
      if (this.isAgentType) {
        // distinct agent accounts, from the target-count response's distinctAgents
        // (present for both agent cert types)
        return [{
          label: this.$t('common.agents'),
          value: this.counts.agents ?? 0,
          testId: 'agent-count',
        }];
      }
      const counts = [
        {
          label: this.$t('common.users'),
          value: this.counts.user,
          enabled: !this.eventBased && !this.isEntitlementComposition && !this.isRoleComposition,
          testId: 'user-count',
        },
        {
          label: this.$t('common.applications'),
          value: this.counts.application,
          enabled: this.formFields.enableAccountGrant || this.formFields.enableEntitlementGrant || this.formFields.enableEntitlementCompositionGrant,
          testId: 'application-count',
        },
        {
          label: this.$t('common.accounts'),
          value: this.counts.account,
          enabled: this.formFields.enableAccountGrant,
          testId: 'account-count',
        },
        {
          label: this.$t('common.entitlements'),
          value: this.counts.entitlement,
          enabled: this.formFields.enableEntitlementGrant || this.formFields.enableEntitlementCompositionGrant,
          testId: 'entitlement-count',
        },
        {
          label: this.$t('common.roles'),
          value: this.counts.role,
          enabled: this.formFields.enableRoleGrant || this.formFields.enableRoleCompositionGrant,
          testId: 'role-count',
        },
      ];
      return counts.filter((count) => (count.enabled));
    },
    filterComponents() {
      const filterType = this.eventBased ? types.EVENTBASED : this.type;
      return typeSpecificFields[filterType]?.filters.map((filter) => (componentFilterMap[filter])) || [];
    },
    isEntitlementComposition() {
      return this.type === types.ENTITLEMENTCOMPOSITION;
    },
    isIdentityProfile() {
      return this.type === types.IDENTITYPROFILE;
    },
    isRoleComposition() {
      return this.type === types.ROLECOMPOSITION;
    },
    isAgentType() {
      return isAgentType(this.type);
    },
    isAgentProfile() {
      return this.type === types.AGENTPROFILE;
    },
    platformOptions() {
      return this.agentPlatformOptions;
    },
    // ponytail: values from IGA-4637; no backend enum exists yet — hardcoded until defined
    agentTypeOptions() {
      return [
        { text: this.$t('governance.editTemplate.agentType.allTypes'), value: 'all' },
        { text: this.$t('governance.editTemplate.agentType.workload'), value: 'workload' },
        { text: this.$t('governance.editTemplate.agentType.personal'), value: 'personal' },
        { text: this.$t('governance.editTemplate.agentType.nhi'), value: 'nhi' },
      ];
    },
  },
  created() {
    Object.keys(this.formFields).forEach((field) => {
      if (this.value[field] !== undefined) {
        this.formFields[field] = cloneDeep(this.value[field]);
      }
    });
  },
  async mounted() {
    if (this.type === types.ENTITLEMENT) {
      this.formFields.enableAccountGrant = false;
      this.formFields.enableEntitlementGrant = true;
      this.formFields.enableRoleGrant = false;
    }

    if (this.type === types.ROLEMEMBERSHIP) {
      this.formFields.enableAccountGrant = false;
      this.formFields.enableEntitlementGrant = false;
      this.formFields.enableRoleGrant = true;
    }

    if (this.type === types.ENTITLEMENTCOMPOSITION) {
      this.formFields.enableAccountGrant = false;
      this.formFields.enableEntitlementGrant = false;
      this.formFields.enableRoleGrant = false;
      this.formFields.enableEntitlementCompositionGrant = true;
    }

    if (this.type === types.IDENTITYPROFILE) {
      this.formFields.enableAccountGrant = false;
      this.formFields.enableEntitlementGrant = false;
      this.formFields.enableRoleGrant = false;
      this.formFields.enableIdentityProfileGrant = true;
    }
    if (this.type === types.AGENTPROFILE) {
      // agentProfile certifies the agent account record (accountGrant items) — same
      // shape as application certs, scoped to agent apps; agents have no linked user
      this.formFields.enableAccountGrant = true;
      this.formFields.enableEntitlementGrant = false;
      this.formFields.enableRoleGrant = false;
      this.formFields.enableEntitlementCompositionGrant = false;
    }
    if (this.type === types.AGENTACCESS && this.value.enableAccountGrant === undefined) {
      this.formFields.enableAccountGrant = true;
      this.formFields.enableEntitlementGrant = true;
      this.formFields.enableRoleGrant = true;
    }

    if (this.type === types.ROLECOMPOSITION) {
      this.formFields.enableAccountGrant = false;
      this.formFields.enableEntitlementGrant = false;
      this.formFields.enableRoleGrant = false;
      this.formFields.enableRoleCompositionGrant = true;
    }

    [this.validatedCheckboxName] = findFieldNamesMatchingName('enableAccountGrant', this.formValues);

    if (this.isAgentType) {
      this.fetchAgentPlatformOptions();
      // agent types have no visible grant checkboxes to trigger the count chain —
      // kick it once so the Estimated Total reflects the saved/initial filters
      this.updateFilter();
    }
  },
  methods: {
    async fetchAgentPlatformOptions() {
      let platformIds = [];
      try {
        // getAgentConfig returns the raw axios response — unwrap data
        const { data } = await getAgentConfig();
        // 'default' is the backend's fallback template, not a platform
        platformIds = (data?.templates || []).map((t) => t.id).filter((id) => id && id !== 'default');
      } catch (e) {
        // platform list stays empty on API failure — values must come from the
        // backend config so a stale selection can't 400 at save
        this.showErrorMessage(e, this.$t('governance.editTemplate.errors.agentConfigError'));
      }
      this.agentPlatformOptions = [
        { text: i18n.global.t('governance.editTemplate.platform.allPlatforms'), value: 'all' },
        ...platformIds.map((id) => ({
          text: platformLabelKeys[id] ? i18n.global.t(platformLabelKeys[id]) : startCase(id.replace(/\./g, ' ')),
          value: id,
        })),
      ];
    },
    /**
     * Determine if a filter should be displayed based on what grants are enabled
     *
     * @param {Object} filterComponent component associated with the filter type
     * @returns {Boolean} should filter be displayed
     */
    displayFilter(filterComponent) {
      if (filterComponent === 'FrApplicationFilter') {
        return this.formFields.enableEntitlementGrant || this.formFields.enableAccountGrant || this.formFields.enableEntitlementCompositionGrant;
      }
      if (filterComponent === 'FrAccountFilter') return this.formFields.enableAccountGrant;
      if (filterComponent === 'FrEntitlementFilter') {
        return this.formFields.enableEntitlementGrant || this.formFields.enableEntitlementCompositionGrant;
      }
      if (filterComponent === 'FrRoleFilter') return this.formFields.enableRoleGrant || this.formFields.enableRoleCompositionGrant;
      return true;
    },
    /**
     * Check if all filters associated with the template type have values
     *
     * @param {Object} filters all filter values
     * @returns {Boolean} true if all required filters have values
     */
    allFiltersPresent(filters) {
      const filtersClone = cloneDeep(filters);
      delete filtersClone.decision;

      const filterType = this.eventBased ? types.EVENTBASED : this.type;
      const allFilterTypes = typeSpecificFields[filterType].filters;
      const filtersNotPresent = allFilterTypes.filter((filter) => (filtersClone[filterTypeMap[filter]] === null));
      return filtersNotPresent.length === 0;
    },
    /**
     * Make call to get decision count
     *
     * @param {Object} filters filter objects
     * @param {Array} grantTypes array of grant types
     */
    async setDecisionCount(filters, grantTypes, options) {
      const { data } = await getDecisionCount(filters, grantTypes, options);
      const { objects } = data;
      // agent cert types: keep the distinct agent accounts (data.distinctAgents) readable
      // as counts.agents for the Agents box; objects breakdown covers the grant keys
      this.counts = { ...objects, agents: data.distinctAgents };
      this.$emit('set-counts', data);
    },
    /**
     * Update filters based on child filters. Merges all child filters into one object to emit to parent
     *
     * @param {Object} payload.filterInputs filter objects
     * @param {Object} payload.filterFields filter form fields
     */
    async updateFilter(payload) {
      if (payload) {
        this.filterInputs = { ...this.filterInputs, ...payload.filterFields };

        this.$emit('input', {
          ...this.formFields,
          ...this.filterInputs,
        });

        this.filters[payload.type] = payload.filter;
      }

      // check if all filters are present before getting count
      // this prevents unnecessary api calls when we only need one with all the filters
      if (this.allFiltersPresent(this.filters)) {
        const grantTypes = getFilterGrantByType(this.formFields.enableAccountGrant, this.formFields.enableEntitlementGrant, this.formFields.enableRoleGrant, this.formFields.enableEntitlementCompositionGrant, this.formFields.enableIdentityProfileGrant, this.formFields.enableRoleCompositionGrant);
        const filtersClone = cloneDeep(this.filters);

        Object.keys(filtersClone).forEach((key) => {
          if (filtersClone[key] === null) delete filtersClone[key];
        });

        const options = {};
        if (this.formFields.excludeConditionalAccess) options.excludeConditionalAccess = true;
        if (this.formFields.excludeRoleBasedAccess) options.excludeRoleBasedAccess = true;
        if (this.type in uiTypeMapping) options.certificationType = uiTypeMapping[this.type];
        // agent types: platform scopes the agent filter (accountType=agent + application.templateName)
        if (this.isAgentType && this.formFields.platform && this.formFields.platform !== 'all') {
          options.platform = this.formFields.platform;
        }

        // agentProfile has no filter components (AGENTPROFILE.filters is empty), so
        // the platform/agentType scope must be stamped into the count payload's
        // application/account subtrees — the same encoding buildSavePayload writes
        // at template save (getAgentPlatformFilter / getAgentTypeFilter), so the
        // estimate matches what the campaign will target
        if (this.type === types.AGENTPROFILE) {
          filtersClone.application = this.formFields.platform && this.formFields.platform !== 'all'
            ? getAgentPlatformFilter(this.formFields.platform)
            : getAllNonAuthoritativeApplications();
          filtersClone.account = this.formFields.agentType && this.formFields.agentType !== 'all'
            ? getAgentTypeFilter(this.formFields.agentType)
            : getAllFilter();
        } else if (this.isAgentType) {
          // agentAccess: the filter builders populated the access subtrees; the
          // scope clauses AND into them — the same composition buildSavePayload
          // writes at template save
          if (this.formFields.platform && this.formFields.platform !== 'all') {
            filtersClone.application = composeAgentPlatformFilter(
              filtersClone.application,
              this.formFields.platform,
            );
          }
          if (this.formFields.agentType && this.formFields.agentType !== 'all') {
            filtersClone.account = composeAgentTypeFilter(
              filtersClone.account,
              this.formFields.agentType,
            );
          }
        }

        try {
          this.debounceSetDecisionCount(filtersClone, grantTypes, options);
        } catch (error) {
          this.showErrorMessage(error, this.$t('governance.editTemplate.errorRetrievingCounts'));
        }
      }
    },
  },
  watch: {
    formFields: {
      deep: true,
      handler(newVal) {
        const payload = cloneDeep(newVal);
        this.$emit('input', {
          ...payload,
          ...this.filterInputs,
        });
      },
    },
  },
};
</script>
