<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <div class="h-100 d-flex flex-column">
    <FrReportTemplateHeader
      :disable-save="disableSave"
      :report-state="reportState"
      :is-saving="isSavingTemplate"
      :template-name="templateName"
      @delete="deleteTemplate"
      @duplicate="duplicateTemplate"
      @save="saveTemplate" />
    <main
      class="d-flex w-100 h-100 overflow-auto"
      role="main">
      <template v-if="templateHasAtLeastOneDataSource">
        <FrReportDataSourceTable />
        <FrReportTemplateSettings
          :is-saving="isSavingDefinition"
          :report-settings="reportSettings"
          @delete-data-source="deleteDataSource"
          @delete-definition="updateSettings"
          @delete-related-entity="deleteRelatedEntity"
          @update-definitions="openSettingsModal"
          @set-aggregate="setAggregate"
          @set-data-source-columns="setSelectedDataSourceColumns"
          @set-related-entity="setSelectedRelatedEntity" />
      </template>
      <FrReportAddDataSourceCard
        v-else
        @open-data-source-modal="$bvModal.show('report-data-sources-modal')" />
    </main>
    <FrReportDataSourceModal
      :entities="entityOptions"
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      @add-entity="addEntity" />
    <FrReportParametersModal
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      :parameter-types="parameterTypeLabels"
      :parameter="currentDefinitionBeingEdited"
      :profile-attributes="profileAttributeNames"
      @update-parameter="updateSettings" />
  </div>
</template>

<script setup>
/**
 * @description
 * Main component that gives an admin the ability to create custom platform analytics reports.
 */
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import {
  saveAnalyticsReport,
  deleteAnalyticsReport,
  getReportTemplates,
} from '@forgerock/platform-shared/src/api/AutoApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import useReportSettings from './composables/ReportSettings';
import useReportParameters from './composables/ReportParameters';
import useReportEntities from './composables/ReportEntities';
import useReportFilters from './composables/ReportFilters';
import useReportAggregates from './composables/ReportAggregates';
import useReportSorting from './composables/ReportSorting';
import FrReportTemplateHeader from './ReportTemplate/ReportTemplateHeader';
import FrReportAddDataSourceCard from './ReportTemplate/ReportAddDataSourceCard';
import FrReportDataSourceTable from './ReportTemplate/ReportDataSourceTable';
import FrReportTemplateSettings from './ReportTemplate/ReportTemplateSettings';
import FrReportDataSourceModal from './modals/ReportDataSourceModal';
import FrReportParametersModal from './modals/ReportParametersModal';
import i18n from '@/i18n';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

// Composables
const { bvModal } = useBvModal();
const route = useRoute();
const {
  getParametersData,
  parameterDefinitions,
  parameterTypeLabels,
  parametersPayload,
  profileAttributeNames,
} = useReportParameters();
const {
  entityDefinitions,
  entityOptions,
  entitiesPayload,
  fetchReportEntities,
} = useReportEntities();
const { filterDefinitions, filtersPayload } = useReportFilters();
const { aggregateDefinitions, aggregatesPayload } = useReportAggregates();
const { sortingDefinitions, sortingPayload } = useReportSorting();
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
const currentDefinitionBeingEdited = ref({});
const disableSave = ref(true);
const isSavingDefinition = ref(false);
const isSavingTemplate = ref(false);
const reportDescription = ref('');
const reportState = ref('draft');
const reportViewers = ref([]);
const templateId = route.params.id;
const templateName = templateId || ref(i18n.global.t('reports.template.newReportTemplate'));

// Functions
/**
 * Saves the report template
 * @param {Object} payload complete template payload
 */
function saveTemplate(payload) {
  return saveAnalyticsReport(templateId, payload, reportViewers.value, reportDescription.value);
}

/**
 * After an entity is selected, entity columns are fetched here.
 * @param {String} dataSourceName entity name
 */
async function addEntity(dataSourceName) {
  if (dataSourceName) {
    isSavingDefinition.value = true;
    const entityDefinitionsList = await entityDefinitions([{ entity: dataSourceName }]);
    displayNotification('success', i18n.global.t('reports.template.dataSetAdded'));
    // Purposeful sequential visual delay to first allow the
    // user to read the success message, then hides the modal.
    setTimeout(() => {
      findSettingsObject('entities').definitions.push(...entityDefinitionsList);
      bvModal.value.hide('report-data-sources-modal');
      isSavingDefinition.value = false;
    }, 1001);
  }
  return Promise.resolve();
}

