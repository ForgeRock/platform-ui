<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

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
      <template v-if="Object.keys(parameters).length">
        <BRow
          v-for="(field, fieldKey) in parameters"
          :key="fieldKey">
          <BCol
            md="3"
            :data-testid="`label-${field.label}`">
            {{ field.label }}
          </BCol>
          <BCol md="9">
            <FrTimeframeField
              v-if="field.component === 'FrTimeframeField'"
              :label="field.label"
              @end-date-update="parameters.endDate.payload = $event"
              @start-date-update="parameters.startDate.payload = $event" />
            <FrReportsMultiSelect
              v-else-if="field.component === 'FrReportsMultiSelect'"
              class="mb-3"
              :data-testid="field.testId"
              :internal-search="!!field.config.internalSearch"
              :label="field.label"
              :options="field.config.model"
              :single-selection="field.config.singleSelection"
              :taggable="field.config.canFetch === false || field.config.taggable"
              @input="field.payload = $event"
              @search="searchDebounce($event, fieldKey)" />
            <!-- Unmapped parameters -->
            <FrField
              v-else-if="field.component === 'FrField'"
              v-model="field.payload"
              class="mb-3"
              :label="field.type === 'multiselect' && !field.payload.length
                ? $t('reports.tabs.runReport.pressEnterToCreateATag')
                : (field.placeholder || field.label)"
              :placeholder="field.type === 'multiselect' ? $t('reports.tabs.runReport.pressEnterToCreateATag') : field.placeholder"
              :name="field.label"
              :options="field.enums || []"
              :show-no-options="false"
              :show-no-results="false"
              :taggable="field.type !== 'select'"
              :testid="field.label"
              :type="field.type" />
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
          :disabled="isSubmitting"
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
 * The main purpose for this component is to allow an admin to generate
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
 * select options. The _PARAMETERS_CONTROLLER object is responsible for determining
 * whether to fetch and where to model data.
 *
 * Fields that are not mapped in the _PARAMETERS_CONTROLLER will be shown
 * alongside a generic field using the <FrField> component with a non-translatable
 * label using the parameter key.
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
const parameters = ref({});
const reportHasNoParameters = computed(() => {
  const parameterKeys = Object.keys(parameters.value);
  const includesRealmAsParameter = parameterKeys.includes('realm');
  // For pre-packaged (out-of-the-box) reports, parameters will usually contain
  // 'realm', which is not a field, so this is why we check for less than two
  // parameters (meaning realm is the only value).
  if (props.isPrePackagedReport && includesRealmAsParameter) {
    return parameterKeys.length < 2;
  }
  return parameterKeys.length < 1;
});

/**
 * CONTROLLER
 * @description
 * Handles data fetching and data modeling.
 */
const {
  _PARAMETERS_CONTROLLER,
  fieldTypeMap,
  UnmappedParametersSchema,
} = useRunReport();

/**
 * Handles async search queries
 * @param {String} term search term
 * @param {String} field field controller name
 * @param {Array} payload field value
 */
async function handleSearch(term, field) {
  const { config } = parameters.value[field];
  const isSearchable = config && config.fetch && config.canFetch !== false;

  if (isSearchable) {
    const queryFilter = `${config.fields} sw "${term}"`;
    const response = await config.fetch(config, queryFilter, 10);
    config.model = config.mutation ? config.mutation(response) : response;
  }
}
const searchDebounce = debounce(handleSearch, 500);

/**
 * Submit a run report request
 */
async function submitRunReport() {
  const parametersPayload = Object.keys(parameters.value).map((parameter) => {
    const { mutation, payload } = parameters.value[parameter];
    return { [parameter]: mutation ? mutation(payload) : payload };
  });
  // Merges the payload list into a single object
  const payload = Object.assign({}, ...parametersPayload);

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
  const { parameters: configParameters } = reportConfig;
  const configParameterKeys = configParameters ? Object.keys(configParameters) : [];
  const fetchList = [];

  if (configParameterKeys.length) {
    parameters.value = configParameterKeys.map((key) => {
      // We map the template report config parameter keys to the
      // _PARAMETERS_CONTROLLER object so we can decide what fields
      // to show and what information to fetch for a pre-packaged
      // (out-of-the-box) report.
      const mappedFieldSchema = _PARAMETERS_CONTROLLER[key];

      if (props.isPrePackagedReport && mappedFieldSchema) {
        const { config } = mappedFieldSchema;
        // Some fields are not fetchable in enduser, so we pass
        // a flag in the controller schema to determine the package
        // and prevent data fetch if user is not under the admin package.
        if (config && config.fetch && config.canFetch !== false) {
          fetchList.push({ key, request: config.fetch(config, true, 10) });
        }
        return {
          // Important to keep in mind that we should only attempt to map fields
          // for pre-packaged (out-of-the-box) reports, otherwise we run the
          // risk of parameter name collision from a custom report that has a
          // parameter with the same name as a pre-packaged report parameter.
          [key]: mappedFieldSchema,
        };
      }

      // Any parameters not recognized by the parameters controller will be
      // shown as a generic field using our internal <FrField> component.
      const {
        type = 'string',
        enum: enumList = [],
        label = key,
        description: placeholder = '',
      } = configParameters[key];
      const configFieldType = enumList.length && type === 'string' ? 'select' : type;
      const mappedFieldType = fieldTypeMap[configFieldType];
      let payload = '';

      if (mappedFieldType === 'boolean') payload = false;
      if (mappedFieldType === 'multiselect') payload = [];
      if (mappedFieldType === 'number') payload = 0;

      return {
        [key]: new UnmappedParametersSchema({
          component: 'FrField',
          label,
          placeholder,
          type: mappedFieldType,
          payload,
          // conditional properties
          ...(enumList.length && { enums: UnmappedParametersSchema.enumMutation(enumList) }),
          ...(mappedFieldType === 'date' && { mutation: UnmappedParametersSchema.dateMutation }),
        }),
      };
    }).reduce((a, c) => ({ ...a, ...c }), {}); // Merges the array of objects into a single object
  }

  if (fetchList.length) {
    const fetchedData = await Promise.allSettled(fetchList.map((item) => item.request));

    fetchList.forEach((item, index) => {
      const { status, value } = fetchedData[index];
      const { config } = parameters.value[item.key];
      if (status === 'fulfilled') {
        config.model = config.mutation ? config.mutation(value) : value;
      }
    });
  }
}

/**
 * INITIALIZE
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
