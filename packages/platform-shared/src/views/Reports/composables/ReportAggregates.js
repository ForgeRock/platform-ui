/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed, ref } from 'vue';
import { getReportFieldOptions, getAggregateTypes } from '@forgerock/platform-shared/src/api/AutoApi';

/**
 * Handles the underlying logic for the aggregates setting
 * @param {Array} entitiesPayload operator condition
 * @param {Array} parametersPayload entity definitions
 * @param {Array} filtersPayload parameter definitions
 */
export default function useReportAggregates(entitiesPayload, parametersPayload, filtersPayload) {
  const aggregateTypes = ref([]);
  const aggregateValues = ref({});

  /**
   * Fetches options for the right value select field in the aggregates modal form.
   * @param {String} aggregateType middle operator type condition
   * @param {Array} entityDefinitions entity definitions
   * @param {Array} parameterDefinitions parameter definitions
   * @param {Array} filterDefinitions filter definitions
   */
  async function getFieldOptionsForAggregates(aggregateType, entityDefinitions, parameterDefinitions, filterDefinitions) {
    const fieldOptionsBody = {
      ...entitiesPayload(entityDefinitions),
      ...parametersPayload(parameterDefinitions),
      ...filtersPayload(filterDefinitions),
      aggregate: {
        fields: [{
          label: '',
          aggregate: {
            [aggregateType]: { options: {} },
          },
        }],
      },
    };

    try {
      const { data } = await getReportFieldOptions(fieldOptionsBody);

      aggregateValues.value[aggregateType] = Object.keys(data).map((key) => {
        const { class: category, label, type } = data[key];
        return {
          class: category,
          name: label || key,
          type,
        };
      });
    } catch (error) {
      return error;
    }
    return Promise.resolve();
  }

  /**
   * Constructs a UI friendly data list of aggregate definitions
   * @param {Object} definitions definitions data from the API
   * @returns {Array}
   */
  function aggregateDefinitions(definitions) {
    if (definitions && Object.keys(definitions).length) {
      const { fields } = definitions;
      return fields.map((field) => {
        const { aggregate, label } = field;
        const [[type, value]] = Object.entries(aggregate);
        return { label, type, value };
      });
    }
    return [];
  }

  /**
   * Constructs an API friendly data set of the aggregate definitions
   * @param {Array} definitions definitions list from the UI
   * @returns {Object}
   */
  function aggregatesPayload(definitions) {
    if (definitions.length) {
      return {
        aggregate: {
          fields: definitions.map((definition) => {
            const { type, label, value } = definition;
            return {
              label,
              aggregate: { [type]: value },
            };
          }),
        },
      };
    }
    return {};
  }

  /**
   * Fetches the aggregate type options for the aggregates modal.
   */
  async function fetchAggregateTypes() {
    aggregateTypes.value = await getAggregateTypes();
  }

  // Computed
  const aggregateValueList = computed(() => {
    const aggregateValueKeys = Object.keys(aggregateValues.value);
    if (aggregateValueKeys.length) {
      const arrayOfOperatorsAndFieldOptions = aggregateValueKeys.map((key) => ({
        [key]: aggregateValues.value[key].map(({ name }) => name),
      }));
      // Creates an object of the list of operators above with the key being the
      // operator and the value being its respective array of right value field options.
      return arrayOfOperatorsAndFieldOptions.reduce((accumulator, currentValue) => ({
        ...accumulator, ...currentValue,
      }), {});
    }
    return {};
  });

  return {
    aggregateDefinitions,
    aggregateTypes,
    aggregateValueList,
    aggregatesPayload,
    fetchAggregateTypes,
    getFieldOptionsForAggregates,
  };
}
