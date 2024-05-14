<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100 d-flex flex-column">
    <FrReportTemplateHeader
      :disable-save="disableTemplateSave || templateDoesNotHaveSelectedColumns"
      :report-state="reportState"
      :is-duplicating="isDuplicating"
      :is-saving="isSavingTemplate"
      :template-name="templateName"
      @delete="bvModal.show('deleteModal')"
      @duplicate="duplicateTemplate(templateId, reportState)"
      @save="saveTemplateFromHeader" />
    <main
      class="d-flex w-100 h-100 overflow-auto"
      role="main">
      <template v-if="templateHasAtLeastOneDataSource">
        <FrReportFieldsTable
          :data-sources="findSettingsObject('entities').definitions"
          :aggregates="findSettingsObject('aggregate').definitions"
          @update-table-entry-label="onUpdateTableEntryLabel"
          @disable-template-save="disableTemplateSave = $event" />
        <FrReportTemplateSettings
          v-model="reportDetails"
          :is-saving="isSavingDefinition"
          :report-settings="reportSettings"
          @delete-data-source="onDeleteDataSource"
          @delete-definition="saveTemplateAndUpdateSettings"
          @delete-parameter="onUpdateParameter"
          @update-definitions="onUpdateDefinitions"
          @set-column-selections="onSetColumnSelections"
          @set-related-data-sources="onSetRelatedDataSources" />
      </template>
      <FrReportAddDataSourceCard
        v-else
        :is-loading="isFetchingTemplate"
        @open-data-source-modal="bvModal.show('report-data-sources-modal')" />
    </main>
    <FrReportDataSourceModal
      :column-checkbox-names="dataSourceColumnCheckboxNames"
      :is-saving="isFetchingEntityColumns"
      :is-testing="isTesting"
      @add-data-source="addDataSource" />
    <FrReportParametersModal
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      :parameter-types="parameterTypeLabels"
      :existing-parameter="definitionBeingEdited.parameters || {}"
      :profile-attributes="profileAttributeNames"
      @update-parameter="onUpdateParameter"
      @hidden="delete definitionBeingEdited.parameters" />
    <FrReportFiltersModal
      :data-source-columns="dataSourceColumns"
      :existing-filter="definitionBeingEdited.filter || {}"
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      :condition-options="reportConditionals"
      :variable-options="filterVariableOptions"
      @get-field-options="fetchFieldOptionsForFilters"
      @update-filter="saveTemplateAndUpdateSettings" />
    <FrReportAggregatesModal
      :aggregate-types="aggregateTypes"
      :aggregate-value-list="aggregateValueList"
      :existing-aggregate="definitionBeingEdited.aggregate || {}"
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      @get-field-options="fetchFieldOptionsForAggregates"
      @update-aggregate="saveTemplateAndUpdateSettings"
      @hidden="delete definitionBeingEdited.aggregate" />
    <FrDeleteModal
      :is-deleting="isDeletingTemplate"
      :is-testing="isTesting"
      :translated-item-type="$t('common.report')"
      @delete-item="deleteTemplate" />
  </div>
</template>

<script setup>
/**
 * @description
 * Main component that gives an admin the ability to create custom platform analytics reports.
 */
