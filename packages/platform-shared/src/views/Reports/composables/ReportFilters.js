/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed, ref } from 'vue';
import { getReportOperators, getReportFieldOptions } from '@forgerock/platform-shared/src/api/AutoApi';
import useReportSettings from './ReportSettings';

export default function useReportFilters(entityColumns, entitiesPayload, parametersPayload) {
  const { sortCompare } = useReportSettings();
  const conditionalsFromApi = ref([]);
  const filterVariables = ref({});

  /**
   * Gets necessary data for the report filters setting modal
   * @param {String} operator operator condition
   * @param {Array} entityDefinitions entity definitions
   * @param {Array} parameterDefinitions parameter definitions
   */
  async function getFieldOptionsForFilters(operator, entityDefinitions, parameterDefinitions) {
    const includeRightOption = operator !== 'is_null' && operator !== 'is_not_null';
    const fieldOptionsBody = {
      ...entitiesPayload(entityDefinitions),
      ...parametersPayload(parameterDefinitions),
      filter: {
        [operator]: {
          left: { options: {} },
          ...(includeRightOption && { right: { options: {} } }),
        },
      },
    };
    const { data } = await getReportFieldOptions(fieldOptionsBody);

    filterVariables.value[operator] = Object.keys(data).map((key) => {
      const {
        class: category,
        label,
        type,
        item,
      } = data[key];
      return {
        class: category,
        label: label || key,
        type,
        value: key,
        ...(item && { item }),
      };
    }).sort((a, b) => sortCompare(a, b, 'value'));

    return Promise.resolve();
  }

  /**
   * Creates a list of filter rules from user input
   * @param {Object} rules filter rules
   * @param {Array} entityDefinitions entity definitions
   * @param {Array} parameterDefinitions parameter definitions
   * @param {Number} subIndex index for each rule
   */
  async function compileFilterDefinitionRules(
    rules,
    entityDefinitions,
    parameterDefinitions,
    subIndex,
  ) {
    const [ruleOperator] = Object.keys(rules);
    const { schema } = conditionalsFromApi.value.find(({ name }) => name === ruleOperator);
    const [conditionalKeys] = schema;
    const interpretRuleValues = typeof rules[ruleOperator] === 'object'
      ? Object.entries(rules[ruleOperator]).map(([key, val]) => {
        // The schema left.value and right.value property values
        // are what determines the left and right payload keys.
        if (conditionalKeys.left.value === key) {
          return ['leftValue', val];
        }
        return ['rightValue', val];
      })
      : [['leftValue', rules[ruleOperator]]];

    const { leftValue, rightValue } = Object.fromEntries(interpretRuleValues);
    const [rightValueName] = typeof rightValue === 'object' ? Object.values(rightValue) : [rightValue];
    let rightValueExistsInFilterVariables = false;

    if (rightValueName) {
      // This function populates the 'filterVariables' variable when it resolves
      await getFieldOptionsForFilters(ruleOperator, entityDefinitions, parameterDefinitions);
      rightValueExistsInFilterVariables = filterVariables.value[ruleOperator].find(({ value }) => value.includes(rightValueName));
    }

    return {
      field: leftValue,
      operator: ruleOperator,
      uniqueIndex: subIndex,
      ...(rightValueName && { value: rightValueName }),
      ...(rightValueName && { selectedRightValueType: rightValueExistsInFilterVariables ? 'variable' : 'literal' }),
    };
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
        operator: groupOperator,
        subfilters: await Promise.all(definition[groupOperator].map(async (rules, subIndex) => {
          const [ruleOperator] = Object.keys(rules);
          if (ruleOperator === 'and' || ruleOperator === 'or') {
            const [group] = await filterDefinitions(rules, entityDefinitions, parameterDefinitions);
            return group;
          }
          return compileFilterDefinitionRules(
            rules,
            entityDefinitions,
            parameterDefinitions,
            subIndex,
          );
        })),
        uniqueIndex: groupIndex,
      })));
    }
    return [];
  }

  /**
   * Creates the payload for the left and right values that come from the
   * Query Filter Builder component.  It references the schema to determine structure.
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
    const leftValueEntity = entityColumns.value.find((column) => column.path === leftValue);
    const rightValueInputType = selectedRightValueType === 'variable'
      ? filterVariables.value[ruleOperator].find(({ value }) => value.includes(rightValue))
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
      const leftValueType = leftValueEntity?.type;
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
   * Constructs an API payload for the filters setting.
   * @param {String} groupOperator group operator
   * @param {Array} subfilters filter rules list
   */
  function payloadStructure(groupOperator, subfilters) {
    return {
      [groupOperator]: subfilters.map((sub) => {
        const {
          field: leftValue,
          operator,
          selectedRightValueType,
          value: rightValue,
          subfilters: nestedSubfilters,
        } = sub;
        const { schema } = conditionalsFromApi.value.find((condition) => condition.name === operator) || {};

        if (nestedSubfilters) {
          return payloadStructure(operator, nestedSubfilters);
        }

        return {
          [operator]: compileLeftAndRightValues(
            selectedRightValueType,
            schema,
            leftValue,
            operator,
            rightValue,
          ),
        };
      }),
    };
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
        filter: payloadStructure(groupOperator, subfilters),
      };
    }
    return {};
  }

  // Fetches report operators for building custom query filters
  async function fetchReportOperators() {
    conditionalsFromApi.value = await getReportOperators();
  }

  const reportConditionals = computed(() => {
    const conditionalConstruct = conditionalsFromApi.value.map(({ displayName, name, schema }) => ({
      [name]: { label: displayName, value: name, type: schema },
    }));
    return Object.assign({}, ...conditionalConstruct);
  });

  const filterVariableOptions = computed(() => {
    const filterVariablesConstruct = Object.keys(filterVariables.value).map((varKey) => ({
      [varKey]: filterVariables.value[varKey].map(({ value }) => value),
    }));
    return Object.assign({}, ...filterVariablesConstruct);
  });

  return {
    fetchReportOperators,
    filterDefinitions,
    filterVariableOptions,
    filtersPayload,
    getFieldOptionsForFilters,
    reportConditionals,
  };
}
