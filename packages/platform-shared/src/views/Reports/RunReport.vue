<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

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
          {{ $t('common.applications') }}
        </BCol>
        <BCol md="9">
          <FrApplicationsField
            :relationship-property="applicationsRelationshipProperty"
            @applications-update="applicationsModel = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showOutcome">
        <BCol md="3">
          {{ $t('common.outcome') }}
        </BCol>
        <BCol md="9">
          <FrRunReportCustomTagField
            name="outcome"
            :field-options="outcomeOptions"
            :label="$t('common.outcome')"
            :placeholder="$t('reports.tabs.runReport.outcome.allOutcomes')"
            @field-value-update="outcomeFieldValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showUsers">
        <BCol md="3">
          {{ $t('common.users') }}
        </BCol>
        <BCol md="9">
          <FrUsersField
            data-testid="fr-field-users"
            :relationship-property="membersRelationshipProperty"
            @relationship-property-update="usersValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showStatus">
        <BCol md="3">
          {{ $t('reports.tabs.runReport.status.label') }}
        </BCol>
        <BCol md="9">
          <FrRunReportCustomTagField
            name="status"
            :field-options="statusOptions"
            :label="$t('reports.tabs.runReport.status.label')"
            :placeholder="$t('reports.tabs.runReport.status.allStatuses')"
            @field-value-update="statusFieldValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showEventTypes">
        <BCol md="3">
          {{ $t('common.events') }}
        </BCol>
        <BCol md="9">
          <FrRunReportField
            name="events"
            :field-options="eventTypeOptions"
            :label="$t('common.events')"
            :placeholder="$t('reports.tabs.runReport.events.allEventTypes')"
            @field-value-update="eventTypesValue = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showJourneys">
        <BCol md="3">
          {{ $t('common.journeys') }}
        </BCol>
        <BCol md="9">
          <FrRunReportField
            name="journeys"
            :field-options="journeyOptions"
            :label="$t('common.journeys')"
            :placeholder="$t('reports.tabs.runReport.journeys.selectJourneys')"
            @field-value-update="journeysModel = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showOrgs">
        <BCol md="3">
          {{ $t('reports.tabs.runReport.organizations') }}
        </BCol>
        <BCol md="9">
          <FrRunReportField
            name="organizations"
            :field-options="organizationOptions"
            :label="$t('reports.tabs.runReport.organizations')"
            :placeholder="$t('reports.tabs.runReport.organizations')"
            @field-value-update="organizationsModel = $event" />
        </BCol>
      </BRow>
      <BRow v-if="showRoles">
        <BCol md="3">
          {{ $t('reports.tabs.runReport.roles') }}
        </BCol>
        <BCol md="9">
          <FrRunReportField
            name="roles"
            :field-options="roleOptions"
            :label="$t('reports.tabs.runReport.roles')"
            :placeholder="$t('reports.tabs.runReport.roles')"
            @field-value-update="rolesModel = $event" />
        </BCol>
      </BRow>
      <template v-if="unmappedParameters.length">
        <BRow
          v-for="(parameter) in unmappedParameters"
          :key="parameter.name">
          <BCol
            md="3"
            :data-testid="`label-${parameter.name}`">
            {{ parameter.name }}
          </BCol>
          <BCol md="9">
            <FrField
              v-model="parameter.value"
              class="mb-3"
              type="string"
              :label="parameter.name"
              :name="parameter.name"
              :testid="parameter.name" />
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
 * At the moment, there are a total of (9) fields that are associated with the
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
import FrTimeframeField from './fields/TimeframeField';
import FrUsersField from './fields/ReportsRelationshipEditField';
import FrApplicationsField from './fields/ApplicationsField';
import FrRunReportField from './fields/DefaultRunReportField';
import FrRunReportCustomTagField from './fields/DefaultRunReportCustomTagField';
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
 * (1) Timeframe field
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
 * (2) Applications field
 */
const applicationsModel = ref('');
const applicationsRelationshipProperty = ref({});
const showApplications = computed(() => _PARAMETER_KEYS.value.includes('applications'));
const applicationsDisableSubmit = computed(() => (showApplications.value && !applicationsModel.value));

/**
 * (3) Outcome field
 */
const outcomeOptions = [
  { label: i18n.t('common.successful'), color: 'success', icon: 'check' },
  { label: i18n.t('common.failed'), color: 'danger', icon: 'block' },
  { label: i18n.t('common.continue'), color: 'muted', icon: 'arrow_forward' },
];
const outcomeFieldValue = ref([]);
const showOutcome = computed(() => _PARAMETER_KEYS.value.includes('treeResult'));
const outcomeModel = computed(() => {
  const fieldValue = outcomeFieldValue.value;
  const payload = fieldValue.length ? fieldValue : outcomeOptions;
  return payload.map(({ label }) => label.toUpperCase());
});

