/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { getReportFieldOptions, getReportEntities } from '@forgerock/platform-shared/src/api/AutoApi';
import useReportSettings from './ReportSettings';
import i18n from '@/i18n';

/**
 * Provides the ability to fetch for all report entities as well as compose UI and
 * API friendly data sets for displaying and sending expected data structures.
 */
export default function useReportEntities() {
  const { sortCompare } = useReportSettings();
  const allEntities = ref([{ name: i18n.global.t('common.loadingEtc') }]);
  const allDataSourceColumns = ref([]);

  /**
   * Gets all report entities including related entities.
   * @param {String} entity optinally used for fetching related entities
   */
  async function fetchReportEntities(entity) {
    const { data: { result: responseEntities } } = await getReportEntities(entity);

    if (entity && responseEntities.length) {
      // returning related entities here
      return responseEntities.sort((a, b) => sortCompare(a, b, 'label'));
    }

    allEntities.value = responseEntities
      .map(({ label, name }) => ({ text: label, value: name }))
      .sort((a, b) => sortCompare(a, b, 'text'));
    return [];
  }

  /**
   * Creates a list of UI friendly definitions for an API list of entities.
   * @param {Array} entities list entity names
   * @param {Array} fields entity columns
   * @param {Boolean} add determines if dataSourceColumns should be added to the original list.
   * @returns {Array}
   */
  async function entityDefinitions(entities, fields, add = false) {
    if (!entities || entities.length === 0 || add === false) {
      allDataSourceColumns.value = [];
    }

    if (entities?.length) {
      return Promise.all(entities.map(async ({ entity, type }) => {
        const entityNameArr = entity.split('.');
        const fieldOptionsBody = {
          entities: [{ entity }],
          fields: [{ value: { options: {} } }],
        };
        const [{ data: dataSourceColumns }, relatedDataSources] = await Promise.all([getReportFieldOptions(fieldOptionsBody), fetchReportEntities(entity)]);
        const currentDataSourceColumns = ref([]);

        if (dataSourceColumns && Object.keys(dataSourceColumns).length) {
          const entityColumns = Object.keys(dataSourceColumns).map((columnName) => {
            const entityColumn = fields ? fields.find(({ value }) => value === columnName) : {};
            return {
              format: dataSourceColumns[columnName].class,
              label: dataSourceColumns[columnName].label || columnName.split('.').pop(),
              columnLabel: entityColumn?.label || dataSourceColumns[columnName].column_label || columnName.split('.').pop() || '',
              type: dataSourceColumns[columnName].type,
              path: columnName,
            };
          }).sort((a, b) => sortCompare(a, b, 'label'));

          allDataSourceColumns.value.push(...entityColumns);
          currentDataSourceColumns.value = entityColumns;
        }

        const selectedColumns = fields?.length
          ? fields
            .filter((field) => currentDataSourceColumns.value.find(({ path }) => path === field.value))
            .map(({ value }) => value)
          : [];
        const entityResourceNames = entities.map(({ entity: entityName }) => entityName);

        return {
          dataSource: entity,
          dataSourceColumns: currentDataSourceColumns,
          relatedDataSources,
          selectedColumns,
          selectedRelatedDataSources: entityResourceNames.filter((resource) => relatedDataSources.map(({ name }) => name).includes(resource)),
          // If entityNameArr has more than one item, it means that this is a related entity and
          // it is intended to only add the joinType property to related entity definitions.
          ...(entityNameArr.length > 1 && { joinType: type || 'left' }),
        };
      }));
    }
    return Promise.resolve([]);
  }

  /**
   * Creates an API friendly payload for entities / fields
   * @param {Array} definitions entity definitions list
   * @returns {Object}
   */
  function entitiesPayload(definitions) {
    if (definitions.length) {
      const entities = [];
      const fields = [];
      definitions.forEach((definition) => {
        const {
          dataSourceColumns,
          dataSource,
          joinType,
          selectedColumns,
        } = definition;
        const selectedDataSourceColumns = selectedColumns.map((source) => dataSourceColumns.find((column) => column.path === source));
        const selectedColumnsProcessed = selectedDataSourceColumns.map(({ columnLabel, path }) => ({ label: columnLabel, value: path }));
        entities.push({ entity: dataSource, ...(joinType && { type: joinType }) });
        fields.push(...selectedColumnsProcessed);
      });
      return { entities, fields };
    }
    return {};
  }

  return {
    dataSources: allEntities,
    dataSourceColumns: allDataSourceColumns,
    entityDefinitions,
    entitiesPayload,
    fetchReportEntities,
  };
}