import {
  computed,
  nextTick,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import {
  deleteAnalyticsReport,
  duplicateAnalyticsReport,
  getReportTemplates,
  saveAnalyticsReport,
} from '@forgerock/platform-shared/src/api/AutoApi';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { isEqual, startCase } from 'lodash';
import useReportSettings from './composables/ReportSettings';
import useReportParameters from './composables/ReportParameters';
import useReportEntities from './composables/ReportEntities';
import useReportFilters from './composables/ReportFilters';
import useReportAggregates from './composables/ReportAggregates';
import useReportSorting from './composables/ReportSorting';
import FrReportTemplateHeader from './ReportTemplate/ReportTemplateHeader';
import FrReportAddDataSourceCard from './ReportTemplate/ReportAddDataSourceCard';
import FrReportFieldsTable from './ReportTemplate/ReportFieldsTable';
import FrReportTemplateSettings from './ReportTemplate/ReportTemplateSettings';
import FrReportDataSourceModal from './modals/ReportDataSourceModal';
import FrReportParametersModal from './modals/ReportParametersModal';
import FrReportFiltersModal from './modals/ReportFiltersModal';
import FrReportAggregatesModal from './modals/ReportAggregatesModal';
import i18n from '@/i18n';
import { defaultGroups } from './composables/ManagedUsers';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

// Composables
const { bvModal } = useBvModal();
const router = useRouter();
const route = useRoute();
const {
  dataSourceColumnCheckboxNames,
  dataSourceColumns,
  entityDefinitions,
  entitiesPayload,
  fetchReportEntities,
} = useReportEntities();
const {
  parameterDefinitions,
  parameterTypeLabels,
  parametersPayload,
  profileAttributeNames,
} = useReportParameters();
const {
  fetchReportOperators,
  filterDefinitions,
  filterVariableOptions,
  filtersPayload,
  getFieldOptionsForFilters,
  reportConditionals,
} = useReportFilters(
  dataSourceColumns,
  entitiesPayload,
  parametersPayload,
);
const {
  aggregateDefinitions,
  aggregateTypes,
  aggregateValueList,
  aggregatesPayload,
  fetchAggregateTypes,
  getFieldOptionsForAggregates,
} = useReportAggregates(
  entitiesPayload,
  parametersPayload,
  filtersPayload,
);
const {
  sortingDefinitions,
  sortingPayload,
} = useReportSorting();
const {
  findSettingsObject,
  generateNewDefinitions,
  generateNewSettings,
  reportPayload,
  reportSettings,
} = useReportSettings(
  parametersPayload,
  entitiesPayload,
  filtersPayload,
  aggregatesPayload,
  sortingPayload,
);

// Globals
const definitionBeingEdited = ref({});
const disableTemplateSave = ref(true);
const isDeletingTemplate = ref(false);
const isDuplicating = ref(false);
const isFetchingEntityColumns = ref(false);
const isFetchingTemplate = ref(true);
const isSavingDefinition = ref(false);
const isSavingTemplate = ref(false);
const reportDetails = ref({
  name: '',
  description: '',
  report_admin: false,
  report_viewer: false,
  report_owner: false,
  viewers: '',
});
const reportState = route.params.state;
const templateId = route.params.template.toUpperCase();
const templateName = route.params.template.replace(/-/g, ' ');

// Functions
/**
 * Saves the report template
 * @param {Object} settings complete settings template local data
 */
function saveTemplate(settings = reportSettings.value) {
  const payload = reportPayload(settings);
  const groupViewers = defaultGroups.filter((group) => reportDetails.value[group]);

  try {
    return saveAnalyticsReport(templateId, payload, [...reportDetails.value.viewers, ...groupViewers], reportDetails.value.description);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.template.error.errorSavingReport'));
    return error;
  }
}

/**
 * After an entity is selected, entity columns are fetched here.
 * @param {String} dataSourceName entity name
 */
async function addDataSource(dataSourceName) {
  if (dataSourceName) {
    isFetchingEntityColumns.value = true;
    const entityDefinitionsList = await entityDefinitions([{ entity: dataSourceName }]);
    displayNotification('success', i18n.global.t('reports.template.dataSetAdded'));
    // Clear any previously defined parameters and filters since
    // these have an association with the selected data source.
    findSettingsObject('parameters').definitions.splice(0);
    findSettingsObject('filter').definitions.splice(0);
    // Purposeful sequential visual delay to first allow the
    // user to read the success message, then hides the modal.
    setTimeout(() => {
      findSettingsObject('entities').definitions.push(...entityDefinitionsList);
      bvModal.value.hide('report-data-sources-modal');
      isFetchingEntityColumns.value = false;
    }, 1001);
  }
  return Promise.resolve();
}

/**
 * Updates a report settings object by creating a new payload and saving the template.
 * @param {String} settingsId Setting id for reference in the main reportSettings composable
 * @param {Number} definitionIndex Definition index position
 * @param {Object} currentDefinition Definition object
 */
async function saveTemplateAndUpdateSettings(settingsId, definitionIndex, currentDefinition) {
  const { definitions, modal } = findSettingsObject(settingsId);
  const updatedDefinitions = generateNewDefinitions(definitions, definitionIndex, currentDefinition);
  const updatedSettings = generateNewSettings(settingsId, updatedDefinitions);
  const definitionIntendedToBeDeleted = currentDefinition === undefined;

  isSavingDefinition.value = true;
  await saveTemplate(updatedSettings);

  if (definitionIntendedToBeDeleted) {
    delete definitionBeingEdited.value[settingsId];
  }

  if (reportState === 'published') {
    router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: templateId.toLowerCase() } });
  }

  isSavingDefinition.value = false;
  definitions.splice(0);
  definitions.push(...updatedDefinitions);

  displayNotification('success', i18n.global.t('reports.template.reportUpdated'));
  bvModal.value.hide(modal);
}

