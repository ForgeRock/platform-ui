/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed, ref } from 'vue';
import { getReportOperators, getReportEntityFieldOptions } from '@forgerock/platform-shared/src/api/AutoApi';

export default function useReportFilters(entityColumns, entitiesPayload, parametersPayload) {
  const conditionalsFromApi = ref([]);
  const filterVariables = ref({});

  /**
   * Gets necessary data for the report filters setting modal
   * @param {String} operator operator value
   * @param {Array} entityDefinitions entity definitions
   * @param {Array} parameterDefinitions parameter definitions
   */
  async function getFieldOptionsForFilters(operator, entityDefinitions, parameterDefinitions) {
    const fieldOptionsBody = {
      ...entitiesPayload(entityDefinitions),
      ...parametersPayload(parameterDefinitions),
      filter: {
        [operator]: {
          left: { options: {} },
          right: { options: {} },
        },
      },
    };
    const { data } = await getReportEntityFieldOptions(fieldOptionsBody);

    filterVariables.value[operator] = Object.keys(data).map((key) => {
      const { class: category, label, type } = data[key];
      return {
        class: category,
        name: label || key,
        type,
      };
    });

    return Promise.resolve();
  }

  /**
   * Creates a list of filter rules from user input
   * @param {Object} definition filter definition
   * @param {String} groupOperator rule group operator
   * @param {Array} entityDefinitions entity definitions
   * @param {Array} parameterDefinitions parameter definitions
   */
  function compileFilterDefinitionRules(
    definition,
    groupOperator,
    entityDefinitions,
    parameterDefinitions,
  ) {
    return Promise.all(definition[groupOperator].map(async (rules, subIndex) => {
      const [ruleOperator] = Object.keys(rules);
      const interpretRuleValues = typeof rules[ruleOperator] === 'object'
        ? Object.entries(rules[ruleOperator]).map(([key, val]) => {
          if (key.startsWith('search_') || key.startsWith('prefix') || key.startsWith('suffix') || key.startsWith('left') || key.startsWith(ruleOperator)) {
            return ['leftValue', val];
          }
          if (key.startsWith('in_') || key.startsWith('right') || key.startsWith('value')) {
            return ['rightValue', val];
          }
          return [undefined, val];
        })
        : [['leftValue', rules[ruleOperator]], ['rightValue', undefined]];

      const { leftValue, rightValue } = Object.fromEntries(interpretRuleValues);
      const [rightValueName] = typeof rightValue === 'object' ? Object.values(rightValue) : [rightValue];
      let rightValueExistsInFilterVariables = false;

      if (rightValueName) {
        // This function populates the 'filterVariables' variable when it resolves
        await getFieldOptionsForFilters(ruleOperator, entityDefinitions, parameterDefinitions);
        rightValueExistsInFilterVariables = filterVariables.value[ruleOperator].find((values) => values.name.includes(rightValueName));
      }

      return {
        field: leftValue,
        operator: ruleOperator,
        uniqueIndex: subIndex,
        ...(rightValueName && { value: rightValueName }),
        ...(rightValueName && { selectedRightValueType: rightValueExistsInFilterVariables ? 'variable' : 'literal' }),
      };
    }));
  }

  /**
   * Interprets the API data into a UI friendly data set.
   * @param {Object} definition filter definition
   * @param {Array} entityDefinitions entity definitions
   * @param {Array} parameterDefinitions parameter definitions
   */
  function filterDefinitions(definition, entityDefinitions, parameterDefinitions) {
    if (definition && Object.keys(definition).length) {
      return Promise.all(Object.keys(definition).map(async (groupOperator, groupIndex) => ({
        _id: 'filter-group',
        operator: groupOperator,
        subfilters: await compileFilterDefinitionRules(
          definition,
          groupOperator,
          entityDefinitions,
          parameterDefinitions,
        ),
        uniqueIndex: groupIndex,
      })));
    }
    return [];
  }

  /**
   * Creates the payload for the left and right values that come from the
   * Query Filter Builder component.  It looks at the schema to determine structure.
   * @param {Object} selectedRightValueType filter definition
   * @param {Array} schema rule schema that comes from the report operators api call
   * @param {String} leftValue left value input
   * @param {String} ruleOperator rule operator selection
   * @param {String} rightValue right value input
   */
  function compileLeftAndRightValues(
    selectedRightValueType,
    schema,
    leftValue,
    ruleOperator,
    rightValue,
  ) {
    const leftValueEntity = entityColumns.value.find((column) => column.value === leftValue);
    const rightValueInputType = selectedRightValueType === 'variable'
      ? filterVariables.value[ruleOperator].find((obj) => obj.name.includes(rightValue))
      : { type: 'string', class: 'literal' };
    const hasMultipleLeftProperties = schema.filter((obj) => obj.left).length > 1;
    const hasMultipleRightProperties = schema.filter((obj) => obj.right).length > 1;
    const [schemaObj] = schema;
    // Defaults left and right keys to first object in schema
    let leftKey = schemaObj?.left?.value;
    let rightKey = schemaObj?.right?.value;

    // If the schema has multiple left or right property objects, the key
    // names are constructured below based on inferenced schema patterns.
    if (hasMultipleLeftProperties) {
      const prefix = 'search_';
      const itemType = leftValueEntity?.item?.type
        ? `${leftValueEntity.item.type}_`
        : '';
      const leftValueType = leftValueEntity.type;
      leftKey = prefix + itemType + leftValueType;
    }

    if (hasMultipleRightProperties) {
      const prefix = 'in_';
      const itemType = rightValueInputType?.item?.type
        ? `${rightValueInputType.item.type}_`
        : '';
      // The API is explicitly asking that we make a hard-coded exception
      // for a right value variable that is equal to 'string' to be 'query'.
      const rightValueType = rightValueInputType.type === 'string' ? 'query' : rightValueInputType.type;
      rightKey = prefix + itemType + rightValueType;
    }

    if (leftKey) {
      const rightValueStructured = rightValueInputType.class === 'parameter' || rightValueInputType.class === 'literal'
        ? { [rightValueInputType.class]: rightValue }
        : rightValue;
      return {
        [leftKey]: leftValue,
        ...(rightKey && { [rightKey]: rightValueStructured }),
      };
    }
    return leftValue;
  }

  /**
   * Interprets the UI data into an API friendly payload for each filter rule.
   * @param {Array} definitions list of filter definitions
   * @returns {Object}
   */
  function filtersPayload(definitions) {
    const [filterDefinition] = definitions;
    if (filterDefinition) {
      const { operator: groupOperator, subfilters } = filterDefinition;
      return {
        filter: {
          [groupOperator]: subfilters.map((sub) => {
            const {
              field: leftValue,
              operator: ruleOperator,
              selectedRightValueType,
              value: rightValue,
            } = sub;
            const { schema } = conditionalsFromApi.value.find((condition) => condition.name === ruleOperator);
            return {
              [ruleOperator]: compileLeftAndRightValues(
                selectedRightValueType,
                schema,
                leftValue,
                ruleOperator,
                rightValue,
              ),
            };
          }),
        },
      };
    }
    return {};
  }

  // Fetches report operators for building custom query filters
  async function fetchReportOperators() {
    conditionalsFromApi.value = await getReportOperators();
  }

  const reportConditionals = computed(() => conditionalsFromApi.value.map(({ displayName, name, schema }) => ({
    [name]: { label: displayName, value: name, type: schema },
  })).reduce((a, c) => ({ ...a, ...c }), {}));

  const filterVariableOptions = computed(() => Object.keys(filterVariables.value).map((varKey) => ({
    [varKey]: filterVariables.value[varKey].map(({ name }) => name),
  })).reduce((a, c) => ({ ...a, ...c }), {}));

  return {
    fetchReportOperators,
    filterDefinitions,
    filterVariableOptions,
    filtersPayload,
    getFieldOptionsForFilters,
    reportConditionals,
  };
}
