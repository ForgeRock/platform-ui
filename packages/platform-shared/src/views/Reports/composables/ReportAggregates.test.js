/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useReportAggregates from './ReportAggregates';

const aggregateTypesResponse = [
  {
    displayName: 'Count of specific rows',
    name: 'count',
    schema: [],
  },
  {
    displayName: 'Sum of specific rows',
    name: 'sum',
    schema: [],
  },
  {
    displayName: 'Distinct Count of specific rows',
    name: 'count_distinct',
    schema: [],
  },
];

const aggregateDefinitionsFromAPI = {
  fields: [{
    label: 'agg1',
    aggregate: { sum: 'applications.name' },
  }],
};

const uiAggregateDefinitions = [{
  label: 'agg1',
  type: 'sum',
  value: 'applications.name',
}];

describe('@useReportAggregates', () => {
  const {
    aggregateDefinitions,
    aggregatesPayload,
    aggregateTypes,
    aggregateValueList,
    fetchAggregateTypes,
    getFieldOptionsForAggregates,
  } = useReportAggregates(() => ({}), () => ({}), () => ({}));

  AutoApi.getAggregateTypes = jest.fn().mockReturnValue(Promise.resolve(aggregateTypesResponse));

  AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      'applications._id': { class: 'json', type: 'string' },
      'applications.name': { class: 'json', type: 'string' },
    },
  }));

  describe('@unit', () => {
    it('fetches aggregate types and ensures that the aggregateTypes variable outputs expected data', async () => {
      await fetchAggregateTypes();
      expect(aggregateTypes.value).toEqual(aggregateTypesResponse);
    });

    it('outputs a UI friendly data set for aggregate definitions from previously saved template data retrieved from the API', async () => {
      const expectedDefinition = await aggregateDefinitions(aggregateDefinitionsFromAPI);
      expect(expectedDefinition).toEqual(uiAggregateDefinitions);
    });

    it('computes a list of options for the value select field by querying the API "fieldoptions" endpoint based on the "aggregate type" operator selection', async () => {
      await getFieldOptionsForAggregates('sum', {}, {}, {});
      // Array values should match the keys of the AutoApi.getAggregateTypes response object;
      expect(aggregateValueList.value).toEqual({
        sum: ['applications._id', 'applications.name'],
      });
    });

    describe('@payload', () => {
      it('outputs an API friendly payload with the provided definition UI form data', async () => {
        const expectedPayload = {
          aggregate: {
            fields: [{
              aggregate: { sum: 'applications.name' },
              label: 'agg1',
            }],
          },
        };

        expect(aggregatesPayload(uiAggregateDefinitions)).toEqual(expectedPayload);
      });
    });
  });
});
