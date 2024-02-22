<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <div class="h-100 d-flex flex-column">
    <FrReportTemplateHeader
      :disable-save="disableSave"
      :report-state="reportState"
      :is-saving="isSaving"
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
          :report-settings="reportSettings"
          @delete-data-source="deleteDataSource"
          @delete-definition="deleteDefinition"
          @delete-related-entity="deleteRelatedEntity"
          @edit-definition="openSettingsModal"
          @open-settings-modal="openSettingsModal"
          @set-aggregate="setAggregate"
          @set-selected-data-source-columns="setSelectedDataSourceColumns"
          @set-selected-related-entity="setSelectedRelatedEntity" />
      </template>
      <FrReportAddDataSourceCard
        v-else
        @open-data-source-modal="$bvModal.show('report-data-sources-modal')" />
    </main>
    <FrReportDataSourceModal
      :data-sources="dataSourcesOptions"
      :is-saving="fetchingDataSourceColumns"
      :is-testing="isTesting"
      @add-data-source="addDataSource" />
  </div>
</template>

<script setup>
/**
 * @description
 * Main component that gives an admin the ability to create custom platform analytics reports.
 */
import { computed, ref } from 'vue';
import { displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { getReportEntities, getReportEntityFieldOptions } from '@forgerock/platform-shared/src/api/AutoApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrReportTemplateHeader from './ReportTemplate/ReportTemplateHeader';
import FrReportAddDataSourceCard from './ReportTemplate/ReportAddDataSourceCard';
import FrReportDataSourceTable from './ReportTemplate/ReportDataSourceTable';
import FrReportTemplateSettings from './ReportTemplate/ReportTemplateSettings';
import FrReportDataSourceModal from './modals/ReportDataSourceModal';
import i18n from '@/i18n';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

// Composables
const { bvModal } = useBvModal();

// Globals
const allEntities = ref([{ name: i18n.global.t('common.loadingEtc') }]);
const currentDefinitionBeingEdited = ref({});
const disableSave = ref(true);
const fetchingDataSourceColumns = ref(false);
const isSaving = ref(false);
const reportSettings = ref([
  {
    id: 'dataSources',
    title: i18n.global.t('reports.template.dataSources'),
    description: i18n.global.t('reports.template.dataSourcesSettingDescription'),
    hideAddDefinitionButton: () => !!reportSettings.value.find((setting) => setting.id === 'dataSources').definitions.length,
    modal: 'report-data-sources-modal',
    definitions: [],
  },
  {
    id: 'parameters',
    title: i18n.global.t('common.parameters'),
    description: i18n.global.t('reports.template.parametersSettingDescription'),
    modal: 'report-parameters-modal',
    definitions: [
      {
        name: 'Account Status',
        parameterType: 'User Provided',
      },
      {
        name: 'Users',
        parameterType: 'Hidden',
      },
    ],
  },
  {
    id: 'filters',
    title: i18n.global.t('common.filters'),
    description: i18n.global.t('reports.template.filtersSettingDescription'),
    hideAddDefinitionButton: () => !!reportSettings.value.find((setting) => setting.id === 'filters').definitions.length,
    modal: 'report-filters-modal',
    definitions: [{}],
  },
  {
    id: 'aggregates',
    title: i18n.global.t('common.aggregate'),
    description: i18n.global.t('reports.template.aggregatesSettingDescription'),
    modal: 'report-aggregates-modal',
    definitions: [
      {
        name: 'My aggregate 1',
        parameterType: 'User Provided',
        checked: false,
      },
      {
        name: 'My aggregate 2',
        parameterType: 'User Provided',
        checked: false,
      },
    ],
  },
  {
    id: 'sorting',
    title: i18n.global.t('common.sorting'),
    description: i18n.global.t('reports.template.sortingSettingDescription'),
    modal: 'report-aggregates-modal',
    definitions: [
      {
        sortBy: 'First Name',
        direction: 'desc',
      },
      {
        sortBy: 'Last Name',
        direction: 'asc',
      },
    ],
  },
]);
const reportState = ref('draft');
const templateName = ref(i18n.global.t('reports.template.newReportTemplate'));

// Functions
function findSettingsObject(settingId) {
  return reportSettings.value.find((setting) => setting.id === settingId);
}

async function getDataSourceColumns(dataSource) {
  const { data: columns } = await getReportEntityFieldOptions({
    entities: [{
      name: dataSource,
      entity: dataSource,
    }],
    fields: [{
      name: dataSource,
      value: {
        options: {},
      },
    }],
  });

  if (columns && Object.keys(columns).length) {
    // Entity field options are returned as a string in period delimeter format,
    // 'entity.field.attribute', and we are intentionally removing the first part
    // to avoid repetition since it matches the data source entity name label.
    const processedColumnNames = Object.keys(columns).map((key) => {
      const keyArr = key.split('.');
      keyArr.shift();
      return keyArr.join('.');
    });
    return Promise.resolve(processedColumnNames);
  }
  return Promise.resolve([]);
}

async function addDataSource(dataSourceName) {
  if (dataSourceName) {
    fetchingDataSourceColumns.value = true;
    const dataSourceColumns = await getDataSourceColumns(dataSourceName);
    const { relatedEntities = [] } = allEntities.value.find((entity) => entity.name === dataSourceName) || {};

    displayNotification('success', i18n.global.t('reports.template.dataSetAdded'));
    // Purposeful sequential visual delay to first allow the
    // user to read the success message, then hides the modal.
    setTimeout(() => {
      findSettingsObject('dataSources').definitions.push({
        name: dataSourceName,
        dataSourceColumns,
        relatedEntities,
        selectedColumns: [],
        selectedRelatedEntities: [],
      });
      bvModal.value.hide('report-data-sources-modal');
      fetchingDataSourceColumns.value = false;
    }, 1001);
  }
  return Promise.resolve();
}

function setSelectedDataSourceColumns(defIndex, columns) {
  findSettingsObject('dataSources').definitions[defIndex].selectedColumns = columns;
}

async function setSelectedRelatedEntity(defIndex, relatedEntityName) {
  const currentDefinition = findSettingsObject('dataSources').definitions[defIndex];
  const relatedDataSourceName = [currentDefinition.name, relatedEntityName].join('.');
  await addDataSource(relatedDataSourceName);
  currentDefinition.selectedRelatedEntities.push(relatedEntityName);
}

function duplicateTemplate() {
}

function deleteDefinition(settingsId, defIndex) {
  findSettingsObject(settingsId).definitions.splice(defIndex, 1);
}

function deleteDataSource(defIndex) {
  const dataSources = findSettingsObject('dataSources');
  const definitionNamePath = dataSources.definitions[defIndex].name;
  const definitionPathArray = definitionNamePath.split('.');
  const currentDefinitionName = definitionPathArray.pop();
  const parentDefinitionName = definitionPathArray.join('.');
  const parentDefinition = dataSources.definitions.find((def) => def.name === parentDefinitionName);
  const deleteQueue = [];

  if (parentDefinition) {
    // Remove the selected related data source item from the parent data source definition
    parentDefinition.selectedRelatedEntities = parentDefinition.selectedRelatedEntities.filter((entity) => entity !== currentDefinitionName);
  }

  dataSources.definitions.forEach((def) => {
    if (def.name.split('.').includes(currentDefinitionName)) {
      deleteQueue.push(def.name);
    }
  });

  // Remove any nested related data sources
  dataSources.definitions = dataSources.definitions.filter((def) => !deleteQueue.includes(def.name));
}

function deleteTemplate() {
}

function openSettingsModal(modalId, definition = {}) {
  currentDefinitionBeingEdited.value = definition;
  bvModal.value.show(modalId);
}

function hydrateDataSources(entities) {
  allEntities.value = Array.isArray(entities) && entities.length
    ? entities
    : [];
}

function saveTemplate() {
}

function setAggregate(name, value) {
  const definition = findSettingsObject('aggregates').definitions.find((def) => def.name === name);
  definition.checked = value;
}

// Computed
const templateHasAtLeastOneDataSource = computed(() => findSettingsObject('dataSources').definitions.length);
const dataSourcesOptions = computed(() => allEntities.value.map(({ name }) => name));

// Start
(async () => {
  try {
    const { data: { result } } = await getReportEntities();
    hydrateDataSources(result);
  } catch (error) {
    throw new Error(error);
  }
})();
</script>
