/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { computed, ref } from 'vue';
import { getReportEntityFieldOptions, getReportEntities } from '@forgerock/platform-shared/src/api/AutoApi';
import i18n from '@/i18n';

export default function useReportEntities() {
  const allEntities = ref([{ name: i18n.global.t('common.loadingEtc') }]);

  /**
   * Gets the information for the given Data Source entity and returns
   * a set of field options for entity column checkboxes.
   * @param {String} dataSource entity name
   * @returns {Array} promise
   */
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

  /**
   * Creates a list of definitions for a given entity list.
   * @param {Array} entities list entity names
   * @returns {Object}
   */
  function entityDefinitions(entities) {
    if (entities?.length) {
      return Promise.all(entities.map(async (obj) => {
        const entityName = obj.entity;
        // API IS RETURNING RELATED ENTITIES BUT INSTRUCTIONS ARE TO
        // IGNORE THIS DATA UNTIL API IS READY TO HANDLE RELATED ENTITIES.
        // BELOW CONST IS PURPOSEFULLY LEFT COMMENTED OUT UNTIL WE REVISIT THIS.
        // const { relatedEntities = [] } = allEntities.value.find((entity) => entity.name === entityName) || {};
        const dataSourceColumns = await getDataSourceColumns(entityName);
        return {
          _id: obj.entity,
          name: obj.entity,
          dataSourceColumns,
          relatedEntities: [],
          selectedColumns: [],
          selectedRelatedEntities: [],
        };
      }));
    }
    return [];
  }

  function entitiesPayload(definitions) {
    if (definitions.length) {
      return {
        // Purposefully commented out as structure
        // will be hooked up in future story:
        // entitities: {},
        // fields: {},
      };
    }
    return {};
  }

  async function fetchReportEntities() {
    const { data: { result: responseEntities } } = await getReportEntities();
    if (responseEntities.length) {
      allEntities.value = responseEntities;
    }
  }

  const entityOptions = computed(() => allEntities.value.map(({ name }) => name));

  return {
    entityDefinitions,
    entityOptions,
    entitiesPayload,
    fetchReportEntities,
  };
}
