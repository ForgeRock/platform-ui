/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useReportEntities from './ReportEntities';
import useReportFilters from './ReportFilters';
import useReportParameters from './ReportParameters';

describe('@useReportFilters', () => {
  AutoApi.getReportParameterTypes = jest.fn().mockReturnValue(Promise.resolve({
    data: [
      {
        description: 'String',
        label: 'String',
        type: 'string',
      },
      {
        description: 'Boolean',
        label: 'Boolean',
        type: 'boolean',
      },
    ],
  }));

  AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      'applications.name': {
        class: 'json',
        type: 'string',
      },
      'applications._id': {
        class: 'json',
        type: 'string',
      },
      'My first parameter': {
        class: 'parameter',
        description: 'Help text for my first parameter',
        label: 'My input label',
        source: 'basic',
        type: 'string',
      },
      agg1: {
        class: 'parameter',
        description: 'Help text for my first parameter',
        label: 'agg1',
        source: 'basic',
        type: 'multivalued',
      },
      agg2: {
        class: 'parameter',
        description: 'Help text for my first parameter',
        label: 'agg2',
        source: 'basic',
        type: 'string',
      },
    },
  }));

  const reportOperators = [
    {
      displayName: 'in',
      name: 'in',
      schema: [
        {
          left: { value: 'search_string' },
          right: { value: 'in_string_array' },
        },
        {
          left: { value: 'search_integer' },
          right: { value: 'in_integer_array' },
        },
        {
          left: { value: 'search_string' },
          right: { value: 'in_string' },
        },
      ],
    },
    {
      displayName: 'greater than or equal to',
      name: 'gte',
      schema: [
        {
          left: { value: 'left' },
          right: { value: 'right' },
        },
      ],
    },
    {
      displayName: 'starts with',
      name: 'starts_with',
      schema: [{
        left: { value: 'prefix' },
        right: { value: 'right' },
      }],
    },
    {
      displayName: 'not ends with',
      name: 'not_ends_with',
      schema: [{
        left: { value: 'suffix' },
        right: { value: 'right' },
      }],
    },
    {
      displayName: 'is null',
      name: 'is_null',
      schema: [{ left: {} }],
    },
  ];

  AutoApi.getReportOperators = jest.fn().mockReturnValue(Promise.resolve(reportOperators));

  const entityColumns = ref([
    {
      format: 'json',
      label: 'Name',
      type: 'string',
      path: 'applications.name',
    },
    {
      format: 'json',
      label: '_id',
      type: 'string',
      path: 'applications._id',
    },
  ]);

  const { entitiesPayload } = useReportEntities();
  const { parameterDefinitions, parametersPayload } = useReportParameters();
  const {
    fetchReportOperators,
    filterDefinitions,
    filtersPayload,
    reportConditionals,
  } = useReportFilters(entityColumns, entitiesPayload, parametersPayload);

  describe('@unit', () => {
    const apiDefinitionContainsLiteral = {
      or: [
        {
          in: {
            search_string: 'applications.name',
            in_string_array: { literal: ['My literal value'] },
          },
        },
        {
          and: [{
            in: {
              search_string: 'applications._id',
              in_string_array: { literal: ['My _id literal value'] },
            },
          }],
        },
      ],
    };

    const entityDefinitions = [
      {
        name: 'applications',
        dataSourceColumns: [
          {
            format: 'json',
            label: 'Name',
            type: 'string',
            path: 'applications.name',
          },
          {
            format: 'json',
            label: '_id',
            type: 'string',
            path: 'applications._id',
          },
        ],
        relatedDataSources: [],
        selectedColumns: [{ path: 'applications.name', order: 0 }],
        selectedRelatedDataSources: [],
      },
    ];

    it('constructs a UI friendly definition object from API data', async () => {
      await fetchReportOperators();
      const definitions = await filterDefinitions(apiDefinitionContainsLiteral, entityDefinitions, {});
      expect(definitions).toEqual([{
        operator: 'or',
        subfilters: [
          {
            field: 'applications.name',
            fieldType: 'multiselect',
            operator: 'in',
            selectedRightValueType: 'literal',
            uniqueIndex: 0,
            value: ['My literal value'],
          },
          {
            operator: 'and',
            subfilters: [{
              field: 'applications._id',
              fieldType: 'multiselect',
              operator: 'in',
              selectedRightValueType: 'literal',
              uniqueIndex: 0,
              value: ['My _id literal value'],
            }],
            uniqueIndex: 0,
          },
        ],
        uniqueIndex: 0,
      }]);
    });

    it('outputs a UI friendly data set for the variable options field', async () => {
      const [contains, gte, startsWith, notEndsWith, isNull] = reportOperators;
      await fetchReportOperators();

      expect(reportConditionals.value).toEqual({
        [contains.name]: {
          label: contains.displayName,
          type: contains.schema,
          value: contains.name,
        },
        [gte.name]: {
          label: gte.displayName,
          type: gte.schema,
          value: gte.name,
        },
        [startsWith.name]: {
          label: startsWith.displayName,
          type: startsWith.schema,
          value: startsWith.name,
        },
        [notEndsWith.name]: {
          label: notEndsWith.displayName,
          type: notEndsWith.schema,
          value: notEndsWith.name,
        },
        [isNull.name]: {
          label: isNull.displayName,
          type: isNull.schema,
          value: isNull.name,
        },
      });
    });

    describe('@payload', () => {
      it('outputs an expected payload for a literal value', async () => {
        const definitions = await filterDefinitions(apiDefinitionContainsLiteral, entityDefinitions, {});

        expect(filtersPayload(definitions)).toEqual({
          filter: apiDefinitionContainsLiteral,
        });
      });

      it('outputs an expected payload for a rule that contains all the supplied report operator variations', async () => {
        AutoApi.getReportParameterTypes = jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              description: 'String',
              label: 'String',
              type: 'string',
            },
            {
              description: 'Boolean',
              label: 'Boolean',
              type: 'boolean',
            },
          ],
        }));

        const apiDefinitionContainsVariable = {
          or: [
            {
              in: {
                search_string: 'applications.name',
                in_query: { parameter: 'agg2' },
              },
            },
            {
              gte: {
                left: 'applications.name',
                right: 'applications.name',
              },
            },
            {
              starts_with: {
                prefix: 'applications.name',
                right: { parameter: 'agg1' },
              },
            },
            {
              in: {
                search_string: 'applications.name',
                in_query: 'applications._id',
              },
            },
            { is_null: 'applications._id' },
          ],
        };
        const paramDefs = {
          agg1: {
            source: 'basic',
            label: 'agg1',
            description: '',
            type: 'array',
            item: { type: 'string' },
          },
          agg2: {
            source: 'basic',
            label: 'agg2',
            description: '',
            type: 'string',
          },
        };
        const definitions = await filterDefinitions(apiDefinitionContainsVariable, entityDefinitions, parameterDefinitions(paramDefs));

        expect(filtersPayload(definitions)).toEqual({
          filter: apiDefinitionContainsVariable,
        });
      });
    });
  });
});