/**
 * Updates a report setting by creating a new payload and saving the template.
 * @param {String} settingsId Setting id for reference in the main reportSettings composable
 * @param {Object | String} definition definition object or definition ID used for deletion
 */
async function updateSettings(settingsId, definition) {
  isSavingDefinition.value = true;
  const { definitions, modal } = findSettingsObject(settingsId);
  const updatedDefinitions = generateNewDefinitions(definitions, definition);
  const updatedSettings = generateNewSettings(settingsId, updatedDefinitions);
  const payload = reportPayload(updatedSettings);

  await saveTemplate(payload);
  definitions.splice(0);
  definitions.push(...updatedDefinitions);

  displayNotification('success', i18n.global.t('reports.template.reportUpdated'));

  bvModal.value.hide(modal);
  isSavingDefinition.value = false;
}

/**
 * Updates the list of selected columns.
 * @param {Number} defIndex Definition index position
 * @param {Array} columns Selected entity columns
 */
function setSelectedDataSourceColumns(defIndex, columns) {
  const { selectedColumns } = findSettingsObject('entities').definitions[defIndex];
  selectedColumns.splice(0);
  selectedColumns.push(...columns);
}

/**
 * Adds a related entity
 * @param {Number} defIndex Definition index position
 * @param {String} relatedEntityName Related entity name
 */
async function setSelectedRelatedEntity(defIndex, relatedEntityName) {
  const currentDefinition = findSettingsObject('entities').definitions[defIndex];
  const relatedDataSourceName = [currentDefinition.name, relatedEntityName].join('.');
  await addEntity(relatedDataSourceName);
  currentDefinition.selectedRelatedEntities.push(relatedEntityName);
}

/**
 * Duplicates the current report template
 */
function duplicateTemplate() {
}

/**
 * Deletes the current Data source entity
 * @param {Number} defIndex Definition index position
 */
function deleteDataSource(defIndex) {
  const entities = findSettingsObject('entities');
  const definitionNamePath = entities.definitions[defIndex].name;
  const definitionPathArray = definitionNamePath.split('.');
  const currentDefinitionName = definitionPathArray.pop();
  const parentDefinitionName = definitionPathArray.join('.');
  const parentDefinition = entities.definitions.find((def) => def.name === parentDefinitionName);
  const deleteQueue = [];

  if (parentDefinition) {
    // Remove the selected related data source item from the parent data source definition
    parentDefinition.selectedRelatedEntities = parentDefinition.selectedRelatedEntities.filter((entity) => entity !== currentDefinitionName);
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
function deleteTemplate() {
  deleteAnalyticsReport(templateId, reportState.value);
}

/**
 * Opens the settings modal
 * @param {String} modalId Settings modal ID
 * @param {Object} definition Setting definition
 */
function openSettingsModal(modalId, definition = {}) {
  currentDefinitionBeingEdited.value = definition;
  bvModal.value.show(modalId);
}

/**
 * Sets the aggregate data after being checked
 * @param {String} name aggregate name
 * @param {Boolean} value aggregate checkbox value
 */
function setAggregate(name, value) {
  const definition = findSettingsObject('aggregates').definitions.find((def) => def.name === name);
  definition.checked = value;
}

// Computed
const templateHasAtLeastOneDataSource = computed(() => findSettingsObject('entities').definitions.length);

// Start
(async () => {
  fetchReportEntities();
  if (templateId) {
    const { result } = await getReportTemplates({ _queryFilter: `name eq ${templateId.toUpperCase()}` });

    if (result.length) {
      const [existingTemplate] = result;
      const {
        reportConfig,
        type,
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

      reportState.value = type;
      reportViewers.value = viewers;
      reportDescription.value = description;
      await getParametersData();
      findSettingsObject('entities').definitions.push(...await entityDefinitions(entities, fields));
      findSettingsObject('parameters').definitions.push(...parameterDefinitions(parameters));
      findSettingsObject('filter').definitions.push(...filterDefinitions(filter));
      findSettingsObject('aggregate').definitions.push(...aggregateDefinitions(aggregate));
      findSettingsObject('sort').definitions.push(...sortingDefinitions(sort));
    }
  } else {
    await getParametersData();
  }
})();
</script>
