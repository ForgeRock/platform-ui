/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
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
          relatedEntities: ['roles', 'assignments'],
        },
        {
          name: 'Users',
        },
      ],
    },
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
    },
  }));

  const entitiesStub = [{ entity: 'applications' }];
  const definitionsUIDataStructureStub = [
    {
      dataSource: 'applications',
      dataSourceColumns: [
        {
          label: 'Applications ID',
          value: 'applications._id',
          format: 'json',
          type: 'string',
        },
        {
          label: 'Applications Name',
          value: 'applications.name',
          format: 'json',
          type: 'string',
        },
      ],
      relatedDataSources: ['roles', 'assignments'],
      selectedColumns: ['applications.name'],
      selectedRelatedDataSources: [],
    },
  ];

  describe('@unit', () => {
    it('gets the expected list of report entities', async () => {
      await fetchReportEntities();
      expect(dataSourceColumnCheckboxNames.value).toEqual(['Users', 'applications']);
    });

    it('constructs a list of entity definitions from an entity name and corresponding API data', async () => {
      AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          'applications._id': {
            class: 'json',
            label: 'Applications ID',
            type: 'string',
          },
          'applications.name': {
            class: 'json',
            label: 'Applications Name',
            type: 'string',
          },
        },
      }));

      const getReportFieldOptionsSpy = jest.spyOn(AutoApi, 'getReportFieldOptions');

      const definitions = await entityDefinitions(entitiesStub, [{ label: 'Applications Name', value: 'applications.name' }]);
      expect(getReportFieldOptionsSpy).toHaveBeenCalledWith({
        entities: [{
          entity: entitiesStub[0].entity,
        }],
        fields: [{
          value: {
            options: {},
          },
        }],
      });
      expect(definitions).toEqual([
        {
          dataSource: 'applications',
          dataSourceColumns: ref([
            {
              label: 'Applications ID',
              value: 'applications._id',
              format: 'json',
              type: 'string',
            },
            {
              label: 'Applications Name',
              value: 'applications.name',
              format: 'json',
              type: 'string',
            },
          ]),
          relatedDataSources: ['roles', 'assignments'],
          selectedColumns: ['applications.name'],
          selectedRelatedDataSources: [],
        },
      ]);
    });

    it('Creates an API friendly payload for entities', () => {
      const payload = entitiesPayload(definitionsUIDataStructureStub);
      expect(payload).toEqual({
        entities: entitiesStub,
        fields: [{
          label: 'Applications Name',
          value: 'applications.name',
        }],
      });
    });
  });
});
