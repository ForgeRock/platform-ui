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
  const processedColumns = ref([]);

  /**
   * Creates a list of definitions for a given entity list.
   * @param {Array} entities list entity names
   * @param {Array} fields entity columns
   * @returns {Array}
   */
  async function entityDefinitions(entities, fields) {
    if (entities?.length) {
      return Promise.all(entities.map(async (obj) => {
        const entityName = obj.entity;
        const fieldOptionsBody = {
          entities: [{ name: entityName, entity: entityName }],
          fields: [{ name: entityName, value: { options: {} } }],
        };
        const { data: dataSourceColumns } = await getReportEntityFieldOptions(fieldOptionsBody);

        if (dataSourceColumns && Object.keys(dataSourceColumns).length) {
          // Entity field options are returned as a string in period delimeter format,
          // 'entity.field.attribute', and we are intentionally removing the first part
          // to avoid repetition since it matches the data source entity name label.
          processedColumns.value = Object.keys(dataSourceColumns).map((key) => {
            const entityColumn = fields ? fields.find((field) => field.value === key) : [];
            const keyArr = key.split('.');
            keyArr.shift();
            return {
              format: dataSourceColumns[key].class,
              label: entityColumn?.label || keyArr.join('.'),
              type: dataSourceColumns[key].type,
              value: key,
            };
          });
        }
        const selectedColumns = fields
          ? processedColumns.value.filter((column) => fields.find((field) => field.value === column.value))
          : [];

        return {
          _id: entityName,
          name: entityName,
          dataSourceColumns: processedColumns.value,
          relatedDataSources: [],
          selectedColumns: selectedColumns.map(({ value }) => value),
          selectedRelatedDataSources: [],
        };
      }));
    }
    return [];
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
          _id,
          dataSourceColumns,
          selectedColumns,
        } = definition;
        const selectedDataSourceColumns = dataSourceColumns.filter((column) => selectedColumns.find((value) => value === column.value));
        const selectedColumnsProcessed = selectedDataSourceColumns.map(({ label, value }) => ({ label, value }));
        entities.push({ entity: _id, name: _id });
        fields.push(...selectedColumnsProcessed);
      });
      return { entities, fields };
    }
    return {};
  }

  /**
   * Gets all report entities
   */
  async function fetchReportEntities() {
    const { data: { result: responseEntities } } = await getReportEntities();
    if (responseEntities.length) {
      allEntities.value = responseEntities;
    }
  }

  const dataSourceColumnCheckboxNames = computed(() => allEntities.value.map(({ name }) => name));

  return {
    dataSourceColumnCheckboxNames,
    dataSourceColumns: processedColumns,
    entityDefinitions,
    entitiesPayload,
    fetchReportEntities,
  };
}
