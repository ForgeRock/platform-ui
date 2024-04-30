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
        <FrReportDataSourceTable />
        <FrReportTemplateSettings
          v-model="reportDetails"
          :is-saving="isSavingDefinition"
          :report-settings="reportSettings"
          @delete-data-source="deleteDataSource"
          @delete-definition="updateSettings"
          @update-definitions="openSettingsModal"
          @set-aggregate="setAggregate"
          @set-column-selections="setDataSourceColumnSelections"
          @set-related-entity-selections="setRelatedEntitySelections" />
      </template>
      <FrReportAddDataSourceCard
        v-else
        :is-loading="isFetchingTemplate"
        @open-data-source-modal="bvModal.show('report-data-sources-modal')" />
    </main>
    <FrReportDataSourceModal
      :entities="entityOptions"
      :is-saving="isFetchingEntityColumns"
      :is-testing="isTesting"
      @add-entity="addEntity" />
    <FrReportParametersModal
      :is-saving="isSavingDefinition"
      :is-testing="isTesting"
      :parameter-types="parameterTypeLabels"
      :parameter="currentDefinitionBeingEdited"
      :profile-attributes="profileAttributeNames"
      @update-parameter="updateSettings" />
    <FrDeleteModal
      :is-deleting="isDeletingTemplate"
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
  computed, ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { displayNotification } from '@forgerock/platform-shared/src/utils/notification';
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
import FrReportDataSourceTable from './ReportTemplate/ReportDataSourceTable';
import FrReportTemplateSettings from './ReportTemplate/ReportTemplateSettings';
import FrReportDataSourceModal from './modals/ReportDataSourceModal';
import FrReportParametersModal from './modals/ReportParametersModal';
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
const reportState = ref('draft');
const templateId = route.params.id.toUpperCase();
const templateName = route.params.id.replace(/-/g, ' ');

// Functions
/**
 * Saves the report template
 * @param {Object} settings complete settings template payload
 * @return {Promise} empty promise :(
 */
function saveTemplate(settings = reportSettings.value) {
  const payload = reportPayload(settings);
  const groupViewers = defaultGroups.filter((group) => reportDetails.value[group]);
  return saveAnalyticsReport(templateId, payload, [...reportDetails.value.viewers, ...groupViewers], reportDetails.value.description);
}

/**
 * After an entity is selected, entity columns are fetched here.
 * @param {String} dataSourceName entity name
 */
async function addEntity(dataSourceName) {
  if (dataSourceName) {
    isFetchingEntityColumns.value = true;
    const entityDefinitionsList = await entityDefinitions([{ entity: dataSourceName }]);
    displayNotification('success', i18n.global.t('reports.template.dataSetAdded'));
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
 * Updates a report setting by creating a new payload and saving the template,
 * thereafter updating the local settings definition with the current data.
 * @param {String} settingsId Setting id for reference in the main reportSettings composable
 * @param {Object | String} definition definition object or definition ID used for deletion
 */
async function updateSettings(settingsId, definition) {
  const { definitions, modal } = findSettingsObject(settingsId);
  const updatedDefinitions = generateNewDefinitions(definitions, definition);
  const updatedSettings = generateNewSettings(settingsId, updatedDefinitions);

  isSavingDefinition.value = true;
  await saveTemplate(updatedSettings);
  isSavingDefinition.value = false;
  definitions.splice(0);
  definitions.push(...updatedDefinitions);

  displayNotification('success', i18n.global.t('reports.template.reportUpdated'));
  bvModal.value.hide(modal);
}

/**
 * Updates the list of selected columns.
 * @param {Number} defIndex Definition index position
 * @param {Array} columns Selected entity columns
 */
function setDataSourceColumnSelections(defIndex, columns) {
  const { selectedColumns } = findSettingsObject('entities').definitions[defIndex];
  selectedColumns.splice(0);
  selectedColumns.push(...columns);
  disableTemplateSave.value = false;
}

/**
 * Adds a related entity
 * @param {Number} defIndex Definition index position
 * @param {String} relatedEntityName Related entity name
 */
async function setRelatedEntitySelections(defIndex, relatedEntityName) {
  const currentDefinition = findSettingsObject('entities').definitions[defIndex];
  const relatedDataSourceName = [currentDefinition.name, relatedEntityName].join('.');
  await addEntity(relatedDataSourceName);
  currentDefinition.selectedRelatedEntities.push(relatedEntityName);
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
async function deleteTemplate() {
  isDeletingTemplate.value = true;
  await deleteAnalyticsReport(templateId, reportState.value);
  isDeletingTemplate.value = false;
  displayNotification('success', i18n.global.t('common.deleteSuccess', { object: i18n.global.t('common.report').toLowerCase() }));
  router.push({ name: 'Reports' });
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
 * Saves template from header
 */
async function saveTemplateFromHeader() {
  isSavingTemplate.value = true;
  await saveTemplate();
  displayNotification('success', i18n.global.t('reports.template.reportUpdated'));
  disableTemplateSave.value = true;
  isSavingTemplate.value = false;
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

/**
 * Check to see if detail settings has changed so we can set the save button disabled status correctly
 */
watch(reportDetails, (newVal, oldVal) => {
  if (!isEqual(newVal, oldVal)) {
    disableTemplateSave.value = false;
  }
});

// Start
(async () => {
  fetchReportEntities();
  getParametersData();
  const { result } = await getReportTemplates({ _queryFilter: `name eq ${templateId}` });

  if (result?.length) {
    const [existingTemplate] = result;
    const {
      name,
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

    reportDetails.value.name = startCase(name.replace(/-/, ' ').toLowerCase());
    reportDetails.value.description = description;
    reportDetails.value.report_admin = viewers.includes('report_admin');
    reportDetails.value.report_owner = viewers.includes('report_owner');
    reportDetails.value.report_viewer = viewers.includes('report_viewer');
    reportDetails.value.viewers = viewers.filter((item) => !defaultGroups.includes(item));

    findSettingsObject('entities').definitions.push(...await entityDefinitions(entities, fields));
    findSettingsObject('parameters').definitions.push(...parameterDefinitions(parameters));
    findSettingsObject('filter').definitions.push(...filterDefinitions(filter));
    findSettingsObject('aggregate').definitions.push(...aggregateDefinitions(aggregate));
    findSettingsObject('sort').definitions.push(...sortingDefinitions(sort));
    isFetchingTemplate.value = false;
  } else {
    displayNotification('warning', i18n.global.t('reports.tabs.runReport.errors.templateDoesNotExist'));
    router.push({ name: 'Reports' });
  }
})();
</script>
