/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { getReportFieldOptions } from '@forgerock/platform-shared/src/api/AutoApi';

/**
 * Handles the "Reporting" settings block for a custom report.
 * It serves to populate form options for the sorting modal as well as
 * interpret the expected data structure for both the UI and the API.
 * @param {Object} entitiesPayload entity definitions
 * @param {Object} parametersPayload parameter definitions
 * @param {Object} filtersPayload filter definitions
 * @param {Object} aggregatesPayload aggregate definitions
 */
export default function useReportSorting(entitiesPayload, parametersPayload, filtersPayload, aggregatesPayload) {
  const sortByValues = ref([]);

  /**
   * Fetches options for the "Sort by" select field in the sorting modal form.
   * @param {Array} entityDefinitions entity definitions
   * @param {Array} parameterDefinitions parameter definitions
   * @param {Array} filterDefinitions filter definitions
   * @param {Array} aggregateDefinitions aggregate definitions
   */
  async function getFieldOptionsForSorting(entityDefinitions, parameterDefinitions, filterDefinitions, aggregateDefinitions) {
    const fieldOptionsBody = {
      ...entitiesPayload(entityDefinitions),
      ...parametersPayload(parameterDefinitions),
      ...filtersPayload(filterDefinitions),
      ...aggregatesPayload(aggregateDefinitions),
      sort: [{
        value: {
          options: {},
        },
      }],
    };
    const { data } = await getReportFieldOptions(fieldOptionsBody);

    sortByValues.value = Object.keys(data)
      .filter((path) => data[path].class !== 'parameter')
      .map((path) => {
        const {
          class: category,
          column_label: columnLabel,
          label,
          type,
        } = data[path];
        const entityColumn = fieldOptionsBody.fields
          ? fieldOptionsBody.fields.find(({ value }) => value === path)
          : {};

        return {
          class: category,
          columnLabel: entityColumn?.label || columnLabel || '',
          label: label || path,
          type,
          value: path,
        };
      });

    return Promise.resolve();
  }

  /**
   * Interprets the API data into a UI friendly data set.
   * @param {Array} definitions list of sorting definitions as they come in from the API
   * @returns {Array}
   */
  function sortingDefinitions(definitions) {
    if (definitions?.length) {
      return definitions.map(({ direction, label, value }) => ({ direction, columnLabel: label, value }));
    }
    return [];
  }

  /**
   * Interprets the UI definition data into an API friendly data set.
   * @param {Array} definitions list of sorting definitions as constructed by the UI
   * @returns {Object}
   */
  function sortingPayload(definitions) {
    if (definitions.length) {
      return {
        sort: definitions.map(({ direction, columnLabel: label, value }) => ({ direction, label, value })),
      };
    }
    return {};
  }

  return {
    getFieldOptionsForSorting,
    sortByValues,
    sortingDefinitions,
    sortingPayload,
  };
}
