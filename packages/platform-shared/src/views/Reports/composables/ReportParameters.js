/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed, ref } from 'vue';
import { getReportParameterTypes } from '@forgerock/platform-shared/src/api/AutoApi';
import { getManagedObject } from '@forgerock/platform-shared/src/utils/reportsUtils';

export default function useReportParameters() {
  const managedUserSchema = ref({});
  const parameterTypes = ref([]);

  /**
   * Finds a label for a given parameter type.
   * @param {String} type parameter type
   * @returns {String}
   */
  function inputTypeLabel(type) {
    return parameterTypes.value.find((paramType) => paramType.type === type)?.label || '';
  }

  /**
   * Gets the required parameters data: parameter types
   * and the "user" managed object schema properties.
   */
  async function fetchParametersData() {
    const [paramTypes, userSchema] = await Promise.all([
      getReportParameterTypes(),
      getManagedObject('user'),
    ]);
    parameterTypes.value = paramTypes.data || [];
    managedUserSchema.value = userSchema?.schema?.properties || {};
  }

  /**
   * Interprets the API data into a UI friendly data set.
   * @param {Object} definitions list of parameter definitions as they come in from the API
   * @returns {Array}
   */
  async function parameterDefinitions(definitions) {
    if (!parameterTypes.value.length) {
      await fetchParametersData();
    }

    if (definitions && Object.keys(definitions).length) {
      return Object.entries(definitions).map(([key, val]) => {
        let inputType = inputTypeLabel(val.type);

        if (val.type === 'array') {
          inputType = inputTypeLabel(val.item.type);
        }

        return {
          enumeratedValues: val.enum || [],
          helpText: val.description,
          inputType,
          inputLabel: val.label,
          multivalued: !!val.item,
          parameterType: val.source,
          parameterName: key,
          profileAttribute: val.profile_attribute,
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
            inputType,
            parameterName,
            parameterType,
            enumeratedValues,
            inputLabel,
            helpText,
            multivalued,
            profileAttribute,
          } = definition;

          if (parameterType === 'user_provided') {
            const inputTypeFromLabel = parameterTypes.value.find((paramType) => paramType.label === inputType).type;
            return {
              [parameterName]: {
                source: parameterType,
                label: inputLabel,
                description: helpText,
                type: multivalued ? 'array' : inputTypeFromLabel,
                ...(multivalued && { item: { type: inputTypeFromLabel } }),
                ...(enumeratedValues.length && inputType === 'String' && { enum: enumeratedValues }),
              },
            };
          }
          // profile attribute
          return {
            [parameterName]: {
              type: managedUserSchema.value[profileAttribute]?.type,
              source: parameterType,
              profile_attribute: profileAttribute,
              ...(managedUserSchema.value[profileAttribute]?.type === 'array' && { item: { type: 'string' } }),
            },
          };
        }).reduce((a, c) => ({ ...a, ...c }), {}),
      };
    }
    return {};
  }

  const parameterTypeLabels = computed(() => parameterTypes.value.map(({ label }) => label));
  const profileAttributeNames = computed(() => Object.keys(managedUserSchema.value).map((key) => key));

  return {
    parameterDefinitions,
    parameterTypeLabels,
    parametersPayload,
    profileAttributeNames,
  };
}
