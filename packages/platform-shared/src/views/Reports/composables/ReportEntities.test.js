/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useReportEntities from './ReportEntities';

describe('@useReportEntities', () => {
  const {
    entityDefinitions,
    entityOptions,
    entitiesPayload,
    fetchReportEntities,
  } = useReportEntities();

  autoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [
        {
          name: 'applications',
          relatedEntities: ['Application_Users', 'assignments', 'roles'],
        },
        {
          name: 'Users',
        },
      ],
    },
  }));

  const entitiesStub = [{ entity: 'applications' }];
  const fieldsStub = [{
    label: 'name',
    value: 'applications.name',
  }];
  const definitionsUIDataStructureStub = [
    {
      _id: entitiesStub[0].entity,
      dataSourceColumns: [
        ...fieldsStub,
        { label: '_id', value: 'applications._id' },
      ],
      name: entitiesStub[0].entity,
      relatedEntities: [],
      selectedColumns: fieldsStub,
      selectedRelatedEntities: [],
    },
  ];

  describe('@unit', () => {
    it('gets the expected list of report entities', async () => {
      await fetchReportEntities();
      expect(entityOptions.value).toEqual(['applications', 'Users']);
    });

    it('constructs a list of entity definitions from an entity name and corresponding API data', async () => {
      autoApi.getReportEntityFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
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

      const getReportEntityFieldOptionsSpy = jest.spyOn(autoApi, 'getReportEntityFieldOptions');

      const definitions = await entityDefinitions(entitiesStub, fieldsStub);
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
        fields: definitionsUIDataStructureStub[0].selectedColumns,
      });
    });
  });
});
