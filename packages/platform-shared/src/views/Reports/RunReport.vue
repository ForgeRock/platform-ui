<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard v-if="isLoading">
    <FrSpinner class="py-5" />
  </BCard>
  <BCard
    v-else
    :class="reportHasNoParameters ? '' : 'fr-run-report-card'"
    :footer-border-variant="reportHasNoParameters ? 'white' : 'default'"
    :no-body="reportHasNoParameters">
    <BContainer
      class="p-0"
      data-testid="fr-run-report-container">
      <BRow v-if="isPrePackagedReport && showTimeframe">
        <BCol md="3">
          {{ $t('reports.tabs.runReport.timeframe.label') }}
        </BCol>
        <BCol md="9">
          <FrTimeframeField
            :label="$t('reports.tabs.runReport.timeframe.label')"
            @end-date-update="endDateModel = $event"
            @start-date-update="startDateModel = $event" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showApplications">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.applications.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-applications"
            :label="_REPORT_FIELDS_CONTROLLER.applications.label"
            :options="applicationOptionsFiltered"
            :taggable="fieldIsTaggable('applications')"
            @input="applicationsModel = $event"
            @search="searchDebounce($event, 'applications')" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showOAuthApplications">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.oauth2_applications.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-oauth-applications"
            :label="_REPORT_FIELDS_CONTROLLER.oauth2_applications.label"
            :options="oAuthApplicationOptionsFiltered"
            :taggable="fieldIsTaggable('oauth2_applications')"
            @input="oAuthApplicationsModel = $event"
            @search="searchDebounce($event, 'oauth2_applications')" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showOutcome">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.treeResult.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-outcome"
            :internal-search="true"
            :label="_REPORT_FIELDS_CONTROLLER.treeResult.label"
            :options="outcomeOptions"
            :placeholder="$t('reports.tabs.runReport.outcome.allOutcomes')"
            @input="outcomeFieldValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showCampaignName">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.campaign_name.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="show-campaign-status"
            :internal-search="true"
            :label="_REPORT_FIELDS_CONTROLLER.campaign_name.label"
            :options="campaignNameOptionsFiltered"
            :single-selection="true"
            :taggable="true"
            @input="campaignNameModel = $event[0]" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showCampaignStatus">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.campaign_status.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-campaign-status"
            :internal-search="true"
            :label="_REPORT_FIELDS_CONTROLLER.campaign_status.label"
            :options="campaignStatusOptions"
            :single-selection="true"
            :taggable="true"
            @input="campaignStatusFieldValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showUsers">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.user_names.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-users"
            :label="_REPORT_FIELDS_CONTROLLER.user_names.label"
            :options="usersOptionsFiltered"
            :taggable="fieldIsTaggable('user_names')"
            @input="usersModel = $event"
            @search="searchDebounce($event, 'user_names')" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showStatus">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.status.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-status"
            :internal-search="true"
            :label="_REPORT_FIELDS_CONTROLLER.status.label"
            :options="statusOptions"
            @input="statusFieldValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showJourneys">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.journeyName.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-journeys"
            :internal-search="true"
            :label="_REPORT_FIELDS_CONTROLLER.journeyName.label"
            :options="journeyOptionsFiltered"
            :taggable="fieldIsTaggable('journeyName')"
            @input="journeysModel = $event" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showOrgs">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.org_names.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-organizations"
            :label="_REPORT_FIELDS_CONTROLLER.org_names.label"
            :options="orgOptionsFiltered"
            :taggable="fieldIsTaggable('org_names')"
            @input="organizationsModel = $event"
            @search="searchDebounce($event, 'org_names')" />
        </BCol>
      </BRow>
      <BRow v-if="isPrePackagedReport && showRoles">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.roles.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-roles"
            :label="_REPORT_FIELDS_CONTROLLER.roles.label"
            :options="rolesOptionsFiltered"
            :taggable="fieldIsTaggable('roles')"
            @input="rolesModel = $event"
            @search="searchDebounce($event, 'roles')" />
        </BCol>
      </BRow>
      <template v-if="unmappedParameters.length">
        <BRow
          v-for="(parameter) in unmappedParameters"
          :key="parameter.label">
          <BCol
            md="3"
            :data-testid="`label-${parameter.label}`">
            {{ parameter.label }}
          </BCol>
          <BCol md="9">
            <FrField
              v-model="parameter.value"
              class="mb-3"
              :label="parameter.type === 'multiselect' && !parameter.value.length
                ? $t('reports.tabs.runReport.pressEnterToCreateATag')
                : (parameter.placeholder || parameter.label)"
              :placeholder="parameter.type === 'multiselect' ? $t('reports.tabs.runReport.pressEnterToCreateATag') : parameter.placeholder"
              :name="parameter.label"
              :options="parameter.enums || []"
              :show-no-options="false"
              :show-no-results="false"
              :taggable="parameter.type !== 'select'"
              :testid="parameter.label"
              :type="parameter.type" />
          </BCol>
        </BRow>
      </template>
    </BContainer>

    <template #footer>
      <div :class="`d-flex justify-content-${reportHasNoParameters ? 'between' : 'end'} align-items-center`">
        <p
          v-if="reportHasNoParameters"
          class="text-dark m-0 text-capitalize">
          <strong>{{ $t('reports.tabs.runReport.title') }}</strong>
        </p>
        <FrButtonWithSpinner
          data-testid="run-report-button"
          variant="primary"
          :button-text="reportHasNoParameters ? $t('reports.tabs.runReport.runNow') : $t('reports.tabs.runReport.title')"
          :disabled="disableSubmit || isSubmitting"
          :spinner-text="$t('common.submitting')"
          :show-spinner="isSubmitting"
          @click="submitRunReport" />
      </div>
    </template>
  </BCard>