/**
 * (4) Users field
 */
const usersValue = ref([]);
const membersRelationshipProperty = ref({});
const showUsers = computed(() => _PARAMETER_KEYS.value.includes('user_names'));
const usersModel = computed(() => usersValue.value.map(({ userName }) => userName));
const usersDisableSubmit = computed(() => !!(showUsers.value && !usersModel.value.length));

/**
 * (5) Status field
 */
const statusOptions = [
  { label: i18n.t('reports.tabs.runReport.status.active'), color: 'success', icon: 'check' },
  { label: i18n.t('reports.tabs.runReport.status.inactive'), color: 'muted', icon: 'cancel' },
  { label: i18n.t('reports.tabs.runReport.status.blocked'), color: 'danger', icon: 'block' },
];
const statusFieldValue = ref([]);
const showStatus = computed(() => _PARAMETER_KEYS.value.includes('status') || _PARAMETER_KEYS.value.includes('accountStatus'));
const statusModel = computed(() => {
  const statusArr = statusFieldValue.value.length ? statusFieldValue.value : statusOptions;
  return statusArr.map(({ label }) => label.toLowerCase());
});

/**
 * (6) Events field
 */
const eventTypeOptions = [
  i18n.t('reports.tabs.runReport.events.tokenGrant'),
  i18n.t('reports.tabs.runReport.events.tokenRefresh'),
  i18n.t('common.authorize'),
  i18n.t('reports.tabs.runReport.events.sso'),
];
const eventTypesValue = ref([]);
const showEventTypes = computed(() => _PARAMETER_KEYS.value.includes('events'));
const eventTypesModel = computed(() => (eventTypesValue.value.length ? eventTypesValue.value : eventTypeOptions));

/**
 * (7) Journeys field
 */
const journeyOptions = ref([]);
const journeysModel = ref([]);
const showJourneys = computed(() => _PARAMETER_KEYS.value.includes('journeyName') || _PARAMETER_KEYS.value.includes('treeName'));
const journeysDisableSubmit = computed(() => showJourneys.value && !journeysModel.value.length);

/**
 * (8) Organizations field
 */
const organizationsModel = ref([]);
const organizationOptions = ref([]);
const showOrgs = computed(() => _PARAMETER_KEYS.value.includes('org_names'));
const orgsDisableSubmit = computed(() => showOrgs.value && !organizationsModel.value.length);

/**
 * (9) Roles field
 */
const rolesModel = ref([]);
const roleOptions = ref([]);
const showRoles = computed(() => _PARAMETER_KEYS.value.includes('roles'));
const rolesDisableSubmit = computed(() => showRoles.value && !rolesModel.value.length);

/**
 * (10) Unmapped parameter fields
 * We output a generic text field for any unexpected parameters
 */
const unmappedParameters = ref([]);
const unmappedParametersModel = computed(() => {
  const payload = {};
  unmappedParameters.value.forEach((parameter) => {
    payload[parameter.name] = {
      payload: { value: parameter.type === 'array' ? [parameter.value] : parameter.value },
    };
  });
  return payload;
});
const unmappedFieldsDisableSubmit = computed(() => {
  if (unmappedParameters.value.length) {
    return !!unmappedParameters.value.filter((parameter) => !parameter.value).length;
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
  applicationsRelationshipProperty,
  endDateModel,
  eventTypesModel,
  journeysModel,
  journeyOptions,
  membersRelationshipProperty,
  organizationOptions,
  organizationsModel,
  outcomeModel,
  roleOptions,
  rolesModel,
  startDateModel,
  statusModel,
  usersModel,
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
  || usersDisableSubmit.value
  || orgsDisableSubmit.value
  || rolesDisableSubmit.value
  || journeysDisableSubmit.value
  || unmappedFieldsDisableSubmit.value);

/**
 * ACTIONS
 * @description
 * .Submits a report request
 * .Sets table report fields
 */

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
    displayNotification('success', i18n.t('reports.tabs.runReport.success'));
  } catch (error) {
    showErrorMessage(error, i18n.t('reports.tabs.runReport.errors.errorRunningReport'));
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
        fetchList.push(field.fetch());
        fetchModelList.push(field.config.model);
      }
    } else {
      // Any unexpected parameters are shown alongside a corresponding generic text field.
      unmappedParameters.value.push({
        name: key,
        type: parameters[key].type,
        value: '',
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
