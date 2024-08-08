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
        column_label: 'Application Name column label',
        label: 'application name label',
      },
      'applications._id': {
        class: 'json',
        type: 'string',
        column_label: 'Application Id column label',
        label: 'application id label',
      },
    },
  }));

  const entitiesStub = [{ entity: 'applications' }, { entity: 'applications.roles', type: 'left' }];
  const definitionsUIDataStructureStub = [
    {
      dataSource: 'applications',
      dataSourceColumns: [
        {
          columnLabel: 'Application Role ID columnLabel',
          label: 'Applications ID',
          path: 'applications._id',
          format: 'json',
          type: 'string',
        },
        {
          columnLabel: 'Application Name columnLabel',
          label: 'Applications Name',
          path: 'applications.name',
          format: 'json',
          type: 'string',
        },
      ],
      relatedDataSources: [{
        name: 'assignments',
        label: 'Assignments',
      },
      {
        name: 'roles',
        label: 'Roles',
      }],
      selectedColumns: ['applications.name'],
      selectedRelatedDataSources: [],
    },
    {
      dataSource: 'applications.roles',
      dataSourceColumns: [
        {
          columnLabel: 'Application Role ID columnLabel',
          label: 'Application Role ID',
          path: 'applications.roles._id',
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
            column_label: 'Application Id column label',
            type: 'string',
          },
          'applications.name': {
            class: 'json',
            label: 'Applications Name',
            column_label: 'Application Name column label',
            type: 'string',
          },
        },
      }));

      AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          result: [
            {
              name: 'applications.users',
              label: 'Users',
            },
            {
              name: 'applications.owners',
              label: 'Owners',
            },
          ],
        },
      }));

      const getReportFieldOptionsSpy = jest.spyOn(AutoApi, 'getReportFieldOptions');
      const definitions = await entityDefinitions([{ entity: 'applications' }], [{ label: 'Applications Name', value: 'applications.name' }]);
      expect(getReportFieldOptionsSpy).toHaveBeenCalledWith({
        entities: [{
          entity: 'applications',
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
              columnLabel: 'Application Id column label',
              label: 'Applications ID',
              path: 'applications._id',
              format: 'json',
              type: 'string',
            },
            {
              columnLabel: 'Applications Name',
              label: 'Applications Name',
              path: 'applications.name',
              format: 'json',
              type: 'string',
            },
          ]),
          relatedDataSources: [{
            name: 'applications.owners',
            label: 'Owners',
          },
          {
            name: 'applications.users',
            label: 'Users',
          }],
          selectedColumns: ['applications.name'],
          selectedRelatedDataSources: [],
        },
      ]);
    });

    it('constructs a list of UI friendly related entity definitions from API data', async () => {
      AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          'applications.roles._id': {
            class: 'json',
            label: 'Role ID',
            column_label: 'Role Id column label',
            type: 'string',
          },
          'applications.roles.name': {
            class: 'json',
            label: 'Role Name',
            column_label: 'Role Name column label',
            type: 'string',
          },
        },
      }));

      AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          result: [],
        },
      }));

      const getReportFieldOptionsSpy = jest.spyOn(AutoApi, 'getReportFieldOptions');

      const definitions = await entityDefinitions(
        [{ entity: 'applications.roles' }],
        [{ label: 'Application Roles', value: 'applications.roles.name' }],
      );
      expect(getReportFieldOptionsSpy).toHaveBeenCalledWith({
        entities: [{
          entity: 'applications.roles',
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
              columnLabel: 'Role Id column label',
              label: 'Role ID',
              path: 'applications.roles._id',
              format: 'json',
              type: 'string',
            },
            {
              columnLabel: 'Application Roles',
              label: 'Role Name',
              path: 'applications.roles.name',
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
          label: 'Application Name columnLabel',
          value: 'applications.name',
        },
        {
          label: 'Application Role ID columnLabel',
          value: 'applications.roles._id',
        }],
      });
    });
  });
});
