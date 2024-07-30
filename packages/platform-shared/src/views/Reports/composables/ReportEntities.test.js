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
    dataSources,
    entitiesPayload,
    fetchReportEntities,
  } = useReportEntities();

  AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [
        {
          name: 'applications',
          label: 'applications',
          relatedEntities: [{
            name: 'roles',
            label: 'roles',
          },
          {
            name: 'assignments',
            label: 'assignments',
          }],
        },
        {
          name: 'Users',
          label: 'Users',
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

  const entitiesStub = [{ entity: 'applications' }, { entity: 'applications.roles', type: 'left' }];
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
      relatedDataSources: [{
        name: 'assignments',
        label: 'assignments',
      },
      {
        name: 'roles',
        label: 'roles',
      }],
      selectedColumns: ['applications.name'],
      selectedRelatedDataSources: [],
    },
    {
      dataSource: 'applications.roles',
      dataSourceColumns: [
        {
          label: 'Application Role ID',
          value: 'applications.roles._id',
          format: 'json',
          type: 'string',
        },
      ],
      joinType: 'left',
      relatedDataSources: [{ name: 'groups', label: 'groups' }],
      selectedColumns: ['applications.roles._id'],
      selectedRelatedDataSources: [],
    },
  ];

  describe('@unit', () => {
    it('gets the expected list of report entities', async () => {
      await fetchReportEntities();
      expect(dataSources.value).toEqual([
        {
          text: 'Users',
          value: 'Users',
        },
        {
          text: 'applications',
          value: 'applications',
        },
      ]);
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

      const definitions = await entityDefinitions([{ entity: 'applications' }], [{ label: 'Applications Name', value: 'applications.name' }]);
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
          relatedDataSources: [{
            name: 'roles',
            label: 'roles',
          },
          {
            name: 'assignments',
            label: 'assignments',
          }],
          selectedColumns: ['applications.name'],
          selectedRelatedDataSources: [],
        },
      ]);
    });

    it('constructs a list of UI friendly related entity definitions from API data', async () => {
      AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          'roles._id': {
            class: 'json',
            label: 'Role ID',
            type: 'string',
          },
          'roles.name': {
            class: 'json',
            label: 'Role Name',
            type: 'string',
          },
        },
      }));

      const getReportFieldOptionsSpy = jest.spyOn(AutoApi, 'getReportFieldOptions');

      const definitions = await entityDefinitions(
        [{ entity: 'applications.roles' }],
        [{ label: 'Application Roles', value: 'applications.roles.name' }],
      );
      expect(getReportFieldOptionsSpy).toHaveBeenCalledWith({
        entities: [{
          entity: 'roles',
        }],
        fields: [{
          value: {
            options: {},
          },
        }],
      });
      expect(definitions).toEqual([
        {
          dataSource: 'applications.roles',
          dataSourceColumns: ref([
            {
              label: 'Role ID',
              value: 'applications.roles._id',
              format: 'json',
              type: 'string',
            },
            {
              label: 'Role Name',
              value: 'applications.roles.name',
              format: 'json',
              type: 'string',
            },
          ]),
          joinType: 'left',
          relatedDataSources: [],
          selectedColumns: ['applications.roles.name'],
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
        },
        {
          label: 'Application Role ID',
          value: 'applications.roles._id',
        }],
      });
    });
  });
});
