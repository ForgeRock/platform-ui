/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import i18n from '@/i18n';

/**
 * Global custom report template composable for handling report settings data
 * @param {Object} parametersPayload Parameters payload
 * @param {Object} entitiesPayload Entities payload
 * @param {Object} filtersPayload Filters payload
 * @param {Object} aggregatesPayload Aggregates payload
 * @param {Object} sortingPayload Sorting payload
 */
export default function useReportSettings(
  parametersPayload,
  entitiesPayload,
  filtersPayload,
  aggregatesPayload,
  sortingPayload,
) {
  /**
   * All report settings are defined in this array
   */
  const reportSettings = ref([
    {
      _id: 'entities',
      title: i18n.global.t('reports.template.dataSources'),
      description: i18n.global.t('reports.template.dataSourcesSettingDescription'),
      hideAddDefinitionButton: () => !!reportSettings.value.find((setting) => setting._id === 'entities').definitions.length,
      modal: 'report-data-sources-modal',
      definitions: [],
      payload: entitiesPayload,
    },
    {
      _id: 'parameters',
      title: i18n.global.t('common.parameters'),
      description: i18n.global.t('reports.template.parametersSettingDescription'),
      modal: 'report-parameters-modal',
      definitions: [],
      payload: parametersPayload,
    },
    {
      _id: 'filter',
      title: i18n.global.t('common.filters'),
      description: i18n.global.t('reports.template.filtersSettingDescription'),
      disableAddDefinitionButton: () => {
        const [entity] = reportSettings.value.find((setting) => setting._id === 'entities').definitions;
        return !entity?.selectedColumns?.length;
      },
      hideAddDefinitionButton: () => !!reportSettings.value.find((setting) => setting._id === 'filter').definitions.length,
      modal: 'report-filters-modal',
      definitions: [],
      payload: filtersPayload,
    },
    {
      _id: 'aggregate',
      title: i18n.global.t('common.aggregate'),
      description: i18n.global.t('reports.template.aggregatesSettingDescription'),
      modal: 'report-aggregates-modal',
      definitions: [],
      payload: aggregatesPayload,
    },
    {
      _id: 'sort',
      title: i18n.global.t('common.sorting'),
      description: i18n.global.t('reports.template.sortingSettingDescription'),
      modal: 'report-sorting-modal',
      definitions: [],
      payload: sortingPayload,
    },
  ]);

  /**
   * Finds an object in the above reportSettings list
   * @param {String} settingId Report setting id property value
   * @returns {Object}
   */
  function findSettingsObject(settingId) {
    return reportSettings.value.find((setting) => setting._id === settingId);
  }

  /**
   * Finds a definition object from a list of definitions within a specific settings object
   * @param {String} settingId Report setting id property value
   * @param {Number} definitionIndex definition index position
   * @returns {Object}
   */
  function findDefinition(settingId, definitionIndex) {
    const settingsObject = reportSettings.value.find((setting) => setting._id === settingId);
    return settingsObject.definitions[definitionIndex];
  }

  /**
   * Generates a new set of definitions from the "newDefinition" argument.
   *
   * If the "newDefinition" argument is an object, then the assumption
   * is that the definition is intended to either be added or replaced.
   *
   * If the "newDefinition" argument is a string, then the assumption is that
   * the definition is intended to be deleted from the existingDefinitions list.
   * @param {Array} existingDefinitions Existing list of definitions.
   * @param {Number} definitionIndex Definition index position if it exists
   * @param {Object} currentDefinition updated definition object
   * @returns {Array}
   */
  function generateNewDefinitions(existingDefinitions, definitionIndex, currentDefinition) {
    const filteredDefinitions = existingDefinitions.filter((obj, index) => index !== definitionIndex);

    if (definitionIndex !== undefined && definitionIndex !== -1 && currentDefinition) {
      // We only want to replace the definition if the newDefinition exists within the
      // existingDefinitions array, otherwise we make the assuption that the intention is
      // to delete the given definition so we just return the filtered definitions.
      filteredDefinitions.splice(definitionIndex, 0, currentDefinition);
    } else if (currentDefinition) {
      // new definition so we just push the new object to the end of the existing list
      return [...existingDefinitions, currentDefinition];
    }

    return filteredDefinitions;
  }

  /**
   * Generates a new set of settings with an updated list of given definitions.
   * @param {String} settingsId Settings ID for one of the reportSettings objects
   * @param {Array} updatedDefinitions A new list of updated definitions for the given settingId
   * @param {Array} settings Optional all settings array object
   */
  function generateNewSettings(settingsId, updatedDefinitions, settings = reportSettings.value) {
    const filteredSettings = settings.filter((settingObj) => settingObj._id !== settingsId);
    const [currentSetting] = settings.filter((settingObj) => settingObj._id === settingsId);
    const updatedSetting = { ...currentSetting, definitions: updatedDefinitions };
    return [updatedSetting, ...filteredSettings];
  }

  /**
   * Constructs a report template object ready for API consumption.
   * Relies on external setting composables that generate their respective
   * payload independently since each setting has unique requirements.
   * @param {Array} settings all report settings
   * @param {Array} params optional data for the payload function
   * @returns {Object}
   */
  function reportPayload(settings, params) {
    return settings
      .map((setting) => setting.payload(setting.definitions, params))
      .reduce((a, c) => ({ ...a, ...c }), {});
  }

  return {
    findDefinition,
    findSettingsObject,
    generateNewDefinitions,
    generateNewSettings,
    reportPayload,
    reportSettings,
  };
}
