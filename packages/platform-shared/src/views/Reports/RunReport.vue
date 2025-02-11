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
      v-if="Object.keys(parameters).length"
      class="p-0"
      data-testid="fr-run-report-container">
      <template
        v-for="(field, fieldKey) in parameters"
        :key="fieldKey">
        <BRow
          v-if="field.component"
          class="mb-3">
          <BCol
            class="d-none d-md-flex align-items-center fr-run-report-label "
            md="3"
            :data-testid="`label-${field.label}`">
            {{ field.label }}
          </BCol>
          <BCol md="9">
            <FrTimeframeField
              v-if="field.component === 'FrTimeframeField'"
              :label="field.label"
              @end-date-update="parameters.endDate.model = $event"
              @start-date-update="parameters.startDate.model = $event" />
            <FrField
              v-else-if="field.component === 'FrField'"
              v-model="field.model"
              :description="field.description"
              :internal-search="field.internalSearch"
              :label="field.label"
              :name="field.label"
              :options="field.enums || field.request?.data || field.options || []"
              :show-no-results="true"
              :taggable="field.taggable"
              :testid="field.testId"
              :type="field.type"
              @search-change="searchDebounce($event, fieldKey)"
              @tag="field.selectOptionsSetter($event)"
              open-direction="bottom">
              <template
                v-if="field.type === 'multiselect'"
                #tag="{ option, remove }">
                <span class="multiselect__tag">
                  <BMedia
                    no-body
                    class="d-flex align-items-center">
                    <BMediaBody class="pl-1">
                      <div class="text-dark">
                        {{ option.text }}
                      </div>
                    </BMediaBody>
                  </BMedia>
                  <BButton
                    class="border-0 p-0 bg-transparent fr-close-icon"
                    @click="remove(option)">
                    <FrIcon name="close" />
                  </BButton>
                </span>
              </template>
              <template #option="{ option }">
                <BMedia no-body>
                  <BMediaBody class="pl-1">
                    <div class="mb-1 text-dark">
                      {{ option.text }}
                    </div>
                  </BMediaBody>
                </BMedia>
              </template>
            </FrField>
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
 * The main purpose for this component is to allow an admin to generate an
 * analytics report with customized parameters that get interpreted as UI fields.
 *
 * The API provides a report configuration object that contains the necessary
 * data to generate report fields. A parameter can be a standalone field such
 * as a text, number, boolean, select or multiselect input, and can automatically
 * fetch mapped data to populate options into a select or multi-select field.
 *
 * The ParametersSchema generates a list of parameters, serving as the
 * configuration source to determine field types and attributes. It also
 * specifies whether data should be fetched and where the data should be modeled.
 */
import {
  computed,
  ref,
  reactive,
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
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrTimeframeField from './TimeframeField';
import ParametersSchema from './utils/ParametersSchema';
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
    default: false,
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
const parameters = reactive({});
const reportHasNoParameters = computed(() => Object.keys(parameters).length < 1);

/**
 * Handles async search queries
 * @param {String} term search term
 * @param {String} key parameter key name
 */
async function handleSearch(term, key) {
  const { request, internalSearch } = parameters[key];

  if (request && internalSearch === false) {
    const data = await request.fetchRequestData(term);
    const mutatedData = request.mutateRequestData(data);
    request.data = parameters[key].selectOptionsDataHandler(mutatedData);
  }
}
const searchDebounce = debounce(handleSearch, 500);

/**
 * Submit a run report request
 */
async function submitRunReport() {
  const parametersPayload = Object.keys(parameters).map((key) => parameters[key].payload());
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

async function fetchFieldData(fields) {
  const fetchList = [];

  Object.keys(fields).forEach((key) => {
    const { request } = fields[key];
    if (request) fetchList.push({ key, fetch: request.fetchRequestData() });
  });

  if (fetchList.length) {
    const fetchedData = await Promise.allSettled(fetchList.map(({ fetch }) => fetch));

    fetchList.forEach(({ key }, index) => {
      const { status, value } = fetchedData[index];
      const { request } = fields[key];

      if (status === 'fulfilled') {
        const mutatedData = request.mutateRequestData(value);
        request.data = mutatedData;
        // backend requirement to inject value into amconfig field on load
        if (request.entity === 'amconfig' && request.attribute === 'abandonedTimeout') {
          fields[key].model = mutatedData;
        }
      }
    });
  }
}

/**
 * INITIALIZE
 */
function initialize(config) {
  // Object.assign preserves reactivity instead of assigning directly
  Object.assign(parameters, ParametersSchema(config, props.isPrePackagedReport));
  fetchFieldData(parameters);
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

  .fr-close-icon {
  position: absolute;
  top: -2px;
  right: 4px;

  span {
    color: $gray-600;
    font-size: 11px;
    font-weight: 700;

    &:hover {
      color: $black;
    }
  }
}

.fr-run-report-label{
  height: 48.5px;
}
</style>
