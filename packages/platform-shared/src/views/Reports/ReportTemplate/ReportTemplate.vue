<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100 d-flex flex-column">
    <FrReportTemplateHeader
      :disable-save="disableTemplateSave"
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
          :report-is-loading="reportIsLoading"
          :report-settings="reportSettings"
          @delete-data-source="onDeleteDataSource"
          @delete-definition="updateSettings"
          @delete-parameter="onUpdateParameter"
          @related-entity-settings="onRelatedEntitySettings"
          @set-column-selections="onSetColumnSelections"
          @set-related-data-sources="onSetRelatedDataSources"
          @update-definitions="onUpdateDefinitions" />
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
      @add-data-source="onAddDataSource" />
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
    <FrReportSortingModal
      :existing-sort="definitionBeingEdited.sort || {}"
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      :sort-by-options="sortByValues"
      @get-field-options="fetchFieldOptionsForSorting"
      @update-sort="saveTemplateAndUpdateSettings"
      @hidden="delete definitionBeingEdited.sort" />
    <FrRelatedEntitySettingsModal
      :join-type="relatedEntityDefinitionToEdit.joinType"
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      @set-related-entity-type="onSetRelatedEntityType($event, relatedEntityDefinitionToEdit.dataSource)"
      @hidden="relatedEntityDefinitionToEdit = {}" />
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
import { computed, ref, watch } from 'vue';
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
import useReportSettings from '../composables/ReportSettings';
import useReportParameters from '../composables/ReportParameters';
import useReportEntities from '../composables/ReportEntities';
import useReportFilters from '../composables/ReportFilters';
import useReportAggregates from '../composables/ReportAggregates';
import useReportSorting from '../composables/ReportSorting';
import FrReportTemplateHeader from './ReportTemplateHeader';
import FrReportAddDataSourceCard from './ReportAddDataSourceCard';
import FrReportFieldsTable from './ReportFieldsTable';
import FrReportTemplateSettings from './ReportTemplateSettings';
import FrReportDataSourceModal from '../modals/ReportDataSourceModal';
import FrReportParametersModal from '../modals/ReportParametersModal';
import FrReportFiltersModal from '../modals/ReportFiltersModal';
import FrReportAggregatesModal from '../modals/ReportAggregatesModal';
import FrReportSortingModal from '../modals/ReportSortingModal';
import FrRelatedEntitySettingsModal from '../modals/RelatedEntitySettingsModal';
import i18n from '@/i18n';
import { defaultGroups } from '../composables/ManagedUsers';

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
  getFieldOptionsForSorting,
  sortByValues,
  sortingDefinitions,
  sortingPayload,
} = useReportSorting(
  entitiesPayload,
  parametersPayload,
  filtersPayload,
  aggregatesPayload,
);
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
const relatedEntityDefinitionToEdit = ref({});
const reportDetails = ref({
  name: '',
  description: '',
  report_admin: false,
  report_viewer: false,
  report_owner: false,
  viewers: [],
});
const reportIsLoading = ref(true);
const reportState = route.params.state;
const templateId = route.params.template.toUpperCase();
const templateName = route.params.template.replace(/-/g, ' ');

// Functions
/**
 * Saves the report template
 * @param {Object} settings complete settings template local data
 */
async function saveTemplate(settings = reportSettings.value) {
  const payload = reportPayload(settings);
  const groupViewers = defaultGroups.filter((group) => reportDetails.value[group]);

  try {
    await saveAnalyticsReport(templateId, payload, [...reportDetails.value.viewers, ...groupViewers], reportDetails.value.description);
    if (reportState === 'published') {
      router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: templateId.toLowerCase() } });
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.template.error.errorSavingReport'));
    return error;
  }

  return Promise.resolve();
}

/**
 * After an entity is selected, entity columns are fetched here.
 * @param {String} dataSource entity name
 */
async function onAddDataSource(dataSource) {
  if (dataSource) {
    isFetchingEntityColumns.value = true;
    const entityDefinitionsList = await entityDefinitions([{ entity: dataSource }], [], true);
    displayNotification('success', i18n.global.t('reports.template.dataSetAdded'));

    // Purposeful sequential visual delay to first allow the
    // user to read the success message, then hides the modal.
    setTimeout(() => {
      const entitiesList = findSettingsObject('entities').definitions;
      const dataSourceArrPopped = dataSource.split('.');
      dataSourceArrPopped.pop();
      const parentIndex = entitiesList.findIndex((entity) => entity.dataSource === dataSourceArrPopped.join('.'));

      entitiesList.splice(parentIndex + 1, 0, ...entityDefinitionsList);
      bvModal.value.hide('report-data-sources-modal');
      disableTemplateSave.value = false;
      isFetchingEntityColumns.value = false;
    }, 1001);
  }
  return Promise.resolve();
}

