<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard v-if="isLoading">
    <FrSpinner class="py-5" />
  </BCard>
  <BCard
    v-else
    :class="noFieldsToShow ? '' : 'fr-run-report-card'"
    :footer-border-variant="noFieldsToShow ? 'white' : 'default'"
    :no-body="noFieldsToShow">
    <BContainer
      class="p-0"
      data-testid="fr-run-report-container">
      <BRow v-if="showTimeframe">
        <BCol md="3">
          {{ $t('reports.tabs.runReport.timeframe.label') }}
        </BCol>
        <BCol md="9">
          <FrTimeframeField
            @end-date-update="endDateModel = $event"
            @start-date-update="startDateModel = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showApplications">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.applications.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-applications"
            :options="applicationOptionsFiltered"
            @input="applicationsModel = $event"
            @search="handleApplicationsSearch" />
        </BCol>
      </BRow>
      <BRow v-if="showOAuthApplications">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.oauth2_applications.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-oauth-applications"
            :options="oAuthApplicationOptionsFiltered"
            :taggable="!_REPORT_FIELDS_CONTROLLER.oauth2_applications.config.viewable"
            @input="oAuthApplicationsModel = $event"
            @search="handleOAuthApplicationsSearch" />
        </BCol>
      </BRow>
      <BRow v-if="showOutcome">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.treeResult.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-outcome"
            :internal-search="true"
            :options="outcomeOptions"
            :placeholder="$t('reports.tabs.runReport.outcome.allOutcomes')"
            @input="outcomeFieldValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showCampaignName">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.campaign_name.label }}
        </BCol>
        <BCol md="9">
          <FrField
            v-model="campaignNameModel"
            class="mb-3"
            name="show-campaign-name"
            type="string"
            :label="_REPORT_FIELDS_CONTROLLER.campaign_name.label" />
        </BCol>
      </BRow>
      <BRow v-if="showCampaignStatus">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.campaign_status.label }}
        </BCol>
        <BCol md="9">
          <FrField
            v-model="campaignStatusFieldValue"
            class="mb-3"
            name="show-campaign-status"
            type="select"
            :options="campaignStatusOptions"
            :placeholder="_REPORT_FIELDS_CONTROLLER.campaign_status.label"
            :searchable="false" />
        </BCol>
      </BRow>
      <BRow v-if="showUsers">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.user_names.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-users"
            :options="usersOptionsFiltered"
            @input="usersModel = $event"
            @search="handleUsersSearch" />
        </BCol>
      </BRow>
      <BRow v-if="showStatus">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.status.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-status"
            :internal-search="true"
            :options="statusOptions"
            :label="$t('reports.tabs.runReport.status.allStatuses')"
            @input="statusFieldValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showJourneys">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.journeyName.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-journeys"
            :internal-search="true"
            :options="journeyOptionsFiltered"
            :taggable="!_REPORT_FIELDS_CONTROLLER.journeyName.config.viewable"
            @input="journeysModel = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showOrgs">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.org_names.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-organizations"
            :options="orgOptionsFiltered"
            @input="organizationsModel = $event"
            @search="handleOrgsSearch" />
        </BCol>
      </BRow>
      <BRow v-if="showRoles">
        <BCol md="3">
          {{ _REPORT_FIELDS_CONTROLLER.roles.label }}
        </BCol>
        <BCol md="9">
          <FrReportsMultiSelect
            class="mb-3"
            data-testid="fr-field-roles"
            :options="rolesOptionsFiltered"
            @input="rolesModel = $event"
            @search="handleRolesSearch" />
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
              :label="parameter.label"
              :placeholder="parameter.type === 'multiselect' ? $t('reports.tabs.runReport.pressEnterToCreateATag') : ''"
              :name="parameter.label"
              :show-no-options="false"
              :show-no-results="false"
              :taggable="true"
              :testid="parameter.label"
              :type="parameter.type" />
          </BCol>
        </BRow>
      </template>
      <BRow v-if="doesNotContainAtLeastOneValidParameter">
        <BCol
          class="text-center mt-4"
          md="12">
          {{ $t('reports.tabs.runReport.errors.noValidParameters') }}
        </BCol>
      </BRow>
    </BContainer>

    <template #footer>
      <div :class="`d-flex justify-content-${noFieldsToShow ? 'between' : 'end'} align-items-center`">
        <p
          v-if="noFieldsToShow"
          class="text-dark m-0 text-capitalize">
          <strong>{{ $t('reports.tabs.runReport.title') }}</strong>
        </p>
        <FrButtonWithSpinner
          data-testid="run-report-button"
          variant="primary"
          :button-text="noFieldsToShow ? $t('reports.tabs.runReport.runNow') : $t('reports.tabs.runReport.title')"
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
const noFieldsToShow = computed(() => {
  const includesRealmAsParameter = _PARAMETER_KEYS.value.includes('realm');

  // Parameters will usually contain 'realm', which is not a field, so this is
  // why we check for less than 2 parameters (meaning realm is the only value).
  if (includesRealmAsParameter) {
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
const oAuthApplicationOptionsFiltered = computed(() => oAuthApplicationOptions.value.map(({ _id }) => _id));
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
 * We output a generic text field for any unexpected parameters
 */
const unmappedParameters = ref([]);
const unmappedParametersModel = computed(() => {
  const payload = {};
  unmappedParameters.value.forEach((parameter) => {
    payload[parameter.label] = {
      payload: { value: parameter.type === 'array' ? [parameter.value] : parameter.value },
    };
  });
  return payload;
});
const unmappedFieldsDisableSubmit = computed(() => {
  if (unmappedParameters.value.length) {
    return !!unmappedParameters.value.filter((parameter) => parameter.value === '').length;
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
const doesNotContainAtLeastOneValidParameter = computed(() => {
  const doesNotHaveMappedParameters = !_PARAMETER_KEYS.value.filter((parameter) => Object.keys(_REPORT_FIELDS_CONTROLLER).includes(parameter)).length;
  const doesNotHaveUnmappedParameters = !unmappedParameters.value.length;
  return doesNotHaveMappedParameters && doesNotHaveUnmappedParameters;
});
const disableSubmit = computed(() => doesNotContainAtLeastOneValidParameter.value
  || timeframeDisableSubmit.value
  || applicationsDisableSubmit.value
  || campaignNameDisableSubmit.value
  || campaignStatusDisableSubmit.value
  || oAuthApplicationsDisableSubmit.value
  || usersDisableSubmit.value
  || orgsDisableSubmit.value
  || rolesDisableSubmit.value
  || journeysDisableSubmit.value
  || unmappedFieldsDisableSubmit.value);

/**
 * Handles async search queries
 * @param {String} term search term
 * @param {Object} field field controller
 * @param {Array} payload field value
 */

async function handleSearch(term, field) {
  const { config, fetch } = field;
  const queryFilter = `${config.fields} sw "${term}"`;
  return fetch(config, queryFilter, 10);
}

async function handleOrgsSearch(term) {
  const field = _REPORT_FIELDS_CONTROLLER.org_names;
  orgOptions.value = await handleSearch(term, field);
}

async function handleApplicationsSearch(term) {
  const field = _REPORT_FIELDS_CONTROLLER.applications;
  applicationOptions.value = await handleSearch(term, field);
}

async function handleOAuthApplicationsSearch(term) {
  const isSearchable = _REPORT_FIELDS_CONTROLLER.oauth2_applications.config.viewable;
  const field = _REPORT_FIELDS_CONTROLLER.oauth2_applications;

  if (isSearchable) {
    oAuthApplicationOptions.value = await handleSearch(term, field);
  }
}

async function handleUsersSearch(term) {
  const field = _REPORT_FIELDS_CONTROLLER.user_names;
  usersOptions.value = await handleSearch(term, field);
}

async function handleRolesSearch(term) {
  const field = _REPORT_FIELDS_CONTROLLER.roles;
  rolesOptions.value = await handleSearch(term, field);
}

/**
 * Submit a run report request
 */
async function submitRunReport() {
  const parameters = _PARAMETER_KEYS.value.map((parameter) => {
    const field = _REPORT_FIELDS_CONTROLLER[parameter] || unmappedParametersModel.value[parameter];
    return field ? { [parameter]: field.payload.value } : {};
  });
  const payload = Object.assign({}, ...parameters);

  try {
    isSubmitting.value = true;
    const { id } = await runAnalyticsTemplate(props.templateName, payload);
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
    string: 'string',
    boolean: 'boolean',
    integer: 'number',
  };

  _PARAMETER_KEYS.value = Object.keys(parameters);
  _PARAMETER_KEYS.value.forEach((key) => {
    // We map the template report config parameter keys to the _REPORT_FIELDS_CONTROLLER
    // object so we can decide what fields to show and what information to fetch.
    const field = _REPORT_FIELDS_CONTROLLER[key];

    if (field) {
      const fieldNeedsToFetch = field.fetch;

      // Some fields are not fetchable in enduser, so we need to pass a flag
      // to determine the package and prevent data fetch if user is not under admin.
      if (fieldNeedsToFetch && field.config.viewable !== false) {
        const { config } = field;
        fetchList.push(field.fetch(config, true, 10));
        fetchModelList.push(config.model);
      }
    } else {
      const fieldType = fieldTypeMap[parameters[key].type] || 'string';
      // Any unexpected parameters are shown alongside a corresponding generic text field.
      unmappedParameters.value.push({
        label: key,
        type: fieldType,
        value: fieldType === 'boolean' ? false : '',
      });
    }
  });

  if (fetchList.length) {
    const fetchedData = await Promise.allSettled(fetchList);
    fetchModelList.forEach((dataModel, index) => { dataModel.value = fetchedData[index].value; });
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
