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
    label: 'Applications ID',
    columnLabel: 'Applications ID column label',
    type: 'string',
  },
  {
    class: 'json',
    value: 'applications.name',
    label: 'Applications Name',
    columnLabel: 'Applications Name column label',
    type: 'string',
  },
];
const sortDefinitionDataFromAPI = [{ value: 'applications.name', direction: 'asc', label: 'Applications Name column label' }];
const uiSortDefinitions = [{ direction: 'asc', value: 'applications.name', columnLabel: 'Applications Name column label' }];

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
          'applications._id': {
            class: 'json',
            type: 'string',
            label: 'Applications ID',
            column_label: 'Applications ID column label',
          },
          'applications.name': {
            class: 'json',
            type: 'string',
            label: 'Applications Name',
            column_label: 'Applications Name column label',
          },
          MyParameter: { class: 'parameter', type: 'string', label: 'My Parameter' },
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