/**
 * Updates the report settings object with a new definition
 * @param {String} settingsId Setting id for reference in the main reportSettings composable
 * @param {Number} definitionIndex Definition index position
 * @param {Object} updatedDefinition Definition object
 */
function updateSettings(settingsId, definitionIndex, updatedDefinition) {
  const { definitions, modal } = findSettingsObject(settingsId);
  const updatedDefinitionsList = generateNewDefinitions(definitions, definitionIndex, updatedDefinition);
  const definitionIntendedToBeDeleted = updatedDefinition === undefined;

  if (definitionIntendedToBeDeleted) {
    delete definitionBeingEdited.value[settingsId];
  }

  definitions.splice(0);
  definitions.push(...updatedDefinitionsList);
  disableTemplateSave.value = false;

  bvModal.value.hide(modal);
}

/**
 * Updates a report settings object by creating a new payload and saving the template.
 * @param {String} settingsId Setting id for reference in the main reportSettings composable
 * @param {Number} definitionIndex Definition index position
 * @param {Object} updatedDefinition Definition object
 */
async function saveTemplateAndUpdateSettings(settingsId, definitionIndex, updatedDefinition) {
  const { definitions, modal } = findSettingsObject(settingsId);
  const updatedDefinitionsList = generateNewDefinitions(definitions, definitionIndex, updatedDefinition);
  const updatedSettings = generateNewSettings(settingsId, updatedDefinitionsList);

  isSavingDefinition.value = true;
  await saveTemplate(updatedSettings);

  updateSettings(settingsId, definitionIndex, updatedDefinition);

  if (reportState === 'published') {
    router.push({ name: 'EditReportTemplate', params: { state: 'draft', template: templateId.toLowerCase() } });
  }

  isSavingDefinition.value = false;
  disableTemplateSave.value = true;

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
 * @param {Number} parentIndex Parent entity definition index position
 * @param {String} relatedDataSource Related data source path
 */
async function onSetRelatedDataSources(parentIndex, relatedDataSource) {
  const { selectedRelatedDataSources } = findSettingsObject('entities').definitions[parentIndex];
  await onAddDataSource(relatedDataSource);
  selectedRelatedDataSources.push(relatedDataSource.split('.').pop());
}

/**
 * Updates the label for an heading element in the left hand preview table.
 * @param {String} settingsId The settings object ID
 * @param {Number|String} id The definition id or value
 * @param {String} label The updated label
 */
function onUpdateTableEntryLabel(settingsId, id, label) {
  const { definitions } = findSettingsObject(settingsId);
  const updatedDefinitions = definitions.map((definitionObj, index) => {
    const columns = definitionObj.dataSourceColumns;

    if (columns) {
      const updatedDataSourceColumns = columns.map((column) => {
        if (column.value === id) {
          return { ...column, label };
        }
        return column;
      });
      return { ...definitionObj, dataSourceColumns: updatedDataSourceColumns };
    }

    if (index === id) {
      return { ...definitionObj, label };
    }

    return definitionObj;
  });

  definitions.splice(0);
  definitions.push(...updatedDefinitions);
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
 * Loops through any filter, aggregate or sorting definitions to see
 * if any of the deleted data source columns are found as selections in
 * any of the definitions data.  If found, the definition is deleted.
 * @param {Array} deleteList list of deleted data source paths
 */
function removeAssociatedDefinitions(deleteList) {
  const filter = findSettingsObject('filter').definitions;
  const filterRules = filter.length ? filter[0].subfilters : null;
  const aggregates = findSettingsObject('aggregate').definitions;
  const sortings = findSettingsObject('sort').definitions;

  if (filterRules) {
    const filteredRules = filterRules.filter(({ field, value }) => !deleteList.filter((path) => (field.startsWith(path) || value.startsWith(path))).length);

    if (filteredRules.length) {
      filterRules.splice(0);
      filterRules.push(...filteredRules);
    } else {
      // Filter should be deleted entirely if there are no rules
      filter.splice(0);
    }
  }

  if (aggregates.length) {
    const filteredAggregates = aggregates.filter(({ value }) => !deleteList.filter((path) => value.startsWith(path)).length);
    aggregates.splice(0);
    aggregates.push(...filteredAggregates);
  }

  if (sortings.length) {
    const filteredSorting = sortings.filter(({ value }) => !deleteList.filter((path) => value.startsWith(path)).length);
    sortings.splice(0);
    sortings.push(...filteredSorting);
  }
}

/**
 * Deletes the current Data source entity
 * @param {Number} defIndex Definition index position
 */
function onDeleteDataSource(defIndex) {
  const definitionsList = findSettingsObject('entities').definitions;
  const definitionNamePath = definitionsList[defIndex].dataSource;
  const definitionPathArray = definitionNamePath.split('.');
  const currentDefinitionName = definitionPathArray.pop();
  const parentDefinitionName = definitionPathArray.join('.');
  const parentDefinition = definitionsList.find((def) => def.dataSource === parentDefinitionName);
  const deleteQueue = [];

  if (parentDefinition) {
    // Remove the selected related data source item from the parent data source definition
    parentDefinition.selectedRelatedDataSources = parentDefinition.selectedRelatedDataSources.filter((entity) => entity !== currentDefinitionName);
  }

  definitionsList.forEach((def) => {
    if (def.dataSource.split('.').includes(currentDefinitionName)) {
      deleteQueue.push(def.dataSource);
    }
  });

  // Remove any nested related data sources
  const filteredDefinitions = definitionsList.filter((def) => !deleteQueue.includes(def.dataSource));
  definitionsList.splice(0);
  definitionsList.push(...filteredDefinitions);
  disableTemplateSave.value = false;

  if (Object.keys(definitionsList).length) {
    const { entities } = entitiesPayload(definitionsList);
    removeAssociatedDefinitions(deleteQueue);
    entityDefinitions(entities);
  } else {
    // If the last data source is deleted we must clear any previously
    // defined entity columns, parameters, filters, aggregates and sorting definitions.
    entityDefinitions([]);
    findSettingsObject('parameters').definitions.splice(0);
    findSettingsObject('filter').definitions.splice(0);
    findSettingsObject('aggregate').definitions.splice(0);
    findSettingsObject('sort').definitions.splice(0);
  }
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
 * Fetches fieldoptions for sorting options
 */
function fetchFieldOptionsForSorting() {
  return getFieldOptionsForSorting(
    findSettingsObject('entities').definitions,
    findSettingsObject('parameters').definitions,
    findSettingsObject('filter').definitions,
    findSettingsObject('aggregate').definitions,
  );
}

/**
 * Replaces an updated parameter selection property with an associated
 * existing filter rule, aggregate, or sorting definition and returns a list
 * of relevant operators as well as a new list of updated definitions.
 * @param {Array} allDefinitions list of all setting definitions
 * @param {String} oldParameterName old parameter name
 * @param {String} newParameterName new parameter name
 * @returns {Object} updated definitions list
 */
function updateParameterSelections(allDefinitions, oldParameterName, newParameterName) {
  return allDefinitions.map((definition) => {
    const nameKeyMatches = Object.keys(definition).filter((definitionKey) => definition[definitionKey] === oldParameterName);
    const propertyReplacements = nameKeyMatches.map((key) => ({ [key]: newParameterName }));
    if (propertyReplacements.length) {
      return Object.assign({}, definition, ...propertyReplacements);
    }
    return definition;
  });
}

/**
 * Updates a matching property for an aggregate, filter or sort definition.
 * @param {Array} allDefinitions existing aggregate defintion list
 * @param {String} oldParameterName old parameter name
 * @param {String} newParameterName new parameter name
 * @return {Array} new list of updated definitions
 */
function updateDefinitionOnParameterChange(allDefinitions, oldParameterName, newParameterName) {
  if (!newParameterName) {
    // Parameter in question is intended to be deleted, so we filter out definitions that have the same parameter name
    return allDefinitions.filter((definition) => {
      // Finds the property key by value within the definition
      const [targetProperty] = Object.keys(definition).filter((definitionKey) => definition[definitionKey] === oldParameterName);
      return definition[targetProperty] !== oldParameterName;
    });
  }
  return updateParameterSelections(allDefinitions, oldParameterName, newParameterName);
}

/**
 * Saves template with the updated parameter definition (or deletes it) while also checking
 * to see if the parameter name has changed, or has been deleted, so any presently defined
 * filter definitions with the same parameter selection can be updated accordingly.
 * @param {Number} definitionIndex parameter definition index position
 * @param {Object} currentDefinition parameter definition object
 */
async function onUpdateParameter(definitionIndex, currentDefinition) {
  const existingFilterDefinitions = findSettingsObject('filter').definitions;
  const existingParameterDefinitions = findSettingsObject('parameters').definitions;
  const { parameterName: oldParameterName } = existingParameterDefinitions[definitionIndex] || {};
  const [filterGroup] = existingFilterDefinitions;
  const filterRulesThatMatchParameter = filterGroup ? filterGroup.subfilters.filter((rule) => rule.value === oldParameterName) : [];
  const parameterHasNewName = oldParameterName !== currentDefinition?.parameterName;

  updateSettings('parameters', definitionIndex, currentDefinition);

  // Handle filters on parameter update
  if (filterRulesThatMatchParameter.length) {
    const fieldOptionPromises = [];

    if (parameterHasNewName) {
      const updatedRules = updateDefinitionOnParameterChange(filterGroup.subfilters, oldParameterName, currentDefinition?.parameterName);
      if (!updatedRules.length) {
        // Must delete the filter definition altogether since there are no rules
        existingFilterDefinitions.splice(0);
      } else {
        // Replaces the filter rules
        filterGroup.subfilters.splice(0);
        filterGroup.subfilters.push(...updatedRules);
      }
    }

    // Must fetch filter field options for all unique operators so the
    // variable list options get updated with the new parameter label.
    filterRulesThatMatchParameter.forEach((rule) => { fieldOptionPromises.push(fetchFieldOptionsForFilters(rule.operator)); });

    // We must await the response since the filters payload that runs when
    // we the template is saved relies on these updated select options.
    await Promise.all(fieldOptionPromises);
  }
}

/**
 * Opens the related entity settings modal
 * @param {Number} definitionIndex definition object index
 */
function onRelatedEntitySettings(definitionIndex) {
  relatedEntityDefinitionToEdit.value = findSettingsObject('entities').definitions[definitionIndex];
  bvModal.value.show('related-entity-settings-modal');
}

/**
 * Sets the related entity join type property and saves the updated settings
 * @param {String} joinType join type value
 * @param {String} dataSourceName related entity data source name
 */
async function onSetRelatedEntityType(joinType, dataSourceName) {
  const definition = findSettingsObject('entities').definitions.find(({ dataSource }) => dataSource === dataSourceName);
  const definitionIndex = findSettingsObject('entities').definitions.findIndex(({ dataSource }) => dataSource === dataSourceName);
  const updatedDefinition = {
    ...definition,
    joinType,
  };

  await saveTemplateAndUpdateSettings('entities', definitionIndex, updatedDefinition);
  bvModal.value.hide('related-entity-settings-modal');
}

// Computed
const templateHasAtLeastOneDataSource = computed(() => findSettingsObject('entities').definitions.length);

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
  const getTemplate = getReportTemplates({
    _queryFilter: `name eq ${templateId}`,
    templateType: route.params.state,
  }, false);
  fetchReportOperators();
  fetchAggregateTypes();

  try {
    // Gets saved report data and report entities
    const [{ result }] = await Promise.all([getTemplate, fetchReportEntities()]);

    if (result?.length) {
      const [existingTemplate] = result;
      const { reportConfig, viewers, description } = existingTemplate;
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
      reportDetails.value.report_author = viewers.includes('report_author');
      reportDetails.value.report_viewer = viewers.includes('report_viewer');
      reportDetails.value.viewers = viewers ? viewers.filter((item) => !defaultGroups.includes(item)) : [];

      // Populates the settings definitions
      findSettingsObject('entities').definitions.push(...await entityDefinitions(entities, fields));
      findSettingsObject('parameters').definitions.push(...await parameterDefinitions(parameters));
      findSettingsObject('filter').definitions.push(...await filterDefinitions(
        filter,
        findSettingsObject('entities').definitions,
        findSettingsObject('parameters').definitions,
      ));
      findSettingsObject('aggregate').definitions.push(...aggregateDefinitions(aggregate));
      await fetchFieldOptionsForSorting();
      findSettingsObject('sort').definitions.push(...sortingDefinitions(sort));
      isFetchingTemplate.value = false;
    } else {
      displayNotification('warning', i18n.global.t('reports.tabs.runReport.errors.templateDoesNotExist'));
      router.push({ name: 'Reports' });
    }
  } catch (e) {
    showErrorMessage(e, i18n.global.t('reports.notAvailable'));
    router.push({ name: 'Reports' });
  } finally {
    reportIsLoading.value = false;
  }
})();
</script>
