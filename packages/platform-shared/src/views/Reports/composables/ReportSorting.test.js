/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useReportSorting from './ReportSorting';

const sortFieldOptionsResponse = [
  {
    class: 'json',
    value: 'applications._id',
    type: 'string',
  },
  {
    class: 'json',
    value: 'applications.name',
    type: 'string',
  },
];
const sortDefinitionDataFromAPI = [{ value: 'applications.name', direction: 'asc' }];
const uiSortDefinitions = [{ sortBy: 'applications.name', direction: 'asc' }];

describe('@useReportSorting', () => {
  const {
    getFieldOptionsForSorting,
    sortByValues,
    sortingDefinitions,
    sortingPayload,
  } = useReportSorting(() => ({}), () => ({}), () => ({}), () => ({}));

  describe('@unit', () => {
    it('fetches sort field options and ensures that the sortByValues variable outputs expected data', async () => {
      AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          'applications._id': { class: 'json', type: 'string' },
          'applications.name': { class: 'json', type: 'string' },
        },
      }));

      await getFieldOptionsForSorting();
      expect(sortByValues.value).toEqual(sortFieldOptionsResponse);
    });

    it('outputs a UI friendly data set for sorting definitions from previously saved template data retrieved from the API', async () => {
      const expectedDefinition = await sortingDefinitions(sortDefinitionDataFromAPI);
      expect(expectedDefinition).toEqual(uiSortDefinitions);
    });

    it('outputs an API friendly payload with the provided definition UI form data list', async () => {
      const expectedPayload = { sort: sortDefinitionDataFromAPI };
      expect(sortingPayload(uiSortDefinitions)).toEqual(expectedPayload);
    });
  });
});