/**
 * Updates the list of selected columns.
 * @param {Number} defIndex Definition index position
 * @param {Array} columns Selected data source columns
 */
function onSetColumnSelections(defIndex, columns) {
  const { selectedColumns } = findSettingsObject('entities').definitions[defIndex];
  selectedColumns.splice(0);
  selectedColumns.push(...columns);
  disableTemplateSave.value = false;
}

/**
 * Adds a related data source
 * @param {Number} defIndex Definition index position
 * @param {String} relatedDataSourceName Related data source name
 */
async function onSetRelatedDataSources(defIndex, relatedDataSourceName) {
  const currentDefinition = findSettingsObject('entities').definitions[defIndex];
  const computedDataSourceName = [currentDefinition.name, relatedDataSourceName].join('.');
  await addDataSource(computedDataSourceName);
  currentDefinition.selectedRelatedDataSources.push(relatedDataSourceName);
}

/**
 * Updates the label for an heading element in the left hand preview table.
 * @param {String} settingsId The updated data source label
 * @param {Number} id The definition id
 * @param {String} label The updated label
 */
function onUpdateTableEntryLabel(settingsId, id, label) {
  const { definitions } = findSettingsObject(settingsId);
  const [entity] = definitions;
  const definitionsTarget = settingsId === 'entities' ? entity.dataSourceColumns : definitions;
  const updatedDefinitions = definitionsTarget.map((definitionObj, index) => {
    const definitionPropertyMatch = settingsId === 'entities' ? definitionObj.value === id : index === id;
    if (definitionPropertyMatch) {
      return { ...definitionObj, label };
    }
    return definitionObj;
  });

  definitionsTarget.splice(0);
  definitionsTarget.push(...updatedDefinitions);
  disableTemplateSave.value = false;
}

/**
 * Duplicates the current report template
 * @param {String} id template name
 * @param {String} status template status type (draft, published)
 */