</template>

<script setup>
/**
 * @description
 * The main purpose for this functionality is to allow an admin to generate
 * an analytics report for various pre-templated platform statistics.
 *
 * Each report requires specific information in order to be able to submit
 * a valid export request. For example, if you want to know how many active,
 * inactive, blocked users are on the platform, there must be the ability to
 * choose specific users as well as the status type to query against.
 *
 * At the moment, there are a number of fields that are associated with the
 * necessary data to generate all the possible analytics reports. The API returns
 * a config for each report, which gives us the necessary parameters to reveal
 * the required fields for generating a valid report request.
 *
 * Some fields have static options, while others need to fetch data to populate
 * options. The _REPORT_FIELDS_CONTROLLER object is responsible for determining
 * the information to fetch and where to model the data.
 *
 * Fields that are not mapped in the _REPORT_FIELDS_CONTROLLER will be shown
 * alongside a text field with a non-translatable label using the parameter key.
 */
import {
  computed,
  ref,
  watch,
} from 'vue';
import {
  BCard,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import { debounce } from 'lodash';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { runAnalyticsTemplate } from '@forgerock/platform-shared/src/api/AutoApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrReportsMultiSelect from './fields/ReportsMultiSelect';
import FrTimeframeField from './fields/TimeframeField';
import useRunReport from './composables/RunReport';
import i18n from '@/i18n';

const emit = defineEmits(['update-tab']);
const props = defineProps({
  reportConfig: {
    type: Object,
    default: null,
  },
  templateName: {
    type: String,
    default: '',
  },
  templateState: {
    type: String,
    default: '',
  },
  isPrePackagedReport: {
    type: Boolean,
    default: true,
  },
});

/**
 * LOCALS
 */
const isLoading = ref(true);
const isSubmitting = ref(false);

/**
 * GLOBALS
 */
const _PARAMETER_KEYS = ref([]);
const reportHasNoParameters = computed(() => {
  const includesRealmAsParameter = _PARAMETER_KEYS.value.includes('realm');

  // For out-of-the-box reports, parameters will usually contain 'realm',
  // which is not a field, so this is why we check for less than 2 parameters
  // (meaning realm is the only value).
  if (includesRealmAsParameter && props.isPrePackagedReport) {
    return _PARAMETER_KEYS.value.length < 2;
  }
  return _PARAMETER_KEYS.value.length < 1;
});

/**
 * Timeframe field
 */
const startDateModel = ref('');
const endDateModel = ref('');
const showTimeframe = computed(() => _PARAMETER_KEYS.value.includes('endDate') || _PARAMETER_KEYS.value.includes('startDate'));
const timeframeDisableSubmit = computed(() => {
  const isShowing = showTimeframe.value;
  const doesNotHaveTimeframeValues = !startDateModel.value || !endDateModel.value;
  return isShowing && doesNotHaveTimeframeValues;
});

/**
 * All Applications field
 */
const applicationsModel = ref([]);
const applicationOptions = ref([]);
const applicationOptionsFiltered = computed(() => applicationOptions.value.map(({ name }) => name));
const showApplications = computed(() => _PARAMETER_KEYS.value.includes('applications'));
const applicationsDisableSubmit = computed(() => (showApplications.value && !applicationsModel.value.length));

/**
 * OAuth Applications field
 */
const oAuthApplicationsModel = ref([]);
const oAuthApplicationOptions = ref([]);
const oAuthApplicationOptionsFiltered = computed(() => {
  const options = oAuthApplicationOptions.value;
  if (options.length) {
    return options.map(({ _id }) => _id);
  }
  return [];
});
const showOAuthApplications = computed(() => _PARAMETER_KEYS.value.includes('oauth2_applications'));
const oAuthApplicationsDisableSubmit = computed(() => (showOAuthApplications.value && !oAuthApplicationsModel.value.length));

/**
 * Outcome field
 */
const outcomeOptions = [i18n.global.t('common.successful'), i18n.global.t('common.failed'), i18n.global.t('common.continue')];
const outcomeFieldValue = ref([]);
const showOutcome = computed(() => _PARAMETER_KEYS.value.includes('treeResult'));
const outcomeModel = computed(() => {
  const fieldValue = outcomeFieldValue.value;
  const payload = fieldValue.length ? fieldValue : outcomeOptions;
  return payload.map((value) => value.toUpperCase());
});

/**
 * Campaign Name field
 */
const campaignNameModel = ref('');
const campaignNameOptions = ref([]);
const campaignNameOptionsFiltered = computed(() => {
  const options = campaignNameOptions.value;
  if (options.length) {
    return campaignNameOptions.value.map(({ name }) => name);
  }
  return [];
});
const showCampaignName = computed(() => _PARAMETER_KEYS.value.includes('campaign_name'));
const campaignNameDisableSubmit = computed(() => !!(showCampaignName.value && !campaignNameModel.value));

/**
 * Campaign Status field
 */
const campaignStatusOptionsMap = {
  [i18n.global.t('reports.tabs.runReport.campaignStatus.inProgress')]: 'in-progress',
  [i18n.global.t('reports.tabs.runReport.campaignStatus.signedOff')]: 'signed-off',
};
const campaignStatusOptions = Object.keys(campaignStatusOptionsMap);
const campaignStatusFieldValue = ref('');
const showCampaignStatus = computed(() => _PARAMETER_KEYS.value.includes('campaign_status'));
const campaignStatusModel = computed(() => campaignStatusOptionsMap[campaignStatusFieldValue.value]);
const campaignStatusDisableSubmit = computed(() => !!(showCampaignStatus.value && !campaignStatusModel.value));

/**
 * Users field
 */
const usersModel = ref([]);
const usersOptions = ref([]);
const showUsers = computed(() => _PARAMETER_KEYS.value.includes('user_names'));
const usersOptionsFiltered = computed(() => usersOptions.value.map(({ userName }) => userName));
const usersDisableSubmit = computed(() => !!(showUsers.value && !usersModel.value.length));

/**
 * Status field
 */
const statusOptionsMap = {
  [i18n.global.t('reports.tabs.runReport.status.active')]: 'active',
  [i18n.global.t('reports.tabs.runReport.status.inactive')]: 'inactive',
  [i18n.global.t('reports.tabs.runReport.status.blocked')]: 'blocked',
};

const statusOptions = Object.keys(statusOptionsMap);
const statusFieldValue = ref([]);
const statusModel = computed(() => {
  const payload = statusFieldValue.value.length ? statusFieldValue.value : statusOptions;
  return payload.map((value) => value.toLowerCase());
});
const showStatus = computed(() => _PARAMETER_KEYS.value.includes('status') || _PARAMETER_KEYS.value.includes('accountStatus'));

/**
 * Journeys field
 */
const journeysModel = ref([]);
const journeyOptions = ref([]);
const journeyOptionsFiltered = computed(() => journeyOptions.value.map(({ _id }) => _id));
const showJourneys = computed(() => _PARAMETER_KEYS.value.includes('journeyName') || _PARAMETER_KEYS.value.includes('treeName'));
const journeysDisableSubmit = computed(() => showJourneys.value && !journeysModel.value.length);

/**
 * Organizations field
 */
const organizationsModel = ref([]);
const orgOptions = ref([]);
const orgOptionsFiltered = computed(() => orgOptions.value.map(({ name }) => name));
const showOrgs = computed(() => _PARAMETER_KEYS.value.includes('org_names'));
const orgsDisableSubmit = computed(() => showOrgs.value && !organizationsModel.value.length);

/**
 * Roles field
 */
const rolesModel = ref([]);
const rolesOptions = ref([]);
const rolesOptionsFiltered = computed(() => rolesOptions.value.map(({ name }) => name));
const showRoles = computed(() => _PARAMETER_KEYS.value.includes('roles'));
const rolesDisableSubmit = computed(() => showRoles.value && !rolesModel.value.length);

/**
 * Unmapped parameter fields.
 * We output a generic field for any unexpected parameters
 */
const unmappedParameters = ref([]);
const unmappedParametersModel = computed(() => {
  const payload = {};

  unmappedParameters.value.forEach((parameter) => {
    let parameterValue = parameter.value;

    if (parameter.type === 'date') {
      const dateValue = new Date(parameterValue);
      parameterValue = dateValue.toISOString();
    }

    payload[parameter.name] = {
      payload: { value: parameterValue },
    };
  });

  return payload;
});
const unmappedFieldsDisableSubmit = computed(() => {
  if (unmappedParameters.value.length) {
    return !!unmappedParameters.value.filter((parameter) => {
      if (parameter.type === 'boolean') {
        // a boolean field will always have a value
        return false;
      }
      if (parameter.type === 'number') {
        return typeof parameter.value !== 'number';
      }
      return !parameter.value.length;
    }).length;
  }
  return false;
});

/**
 * CONTROLLER
 * @description
 * Handles data fetching and data modeling.
 */
const {
  _REPORT_FIELDS_CONTROLLER,
} = useRunReport(
  applicationsModel,
  applicationOptions,
  campaignNameModel,
  campaignNameOptions,
  campaignStatusModel,
  endDateModel,
  journeysModel,
  journeyOptions,
  oAuthApplicationOptions,
  oAuthApplicationsModel,
  organizationsModel,
  orgOptions,
  outcomeModel,
  rolesModel,
  rolesOptions,
  startDateModel,
  statusModel,
  usersModel,
  usersOptions,
);

/**
 * Submit button disable conditions
 */

const disableSubmit = computed(() => {
  if (props.isPrePackagedReport) {
    return timeframeDisableSubmit.value
    || applicationsDisableSubmit.value
    || campaignNameDisableSubmit.value
    || campaignStatusDisableSubmit.value
    || oAuthApplicationsDisableSubmit.value
    || usersDisableSubmit.value
    || orgsDisableSubmit.value
    || rolesDisableSubmit.value
    || journeysDisableSubmit.value
    || unmappedFieldsDisableSubmit.value;
  }
  return unmappedFieldsDisableSubmit.value;
});

/**
 * Determines if a field should allow user input tags
 * @param {String} field field controller name
 */
function fieldIsTaggable(field) {
  const { config } = _REPORT_FIELDS_CONTROLLER[field];
  return config.viewable === false;
}

/**
 * Handles async search queries
 * @param {String} term search term
 * @param {String} field field controller name
 * @param {Array} payload field value
 */
async function handleSearch(term, field) {
  const { config, fetch } = _REPORT_FIELDS_CONTROLLER[field];
  const isSearchable = config.viewable !== false;
  const queryFilter = `${config.fields} sw "${term}"`;

  if (isSearchable) {
    config.model.value = await fetch(config, queryFilter, 10);
  }
}
const searchDebounce = debounce(handleSearch, 500);

/**
 * Submit a run report request
 */
async function submitRunReport() {
  const parameters = _PARAMETER_KEYS.value.map((parameter) => {
    const field = props.isPrePackagedReport
      ? (_REPORT_FIELDS_CONTROLLER[parameter] || unmappedParametersModel.value[parameter])
      : unmappedParametersModel.value[parameter];
    return field ? { [parameter]: field.payload.value } : {};
  });
  const payload = Object.assign({}, ...parameters);

  try {
    isSubmitting.value = true;
    const { id } = await runAnalyticsTemplate(props.templateName, props.templateState, payload);
    emit('update-tab', 'report-history', id);
    displayNotification('success', i18n.global.t('reports.tabs.runReport.success'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.tabs.runReport.errors.errorRunningReport'));
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Sets the report fields based on the template parameters that we get from the API.
 * @param {Object} reportConfig Report template config parameters
 */
async function setReportFields(reportConfig) {
  const { parameters } = reportConfig;
  const fetchList = [];
  const fetchModelList = [];
  const fieldTypeMap = {
    array: 'multiselect',
    boolean: 'boolean',
    date: 'date',
    float: 'number',
    integer: 'number',
    select: 'select',
    string: 'string',
  };

  _PARAMETER_KEYS.value = parameters ? Object.keys(parameters) : [];
  _PARAMETER_KEYS.value.forEach((key) => {
    // We map the template report config parameter keys to the _REPORT_FIELDS_CONTROLLER
    // object so we can decide what fields to show and what information to fetch.
    const field = _REPORT_FIELDS_CONTROLLER[key];

    if (field && props.isPrePackagedReport !== false) {
      const fieldNeedsToFetch = field.fetch;

      // Some fields are not fetchable in enduser, so we need to pass a flag
      // to determine the package and prevent data fetch if user is not under admin.
      if (fieldNeedsToFetch && field.config.viewable !== false) {
        const { config } = field;
        fetchList.push(field.fetch(config, true, 10));
        fetchModelList.push(config.model);
      }
    } else {
      const parameterType = parameters[key].type;
      const fieldTypeMapValue = parameters[key].enum && parameterType === 'string'
        ? 'select'
        : parameterType || 'string';
      const fieldType = fieldTypeMap[fieldTypeMapValue];
      const enumSelectOptions = parameters[key].enum
        ? parameters[key].enum.map(({ name, value }) => ({ text: name, value }))
        : undefined;

      // Any unexpected parameters are shown alongside a corresponding field.
      unmappedParameters.value.push({
        name: key,
        label: parameters[key].label || key,
        placeholder: parameters[key].description || '',
        type: fieldType,
        value: fieldType === 'boolean' ? false : '',
        ...(enumSelectOptions && { enums: enumSelectOptions }),
      });
    }
  });

  if (fetchList.length) {
    const fetchedData = await Promise.allSettled(fetchList);

    fetchModelList.forEach((dataModel, index) => {
      const { status, value } = fetchedData[index];
      if (status === 'fulfilled') {
        dataModel.value = value;
      }
    });
  }
}

/**
 * INIT
 */
async function initialize(config) {
  await setReportFields(config);
  isLoading.value = false;
}

/**
 * WATCHERS
 */
watch(() => props.reportConfig, (config) => {
  if (config) {
    initialize(config);
  }
});

/**
 * START
 */
(() => {
  if (props.reportConfig) {
    initialize(props.reportConfig);
  }
})();
</script>

<style lang="scss" scoped>
  .fr-run-report-card {
    min-height: 310px;
  }
</style>
