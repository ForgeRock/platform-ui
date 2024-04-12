/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as ReportsUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
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

  ReportsUtils.getManagedObject = jest.fn().mockReturnValue(Promise.resolve({
    schema: {
      properties: {
        _id: { description: 'User ID', type: 'string' },
        name: { description: 'User Name', type: 'string' },
        group: { description: 'User Group', type: 'array' },
      },
    },
  }));

  AutoApi.getReportEntityFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
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
        source: 'user_provided',
        type: 'string',
      },
    },
  }));

  AutoApi.getReportOperators = jest.fn().mockReturnValue(Promise.resolve([{
    displayName: 'contains',
    name: 'contains',
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
  }]));

  const entityColumns = ref([
    {
      format: 'json',
      label: 'Name',
      type: 'string',
      value: 'applications.name',
    },
    {
      format: 'json',
      label: '_id',
      type: 'string',
      value: 'applications._id',
    },
  ]);

  const { entitiesPayload } = useReportEntities();
  const { parametersPayload } = useReportParameters();
  const {
    fetchReportOperators,
    filterDefinitions,
    filtersPayload,
    reportConditionals,
  } = useReportFilters(entityColumns, entitiesPayload, parametersPayload);

  describe('@unit', () => {
    const apiDefinitionContainsLiteral = {
      or: [{
        contains: {
          search_string: 'applications.name',
          in_query: { literal: 'my literal value' },
        },
      }],
    };

    const entityDefinitions = [
      {
        _id: 'applications',
        name: 'applications',
        dataSourceColumns: [
          {
            format: 'json',
            label: 'Name',
            type: 'string',
            value: 'applications.name',
          },
          {
            format: 'json',
            label: '_id',
            type: 'string',
            value: 'applications._id',
          },
        ],
        relatedDataSources: [],
        selectedColumns: ['applications.name'],
        selectedRelatedDataSources: [],
      },
    ];

    it('constructs a UI friendly definition object from API data', async () => {
      const definitions = await filterDefinitions(apiDefinitionContainsLiteral, entityDefinitions, {});
      expect(definitions).toEqual([{
        _id: 'filter-group',
        operator: 'or',
        subfilters: [{
          field: 'applications.name',
          operator: 'contains',
          selectedRightValueType: 'literal',
          uniqueIndex: 0,
          value: 'my literal value',
        }],
        uniqueIndex: 0,
      }]);
    });

    it('outputs a UI friendly data set for the variable options field', async () => {
      await fetchReportOperators();
      expect(reportConditionals.value).toEqual({
        contains: {
          label: 'contains',
          type: [
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
          value: 'contains',
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

      it('outputs an expected payload for a variable value', async () => {
        const apiDefinitionContainsVariable = {
          or: [{
            contains: {
              search_string: 'applications._id',
              in_query: 'applications.name',
            },
          }],
        };
        const definitions = await filterDefinitions(apiDefinitionContainsVariable, entityDefinitions, {});

        expect(filtersPayload(definitions)).toEqual({
          filter: apiDefinitionContainsVariable,
        });
      });
    });
  });
});
