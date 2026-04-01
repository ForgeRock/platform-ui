<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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

      <!-- Grant Type Selection -->
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
            :value="formFields.enableRoleGrant"
            @input="formFields.enableRoleGrant = $event; updateFilter()"
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
        v-if="anyGrantEnabled"
        class="mt-3">
        <FrField
          v-if="(formFields.enableEntitlementGrant || formFields.enableAccountGrant) && !isEntitlementComposition"
          :value="formFields.excludeRoleBasedAccess"
          @input="formFields.excludeRoleBasedAccess = $event; updateFilter()"
          class="mb-3"
          name="excludeRoleBasedAccess"
          type="checkbox"
          :label="$t('governance.editTemplate.excludeRoleBased')" />
        <FrField
          v-if="formFields.enableRoleGrant"
          :value="formFields.excludeConditionalAccess"
          @input="formFields.excludeConditionalAccess = $event; updateFilter()"
          class="mb-3"
          name="excludeConditionalAccess"
          type="checkbox"
          :label="$t('governance.editTemplate.excludeConditional')" />
      </div>

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

      <!-- Counts -->
      <div class="bg-light p-4 rounded mb-4">
        <h4>
          {{ $t('governance.editTemplate.countTitle') }}
        </h4>
        <p class="mb-3">
          {{ $t('governance.editTemplate.countSubtitle') }}
        </p>
        <BRow align-h="between">
          <BCol
            v-for="count in filteredCounts"
            :data-testid="count.testId"
            :key="count.label"
            :md="Math.floor(12 / filteredCounts.length)">
            <h5 class="mb-0">
              {{ count.label }}
            </h5>
            <h2>
              {{ count.value }}
            </h2>
          </BCol>
        </BRow>
      </div>
    </BContainer>
  </div>
</template>

<script>
import {
  BButton,
  BCard,
  BCol,
  BCollapse,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import {
  cloneDeep,
  debounce,
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
import { getFilterGrantByType } from '@forgerock/platform-shared/src/views/Governance/utils/certification';
import i18n from '@/i18n';
import {
  filterTypes,
  filterTypeMap,
  types,
  typeSpecificFields,
  uiTypeMap,
} from '../../templateTypes';

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
};

export default {
  name: 'What',
  components: {
    BButton,
    BCard,
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
        enableRoleGrant: false,
        excludeConditionalAccess: true,
        excludeRoleBasedAccess: true,
      },
      showAdvanced: false,
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
        || this.formFields.enableRoleGrant;
    },
    errors() {
      const errors = this.anyGrantEnabled ? [] : [i18n.global.t('common.policyValidationMessages.AT_LEAST_ONE_CHECKBOX')];
      this.setFormErrors({ [this.validatedCheckboxName]: errors[0] });
      return errors;
    },
    filteredCounts() {
      const counts = [
        {
          label: this.$t('common.users'),
          value: this.counts.user,
          enabled: !this.eventBased && !this.isEntitlementComposition,
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
          enabled: this.formFields.enableRoleGrant,
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
  },
  created() {
    Object.keys(this.formFields).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
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

    [this.validatedCheckboxName] = findFieldNamesMatchingName('enableAccountGrant', this.formValues);
  },
  methods: {
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
      if (filterComponent === 'FrRoleFilter') return this.formFields.enableRoleGrant;
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
      this.counts = { ...objects };
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
        const grantTypes = getFilterGrantByType(this.formFields.enableAccountGrant, this.formFields.enableEntitlementGrant, this.formFields.enableRoleGrant, this.formFields.enableEntitlementCompositionGrant);
        const filtersClone = cloneDeep(this.filters);

        Object.keys(filtersClone).forEach((key) => {
          if (filtersClone[key] === null) delete filtersClone[key];
        });

        const options = {};
        if (this.formFields.excludeConditionalAccess) options.excludeConditionalAccess = true;
        if (this.formFields.excludeRoleBasedAccess) options.excludeRoleBasedAccess = true;
        if (this.type in uiTypeMapping) options.certificationType = uiTypeMapping[this.type];

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
