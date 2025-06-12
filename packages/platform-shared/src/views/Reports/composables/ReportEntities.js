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
  const allRelatedDataSources = ref([]);
  const topLevelEntityList = ref([]);

  /**
   * Gets all report entities including related entities.
   * @param {String} entity optinally used for fetching related entities
   */
  async function fetchReportEntities(entity) {
    const isTopLevelEntity = !entity || entity.split('.').length === 1;
    const { data: { result: responseEntities } } = await getReportEntities(entity);

    if (entity && responseEntities.length) {
      // returning related entities here
      return responseEntities.sort((a, b) => sortCompare(a, b, 'label'));
    }
    if (isTopLevelEntity) {
      topLevelEntityList.value.push(...responseEntities.map(({ name, label }) => ({ name, label })));
    }
    allEntities.value = responseEntities
      .map(({ label, name }) => ({ text: label, value: name }))
      .sort((a, b) => sortCompare(a, b, 'text'));
    return [];
  }

  /**
   * Creates a list of UI friendly definitions for an API list of entities.
   * @param {Array} entities list entity names
   * @param {Array} selectedFields selected entity columns
   * @param {Boolean} add determines if dataSourceColumns should be added to the original list.
   * @returns {Array}
   */
  async function entityDefinitions(entities, selectedFields, add = false) {
    if (!entities || entities.length === 0 || add === false) {
      allDataSourceColumns.value = [];
    }

    if (entities?.length) {
      const columnsGetList = [];
      const relatedEntitiesGetList = [];
      entities.forEach(({ entity }) => {
        const fieldOptionsBody = {
          entities: [{ entity }],
          fields: [{ value: { options: {} } }],
        };
        columnsGetList.push(getReportFieldOptions(fieldOptionsBody));
        relatedEntitiesGetList.push(fetchReportEntities(entity));
      });
      const columnsData = await Promise.all(columnsGetList);
      const relatedDataSources = await Promise.all(relatedEntitiesGetList);
      const columns = columnsData.map(({ data }) => data);

      allRelatedDataSources.value.push(...relatedDataSources.flat());

      return Promise.all(entities.map(async ({ entity, type }, index) => {
        const currentDataSourceColumns = ref([]);

        if (columns[index] && Object.keys(columns[index]).length) {
          const entityColumns = Object.keys(columns[index]).map((columnName) => {
            const entityColumn = selectedFields ? selectedFields.find(({ value }) => value === columnName) : {};
            return {
              format: columns[index][columnName].class,
              label: columns[index][columnName].label || columnName.split('.').pop(),
              columnLabel: entityColumn?.label || columns[index][columnName].column_label || columnName.split('.').pop() || '',
              type: columns[index][columnName].type,
              path: columnName,
            };
          }).sort((a, b) => sortCompare(a, b, 'label'));

          allDataSourceColumns.value.push(...entityColumns);
          currentDataSourceColumns.value = entityColumns;
        }

        const selectedColumns = selectedFields?.length
          ? selectedFields
            .map((field, i) => ({ ...field, order: i }))
            .filter((field) => currentDataSourceColumns.value.find(({ path }) => path === field.value))
            .map(({ value, order }) => ({ path: value, order }))
          : [];
        const entityResourceNames = entities.map(({ entity: entityName }) => entityName);
        const relatedPaths = entityResourceNames.filter((resource) => allRelatedDataSources.value.map(({ name }) => name).includes(resource));
        const relatedDataSourceLabel = (name) => allRelatedDataSources.value.find(({ name: relatedName }) => relatedName === name)?.label || name;
        const selectedRelatedDataSources = relatedPaths.map((path) => ({ path, label: relatedDataSourceLabel(path) }));
        const entityNameArr = entity.split('.');
        const dataSourcePathLabel = entityNameArr.map((name, pathIndex) => {
          // For top level entities, we search through the topLevelEntityList list
          if (pathIndex === 0) {
            const findEntity = topLevelEntityList.value.find(({ name: entityName }) => entityName === name);
            return findEntity.label;
          }

          // If this is a related entity, we search through the allRelatedDataSources list
          const nameAggregate = entityNameArr.slice(0, pathIndex + 1).join('.');
          const findRelatedEntity = allRelatedDataSources.value.find(({ name: sourceName }) => sourceName === nameAggregate);
          if (findRelatedEntity) return findRelatedEntity.label;

          // If we can't find the entity in either list, we return the name as is
          return name;
        }).join(' / ');

        return {
          dataSource: entity,
          dataSourceColumns: currentDataSourceColumns,
          dataSourcePathLabel,
          relatedDataSources: relatedDataSources[index] || [],
          selectedColumns,
          selectedRelatedDataSources,
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
        const selectedDataSourceColumns = selectedColumns.map((source) => dataSourceColumns.find((column) => column.path === source.path));
        const selectedColumnsProcessed = selectedDataSourceColumns.map(({ columnLabel, path }) => ({ label: columnLabel, value: path }));
        selectedColumns.forEach((column, i) => {
          fields[column.order] = selectedColumnsProcessed[i];
        });
        entities.push({ entity: dataSource, ...(joinType && { type: joinType }) });
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
