/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useReportEntities from './ReportEntities';

describe('@useReportEntities', () => {
  const {
    entityDefinitions,
    dataSourceColumnCheckboxNames,
    entitiesPayload,
    fetchReportEntities,
  } = useReportEntities();

  AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [
        {
          name: 'applications',
          relatedDataSources: ['roles', 'assignments'],
        },
        {
          name: 'Users',
        },
      ],
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
    },
  }));

  const entitiesStub = [{ entity: 'applications', name: 'applications' }];
  const definitionsUIDataStructureStub = [
    {
      _id: entitiesStub[0].entity,
      dataSourceColumns: [
        {
          label: 'name',
          value: 'applications.name',
          format: 'json',
          type: 'string',
        },
        {
          label: '_id',
          value: 'applications._id',
          format: 'json',
          type: 'string',
        },
      ],
      name: entitiesStub[0].entity,
      relatedDataSources: [],
      selectedColumns: ['applications.name'],
      selectedRelatedDataSources: [],
    },
  ];

  describe('@unit', () => {
    it('gets the expected list of report entities', async () => {
      await fetchReportEntities();
      expect(dataSourceColumnCheckboxNames.value).toEqual(['applications', 'Users']);
    });

    it('constructs a list of entity definitions from an entity name and corresponding API data', async () => {
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
        },
      }));

      const getReportEntityFieldOptionsSpy = jest.spyOn(AutoApi, 'getReportEntityFieldOptions');

      const definitions = await entityDefinitions(entitiesStub, [{ label: 'name', value: 'applications.name' }]);
      expect(getReportEntityFieldOptionsSpy).toHaveBeenCalledWith({
        entities: [{
          name: entitiesStub[0].entity,
          entity: entitiesStub[0].entity,
        }],
        fields: [{
          name: entitiesStub[0].entity,
          value: {
            options: {},
          },
        }],
      });
      expect(definitions).toEqual(definitionsUIDataStructureStub);
    });

    it('Creates an API friendly payload for entities', () => {
      const payload = entitiesPayload(definitionsUIDataStructureStub);
      expect(payload).toEqual({
        entities: entitiesStub,
        fields: [{
          label: 'name',
          value: 'applications.name',
        }],
      });
    });
  });
});
