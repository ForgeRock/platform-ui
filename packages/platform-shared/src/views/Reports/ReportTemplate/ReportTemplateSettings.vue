<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BCard
    body-class="p-0"
    class="fr-create-report-settings h-100 p-4 overflow-auto">
    <BCardTitle
      class="h5 mb-3"
      title-tag="h2">
      {{ $t('common.settings') }}
    </BCardTitle>
    <BTabs
      v-model="tabIndex"
      nav-class="fr-tabs mb-4">
      <BTab
        v-for="(tab, index) in tabItems"
        :active="tabIndex === index"
        :key="index"
        :title="tab.tabLabel">
        <template v-if="tabItems[index].id === 'dataTab'">
          <div
            v-for="(setting, settingIndex) in reportSettings"
            class="mb-4 pb-4"
            :data-testid="`${setting.id}-settings-container`"
            :class="{'border-bottom': reportSettings.length - 1 !== settingIndex}"
            :key="settingIndex">
            <div
              class="d-flex justify-content-between align-items-center mb-3 fr-report-settings-header"
              data-testid="setting-heading">
              <h3 class="h5 m-0">
                {{ setting.title }}
              </h3>
              <BButton
                v-if="!setting.hideAddDefinitionButton || setting.hideAddDefinitionButton() !== true"
                class="text-body px-2 py-0"
                variant="link"
                @click="openSettingsModal(setting.modal)">
                <FrIcon name="add" />
              </BButton>
            </div>
            <p class="mb-0">
              {{ setting.description }}
            </p>
            <template v-if="setting.definitions.length">
              <div
                v-if="setting.id === 'dataSources'"
                class="mt-4"
                data-testid="definition-body">
                <FrReportDataSourceDefinition
                  v-for="(definition, defIndex) in setting.definitions"
                  :data-source-columns="definition.dataSourceColumns"
                  :key="defIndex"
                  :name="definition.name"
                  :related-entities="definition.relatedEntities"
                  :selected-columns="definition.selectedColumns"
                  :selected-related-entities="definition.selectedRelatedEntities"
                  @delete-data-source="$emit('delete-data-source', defIndex)"
                  @set-column-selections="$emit('set-selected-data-source-columns', defIndex, $event)"
                  @set-related-entity-selection="$emit('set-selected-related-entity', defIndex, $event)" />
              </div>
              <div
                v-else
                class="mt-4 mb-2"
                data-testid="definition-body">
                <FrReportSettingsDefinition
                  v-for="(definition, defIndex) in setting.definitions"
                  :class="definitionCardStyles(defIndex, setting.definitions.length)"
                  :definition="definition"
                  :key="defIndex"
                  :name="definition.name"
                  :setting-id="setting.id"
                  :setting-title="setting.title"
                  @delete-definition="$emit('delete-definition', setting.id, defIndex)"
                  @edit-definition="openSettingsModal(setting.modal, definition)"
                  @set-aggregate="$emit('set-aggregate', definition.name, $event)" />
              </div>
            </template>
          </div>
        </template>
        <template v-if="tabItems[index].id === 'detailsTab'">
          Details content
        </template>
      </BTab>
    </BTabs>
  </BCard>
</template>

<script setup>
/**
 * @description
 * Create report settings panel with data and details tabs for creating custom analytics reports.
 */
import {
  BButton,
  BCard,
  BCardTitle,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { ref } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrReportDataSourceDefinition from './ReportDataSourceDefinition';
import FrReportSettingsDefinition from './ReportSettingsDefinition';
import i18n from '@/i18n';

const emit = defineEmits([
  'delete-data-source',
  'delete-definition',
  'open-settings-modal',
  'set-aggregate',
  'set-selected-data-source-columns',
  'set-selected-related-entities',
]);
defineProps({
  reportSettings: {
    type: Array,
    required: true,
  },
});

// Globals
const tabIndex = ref(0);

const tabItems = [
  {
    id: 'dataTab',
    tabLabel: i18n.global.t('common.data'),
  },
  {
    id: 'detailsTab',
    tabLabel: i18n.global.t('common.details'),
  },
];

// Functions

/**
 * Opens the definition editor modal
 * @param {String} modalId definition id name
 * @param {Object} definition definition object
 */
function openSettingsModal(modalId, definition) {
  emit('open-settings-modal', modalId, definition);
}

/**
 * Definition card styles
 * @param {Number} currentIndex current card index in the loop
 * @param {Number} totalItems total definition card list items
 */
function definitionCardStyles(currentIndex, totalItems) {
  const isFirstInList = currentIndex === 0;
  const isLastInList = currentIndex === totalItems - 1;
  const classList = [];

  if (isFirstInList) {
    classList.push('rounded-top');
  }

  if (isLastInList) {
    classList.push('rounded-bottom');
  } else {
    classList.push('border-bottom-0');
  }

  if (!isFirstInList && !isLastInList) {
    classList.push('rounded-0');
  }

  return classList.join(' ');
}
</script>

<style lang="scss" scoped>
:deep(.rounded-top) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

:deep(.rounded-bottom) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.fr-create-report-settings {
  width: 320px;
  min-width: 320px;
}

.fr-report-settings-header {
  min-height: 25px;

  button span {
    font-size: 24px;
  }
}
</style>