async function duplicateTemplate(id, status) {
  isDuplicating.value = true;
  await duplicateAnalyticsReport(id, status);
  displayNotification('success', i18n.global.t('common.duplicateSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  isDuplicating.value = false;
  router.push({ name: 'Reports' });
}

/**
 * Deletes the current Data source entity
 * @param {Number} defIndex Definition index position
 */
function onDeleteDataSource(defIndex) {
  const entities = findSettingsObject('entities');
  const definitionNamePath = entities.definitions[defIndex].name;
  const definitionPathArray = definitionNamePath.split('.');
  const currentDefinitionName = definitionPathArray.pop();
  const parentDefinitionName = definitionPathArray.join('.');
  const parentDefinition = entities.definitions.find((def) => def.name === parentDefinitionName);
  const deleteQueue = [];

  if (parentDefinition) {
    // Remove the selected related data source item from the parent data source definition
    parentDefinition.selectedRelatedDataSources = parentDefinition.selectedRelatedDataSources.filter((entity) => entity !== currentDefinitionName);
  }

  entities.definitions.forEach((def) => {
    if (def.name.split('.').includes(currentDefinitionName)) {
      deleteQueue.push(def.name);
    }
  });

  // Remove any nested related data sources
  const filteredDefinitions = entities.definitions.filter((def) => !deleteQueue.includes(def.name));
  entities.definitions.splice(0);
  entities.definitions.push(...filteredDefinitions);
}

/**
 * Deletes the current report template
 */
async function deleteTemplate() {
  isDeletingTemplate.value = true;
  await deleteAnalyticsReport(templateId, reportState);
  isDeletingTemplate.value = false;
  displayNotification('success', i18n.global.t('common.deleteSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  router.push({ name: 'Reports' });
}

/**
 * Saves template from header
 */
async function saveTemplateFromHeader() {
  isSavingTemplate.value = true;
  await saveTemplate();

  if (reportState === 'published') {
    router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: templateId.toLowerCase() } });
  }

  disableTemplateSave.value = true;
  isSavingTemplate.value = false;
  displayNotification('success', i18n.global.t('reports.template.reportUpdated'));
}

/**
 * Opens the settings modal
 * @param {String} settingId Settings ID
 * @param {Number} definitionIndex Definition index position
 * @param {Object} currentDefinition definition object to add or edit
 */
async function onUpdateDefinitions(settingId, definitionIndex, currentDefinition) {
  const { modal } = findSettingsObject(settingId);
  if (definitionIndex !== undefined) {
    definitionBeingEdited.value = {
      [settingId]: { index: definitionIndex, definition: currentDefinition },
    };
  }
  // Necessary so the @show BModal method can have access to props
  await nextTick();
  bvModal.value.show(modal);
}

/**
 * Fetches fieldoptions for filter variables
 * @param {String} operator filter operator condition
 */
function fetchFieldOptionsForFilters(operator) {
  return getFieldOptionsForFilters(
    operator,
    findSettingsObject('entities').definitions,
    findSettingsObject('parameters').definitions,
  );
}

/**
 * Fetches fieldoptions for aggregate variables
 * @param {String} aggregateTypeName aggregate condition type
 */
function fetchFieldOptionsForAggregates(aggregateTypeName) {
  return getFieldOptionsForAggregates(
    aggregateTypeName,
    findSettingsObject('entities').definitions,
    findSettingsObject('parameters').definitions,
    findSettingsObject('filter').definitions,
  );
}

/**
 * Replaces an updated parameter selection with an associated existing filter rule or aggregate
 * and returns a list of associated operators as well as a new list of updated definitions.
 * @param {Array} allDefinitions list of all setting definitions
 * @param {String} oldParameterLabel old parameter label
 * @param {String} newParameterLabel new parameter label
 * @returns {Object} operatorList and updatedDefinitions
 */
function updateParameterSelections(allDefinitions, oldParameterLabel, newParameterLabel) {
  const operatorList = new Set();
  const updatedDefinitions = allDefinitions.map((definition) => {
    if (definition.value === oldParameterLabel) {
      operatorList.add(definition.type || definition.operator);
      return {
        ...definition,
        value: newParameterLabel,
      };
    }
    return definition;
  });

  return {
    operatorList: Array.from(operatorList),
    updatedDefinitions,
  };
}

/**
 * Saves template with the updated parameter definition (or deletes it) while also
 * checking to see if a parameter label has changed, or has been deleted, so any presently
 * defined filters or aggregates with the same parameter selection can be updated accordingly.
 * @param {Number} definitionIndex parameter definition index position
 * @param {Object} currentDefinition parameter definition object
 */
async function onUpdateParameter(definitionIndex, currentDefinition) {
  const existingFilterDefinitions = findSettingsObject('filter').definitions;
  const existingParameterDefinitions = findSettingsObject('parameters').definitions;
  const existingAggregateDefinitions = findSettingsObject('aggregate').definitions;
  const { inputLabel: oldParameterLabel } = existingParameterDefinitions[definitionIndex] || {};
  const [filterGroup] = existingFilterDefinitions;
  const filterRulesThatMatchParameter = filterGroup ? filterGroup.subfilters.filter((rule) => rule.value === oldParameterLabel) : [];
  const aggregatesThatMatchParameter = existingAggregateDefinitions.filter((aggregate) => aggregate.value === oldParameterLabel);
  const parameterIntendedToBeDeleted = currentDefinition === undefined;
  const parameterHasNewLabel = oldParameterLabel !== currentDefinition?.inputLabel;
  let aggregateOperatorList = [];

  // Handle aggregates after parameter update
  if (parameterHasNewLabel && aggregatesThatMatchParameter.length) {
    let updatedDefinitions = [];

    if (parameterIntendedToBeDeleted) {
      // Filter out aggregates that have the intended deleted parameter name for the right value
      updatedDefinitions = existingAggregateDefinitions.filter((aggregate) => aggregate.value !== oldParameterLabel);
    } else {
      ({ operatorList: aggregateOperatorList, updatedDefinitions } = updateParameterSelections(existingAggregateDefinitions, oldParameterLabel, currentDefinition.inputLabel));
    }
    // Replaces the aggregate definitions
    existingAggregateDefinitions.splice(0);
    existingAggregateDefinitions.push(...updatedDefinitions);
  }

  await saveTemplateAndUpdateSettings('parameters', definitionIndex, currentDefinition);
  // Necessary to fetch field options for aggregates after template saves
  // in order for the value select field to have updated right value options.
  aggregateOperatorList.forEach((operatorType) => { fetchFieldOptionsForAggregates(operatorType); });

  // Handle filters after parameter update
  if (parameterHasNewLabel && filterRulesThatMatchParameter.length) {
    const fieldOptionPromises = [];
    let updatedRules = [];
    let operatorList = [];

    if (parameterIntendedToBeDeleted) {
      // Filter out rules that have the deleted parameter name for the right value
      updatedRules = filterGroup.subfilters.filter((rule) => rule.value !== oldParameterLabel);
      delete definitionBeingEdited.value.filter;
    } else {
      // If a parameter label has changed and a filter exists with the right value variable
      // selection matching the current parameter definition, then we need to update the filter
      // rule value with the new parameter label and fetch the filter field options again.
      ({ operatorList, updatedDefinitions: updatedRules } = updateParameterSelections(filterGroup.subfilters, oldParameterLabel, currentDefinition.inputLabel));
      operatorList.forEach((operator) => { fieldOptionPromises.push(fetchFieldOptionsForFilters(operator)); });
    }

    if (!updatedRules.length) {
      // Must delete the filter definition since there are no rules
      existingFilterDefinitions.splice(0);
    } else {
      // Replaces the filter rules
      filterGroup.subfilters.splice(0);
      filterGroup.subfilters.push(...updatedRules);
    }

    // Must fetch filter field options for all unique operators so the variable list options
    // get updated with the new parameter label. We must await the response since the filters
    // payload that runs when we execute saveTemplate below relies on these updated select options.
    await Promise.all(fieldOptionPromises);

    // Template needs to be saved a second time because the filters paylod relies on an API supplied field options
    // object for determining the property type. So we have to save the template with the initial parameter
    // updates above, then fetch filter field options again and select the updated parameter in the background
    // and lastly save the template a second time with the newly updated right value parameter name.
    saveTemplate();
  }
}

// Computed
const templateHasAtLeastOneDataSource = computed(() => findSettingsObject('entities').definitions.length);
const templateDoesNotHaveSelectedColumns = computed(() => {
  const [{ selectedColumns }] = findSettingsObject('entities').definitions;
  return !selectedColumns?.length;
});

/**
 * Check to see if detail settings has changed so we can set the save button disabled status accordingly
 */
watch(reportDetails, (newVal, oldVal) => {
  if (!isEqual(newVal, oldVal)) {
    disableTemplateSave.value = false;
  }
});

// Start
(async () => {
  fetchReportEntities();
  fetchReportOperators();
  fetchAggregateTypes();
  try {
    // Gets saved data for an existing template
    const { result } = await getReportTemplates({
      _queryFilter: `name eq ${templateId}`,
      templateType: route.params.state,
    }, false);
    if (result?.length) {
      const [existingTemplate] = result;
      const {
        reportConfig,
        viewers,
        description,
      } = existingTemplate;
      const {
        entities,
        fields,
        parameters,
        filter,
        aggregate,
        sort,
      } = JSON.parse(reportConfig);

      // Sets the Details tab information
      reportDetails.value.name = startCase(templateName.toLowerCase());
      reportDetails.value.description = description;
      reportDetails.value.report_admin = viewers.includes('report_admin');
      reportDetails.value.report_owner = viewers.includes('report_owner');
      reportDetails.value.report_viewer = viewers.includes('report_viewer');
      reportDetails.value.viewers = viewers.filter((item) => !defaultGroups.includes(item));

      // Populates the settings definitions
      findSettingsObject('entities').definitions.push(...await entityDefinitions(entities, fields));
      findSettingsObject('parameters').definitions.push(...await parameterDefinitions(parameters));
      findSettingsObject('filter').definitions.push(...await filterDefinitions(
        filter,
        findSettingsObject('entities').definitions,
        findSettingsObject('parameters').definitions,
      ));
      findSettingsObject('aggregate').definitions.push(...aggregateDefinitions(aggregate));
      findSettingsObject('sort').definitions.push(...sortingDefinitions(sort));
      isFetchingTemplate.value = false;
    } else {
      displayNotification('warning', i18n.global.t('reports.tabs.runReport.errors.templateDoesNotExist'));
      router.push({ name: 'Reports' });
    }
  } catch (e) {
    showErrorMessage(e, i18n.global.t('reports.notAvailable'));
    router.push({ name: 'Reports' });
  }
})();
</script>
