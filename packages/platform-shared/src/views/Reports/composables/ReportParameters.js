/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed, ref } from 'vue';
import { getReportParameterTypes } from '@forgerock/platform-shared/src/api/AutoApi';

export default function useReportParameters() {
  const basicParameterTypes = ref([]);
  const dataSourceParameterTypes = ref([]);

  /**
   * Gets the required parameters data types from the API.
   * This includes the "basic" and the "datasource" managed object schema properties.
   */
  async function fetchParametersData() {
    const [basicParamTypes, dataSourceParamTypes] = await Promise.all([
      getReportParameterTypes(),
      getReportParameterTypes('?source=datasource'),
    ]);

    basicParameterTypes.value = basicParamTypes.data || [];
    dataSourceParameterTypes.value = dataSourceParamTypes.data || [];
  }

  /**
   * Interprets the API data into a UI friendly data set.
   * @param {Object} definitions list of parameter definitions as defined by the API
   * @returns {Array}
   */
  async function parameterDefinitions(definitions) {
    if (!basicParameterTypes.value.length || !dataSourceParameterTypes.value.length) {
      await fetchParametersData();
    }

    if (definitions && Object.keys(definitions).length) {
      return Object.entries(definitions).map(([key, val]) => {
        const dataSourceProperties = {
          ...(val.source === 'datasource' && {
            dataSource: val.entity,
            dataSourceProperty: val.attribute,
          }),
        };
        let inputType = val.type;

        if (val.type === 'array') {
          inputType = val.item.type;
        }

        return {
          helpText: val.description,
          inputType,
          inputLabel: val.label,
          multivalued: !!val.item,
          parameterName: key,
          source: val.source || val.parameterType,
          ...dataSourceProperties,
          ...(val.enum && { enumeratedValues: val.enum }),
        };
      });
    }
    return [];
  }

  /**
   * We interpret the UI data into an API friendly payload for each parameter.
   * @param {Array} definitions list of parameter definitions
   * @returns {Object}
   */
  function parametersPayload(definitions) {
    if (definitions.length) {
      return {
        parameters: definitions.map((definition) => {
          const {
            dataSource,
            dataSourceProperty,
            inputType = 'string',
            parameterName,
            parameterType,
            enumeratedValues,
            inputLabel,
            helpText,
            multivalued,
            source,
          } = definition;
          const dataSourceProperties = {
            ...(source === 'datasource' && {
              entity: dataSource,
              attribute: dataSourceProperty,
            }),
          };

          return {
            [parameterName]: {
              source: source || parameterType,
              label: inputLabel,
              description: helpText,
              type: multivalued ? 'array' : inputType,
              ...dataSourceProperties,
              ...(multivalued && { item: { type: inputType } }),
              ...(enumeratedValues?.length && inputType.toLowerCase() === 'string' && { enum: enumeratedValues }),
            },
          };
        }).reduce((a, c) => ({ ...a, ...c }), {}),
      };
    }
    return {};
  }

  const basicParameterTypeFormat = computed(() => basicParameterTypes.value.map((param) => ({
    text: param.label,
    value: { ...param },
  })));
  const dataSourceParameterTypesFormat = computed(() => {
    if (dataSourceParameterTypes.value.some((obj) => obj.attributes)) {
      return dataSourceParameterTypes.value.map((obj) => ({
        ...obj,
        attributes: obj.attributes?.map((attr) => ({ text: attr.label, value: { ...attr } })),
      }));
    }
    return [];
  });

  return {
    basicParameterTypeFormat,
    dataSourceParameterTypesFormat,
    parameterDefinitions,
    parametersPayload,
  };
}
